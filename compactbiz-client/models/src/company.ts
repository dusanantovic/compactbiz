import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
import { IsNotEmpty, IsEmail } from "class-validator";
import { CompanyStatus } from "../enums";
import { BaseModel } from "./baseModel";
import { trimAndLowerCase, validator } from "./util";
import { Facility } from "./facility";
import { Type } from "class-transformer";
import { Business } from "./business";
import { Address } from "./address";

@Entity()
export class Company extends BaseModel<CompanyKey> implements CompanyKey {

    public constructor() {
        super();
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    @Index("company_name", { unique: true })
    @IsNotEmpty({ message: "Company name is required" })
    name: string;

    @Column({ nullable: false, unique: true })
    @Index("company_email", { unique: true })
    @IsNotEmpty({ message: "Company email is required" })
    @IsEmail({ ignore_max_length: false, require_tld: true, allow_ip_domain: false })
    email: string;

    @Column({ nullable: true })
    hostname: string;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @Column({ nullable: false, type: "enum", enum: CompanyStatus, default: CompanyStatus.Demo })
    status: CompanyStatus;

    @OneToMany(() => Facility, f => f.company, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => Facility)
    facilities: Facility[];

    @OneToMany(() => Business, b => b.company, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => Business)
    businesses: Business[];

    public get identity(): string {
        return this.generateIdentity(this.id);
    }

    public get key(): CompanyKey {
        return {
            id: this.id
        };
    }

    get mini(): MiniCompany {
        return this;
    }

    public static parse(identity: string): CompanyKey {
        return this.parseIdentity(identity, "id");
    }

    public static create(companyBody: Partial<Company>): Company {
        const company = new Company();
        company.name = (companyBody.name ? (companyBody.name.trim() || null) : null) as any;
        company.email = trimAndLowerCase(companyBody.email) as any;
        company.address = Address.create(companyBody.address);
        validator(company);
        return company;
    }

    public update(companyBody: Partial<Company>): void {
        this.name = companyBody.name || null as any;
        this.email = trimAndLowerCase(companyBody.email) as any;
        this.address.update(companyBody.address);
        validator(this);
    }

    public changeStatus(newStatus: CompanyStatus): void {
        this.status = newStatus;
    }

}

export interface CompanyKey {
    id: number;
}

export type MiniCompany = Company; // RemoveFromType<Company, "">;