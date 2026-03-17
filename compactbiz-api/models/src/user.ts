import { AfterInsert, AfterLoad, AfterUpdate, Check, Column, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";
import { BadRequestError, ForbiddenError, UnauthorizedError } from "routing-controllers";
import { Address } from "./address";
import { BaseModel } from "./baseModel";
import { getErrorMessages, randomPin, round, trimAndLowerCase, validPhone, validator } from "./util";
import { TokenGenerator } from "./tokenGenerator";
import { Facility } from "./facility";
import { Role } from "../enums";
import { CryptoGenerator } from "./cryptoGenerator";
import { Location } from "./location";
import { MiniFacility } from ".";

@Entity()
@Check("user_password_required_unless_staff", `"password" IS NOT NULL OR ("employeedById" IS NOT NULL AND verified = false)`)
export class User extends BaseModel<UserKey> implements UserKey {

    constructor() {
        super();
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    @IsEmail({ ignore_max_length: false, require_tld: true, allow_ip_domain: false })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @Column({ nullable: true, unique: true })
    phone?: string;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "First name is required" })
    firstName: string;

    @Column({ nullable: true })
    middleName?: string;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Last name is required" })
    lastName: string;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "Password is required" })
    password: string;

    @Column({ default: Role.Guest })
    role: Role;

    @Column({ default: false })
    verified: boolean;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @Column({ nullable: true })
    tempPin?: string; // save encrypted

    @Column({ nullable: true, type: "timestamptz" })
    tempPinExpirationDate?: Date;

    @Column({ nullable: true })
    refreshToken?: string;

    @Column({ nullable: true })
    employeedById?: number;

    @OneToOne(() => Location, l => l.driver, { onDelete: "SET NULL", onUpdate: "NO ACTION" })
    @Type(() => Location)
    location: Location;

    @ManyToMany(() => Facility, f => f.staff, { persistence: true })
    @Type(() => Facility)
    facilities: Facility[];

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    public removeSensitiveData(): void {
        // @ts-ignore
        delete this.password;
        // @ts-ignore
        delete this.refreshToken;
        // @ts-ignore
        delete this.tempPin;
        // @ts-ignore
        delete this.tempPinExpirationDate;
    }

    public get identity(): string {
        return this.generateIdentity(this.id);
    }

    public get key(): UserKey {
        return {
            id: this.id
        };
    }

    public static parse(identity: string): UserKey {
        return this.parseIdentity(identity, "id");
    }

    public toString(): string {
        return [this.firstName, this.middleName, this.lastName].filter(x => x).join(" ");
    }

    public static create(userBody: Partial<User>): User {
        const user = new User();
        user.email = trimAndLowerCase(userBody.email) as any;
        user.setPhone(userBody.phone);
        user.firstName = userBody.firstName || null as any;
        user.middleName = userBody.middleName || null as any;
        user.lastName = userBody.lastName || null as any;
        user.address = Address.create(userBody.address);
        user.password = userBody.password || null as any;
        user.role = userBody.role || null as any;
        validator(user);
        // Exclamation mark is present because of validator ensure that password exist
        const cryptoGenerator = new CryptoGenerator();
        user.password = cryptoGenerator.hash(user.password!);
        return user;
    }

    public static createStaff(employeedById: number, userBody: Partial<User>): User {
        const user = new User();
        user.employeedById = employeedById;
        user.email = trimAndLowerCase(userBody.email) as any;
        user.setPhone(userBody.phone);
        user.firstName = userBody.firstName || null as any;
        user.lastName = userBody.lastName || null as any;
        user.role = userBody.role || null as any;
        validator(user, ["password"]);
        return user;
    }

    public update(userBody: Partial<User>): void {
        this.setPhone(userBody.phone);
        this.firstName = userBody.firstName || null as any;
        this.middleName = userBody.middleName || null as any;
        this.lastName = userBody.lastName || null as any;
        this.role = userBody.role || null as any;
        this.address.update(userBody.address);
        validator(this, ["email", "password"]);
    }

    public verify(tempPin: string, password?: string): void {
        if (!this.verified) {
            if (!tempPin) {
                throw new MissingCredentials();
            }
            if (!this.tempPin || !this.tempPinExpirationDate || this.tempPinExpirationDate.getTime() < new Date().getTime()) {
                throw new TemporaryPinExpired();
            }
            const cryptoGenerator = new CryptoGenerator();
            const isValidTempPin = cryptoGenerator.compareRawWithHash(tempPin, this.tempPin);
            if (!isValidTempPin) {
                throw new InvalidCredentials();
            }
            if (this.employeedById && password) {
                this.password = cryptoGenerator.hash(password);
            }
            this.verified = true;
            this.tempPin = null as any;
            this.tempPinExpirationDate = null as any;
        }
    }

    public changePassword(tempPin: string, newPassword: string): void {
        if (!tempPin) {
            throw new MissingCredentials();
        }
        if (!newPassword) {
            throw new MissingCredentials();
        }
        if (!this.tempPin || !this.tempPinExpirationDate || this.tempPinExpirationDate.getTime() < new Date().getTime()) {
            throw new TemporaryPinExpired();
        }
        const cryptoGenerator = new CryptoGenerator();
        const isValidTempPin = cryptoGenerator.compareRawWithHash(tempPin, this.tempPin);
        if (!isValidTempPin) {
            throw new InvalidCredentials();
        }
        this.password = cryptoGenerator.hash(newPassword);
        this.tempPin = null as any;
        this.tempPinExpirationDate = null as any;
    }

    public setTempPin(): string {
        if (this.tempPin && this.tempPinExpirationDate) {
            if (this.tempPinExpirationDate.getTime() > new Date().getTime()) {
                throw new TemporaryPinHasAlreadySent(round((this.tempPinExpirationDate.getTime() - new Date().getTime()) / 1000 / 60, 0));
            }
        }
        const tempPin = randomPin();
        const cryptoGenerator = new CryptoGenerator();
        const tempPinExpirationDate = new Date();
        tempPinExpirationDate.setMinutes(new Date().getMinutes() + 15);
        this.tempPin = cryptoGenerator.hash(tempPin);
        this.tempPinExpirationDate = tempPinExpirationDate;
        return tempPin;
    }

    public static generateTokens(id: number, email: string, employeedById?: number, phone?: string): TokenResponse {
        const tokenGenerator = new TokenGenerator();
        const idToken = tokenGenerator.idTokenSign({ userId: id, email, employeedById, phone });
        const refreshToken = tokenGenerator.refreshSign({ idToken });
        return {
            idToken,
            refreshToken
        };
    }

    public static verifyIdToken(token: string): void {
        const tokenGenerator = new TokenGenerator();
        void tokenGenerator.verifyIdToken(token);
    }

    public static verifyRefreshToken(refreshToken: string, oldIdToken: string): TokenResponse {
        const tokenGenerator = new TokenGenerator();
        return tokenGenerator.verifyRefreshToken(refreshToken, oldIdToken);
    }

    private setPhone(phone?: string): void {
        if (phone && phone.trim()) {
            const isPhoneValid = validPhone(phone.trim());
            if (!isPhoneValid) {
                throw new InvalidPhoneNumber();
            }
            this.phone = phone.trim();
        } else {
            this.phone = null as any;
        }
    }

}

export interface UserKey {
    id: number;
}

export interface VerifyBody {
    email: string;
    tempPin: string;
}

export interface StaffVerifyBody {
    email: string;
    tempPin: string;
    password: string;
}

export interface ChangePasswordBody {
    email: string;
    tempPin: string;
    newPassword: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface SendTempPinBody {
    email: string;
}

export interface VerifyBody {
    email: string;
}

export interface RefreshBody {
    idToken: string;
    refreshToken: string;
}

export interface LoginResponse extends TokenResponse {
    companyId: number;
    userId: number;
    name: string;
    email: string;
    role: Role;
    facilities: MiniFacility[];
}

export interface TokenResponse {
    idToken: string;
    // accessToken: string;
    refreshToken: string;
}

export class NonAuthorizedError extends UnauthorizedError {
    constructor() {
        super(getErrorMessages("You are not authorized to perform this operation"));
        this.name = "NonAuthorizedError";
    }
}

export class TemporaryPinExpired extends ForbiddenError {
    constructor() {
        super(getErrorMessages("Pin expired"));
        this.name = "TemporaryPinExpired";
    }
}

export class TemporaryPinHasAlreadySent extends ForbiddenError {
    constructor(tryAgainIn?: number) {
        super(getErrorMessages(`Temporary pin has already been sent. Please try again in ${tryAgainIn || 15} min, if you hasn't received you temporary pin.`));
        this.name = "TemporaryPinHasAlreadySent";
    }
}

export class InvalidCredentials extends BadRequestError {
    constructor() {
        super(getErrorMessages("Invalid credentials"));
        this.name = "InvalidCredentials";
    }
}

export class MissingCredentials extends BadRequestError {
    constructor() {
        super(getErrorMessages("Missing credentials"));
        this.name = "MissingCredentials";
    }
}

export class Unverified extends ForbiddenError {
    constructor() {
        super(getErrorMessages("Unverified user"));
        this.name = "Unverified";
    }
}

export class InvalidPhoneNumber extends BadRequestError {
    constructor() {
        super(getErrorMessages("Phone number is not valid.", "Valid phone number format is +381641111111"));
        this.name = "InvalidPhoneNumber";
    }
}