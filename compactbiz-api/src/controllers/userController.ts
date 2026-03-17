import { MiniFacility, User } from "../../models";
import { assert, throwError, trimAndLowerCase } from "../../models/src/util";
import { Role } from "../../models/enums";
import { ChangePasswordBody, VerifyBody, LoginBody, LoginResponse, RefreshBody, TokenResponse } from "../../models/interfaces";
import { CryptoGenerator } from "../../models/src/cryptoGenerator";
import { InvalidCredentials, MissingCredentials, SendTempPinBody, TemporaryPinExpired, Unverified } from "../../models/src/user";
import { Get, Controller, Post, Body, Param, Res, Put, Authorized, ForbiddenError } from "routing-controllers";
import { Response } from "express";
import { BaseController } from "./baseController";
import { UserRepository } from "../repositories";
import { AppCtx, Context } from "../../context";
import { UserService } from "../services";

@Controller()
export class UserController extends BaseController {

    private readonly userRepo: UserRepository;

    public constructor() {
        super();
        this.userRepo = this.repositoryProvider.getCustomRepository(User, UserRepository);
    }

    @Post("/users")
    public async createUser(@Body() userBody: Partial<User>): Promise<User> {
        const email = trimAndLowerCase(userBody.email);
        if (email) {
            const userByEmail = await this.userRepo.findOne({
                where: {
                    email
                }
            });
            assert(!userByEmail, [`User with email (${userBody.email}) already exist`]);
        }
        const newUser = User.create(userBody);
        const savedUser = await this.userRepo.save(newUser);
        const userService = new UserService(this.connection.manager);
        await userService.sendTempPin(savedUser);
        return savedUser;
    }

    @Put("/users/me")
    public async userSelfUpdate(@Body() userBody: Partial<User>, @AppCtx() context: Context): Promise<User> {
        const { user } = context.state;
        assert(user, ["Missing user"]);
        user.update(userBody);
        const updatedUser = await this.userRepo.save(user);
        return updatedUser;
    }

    @Put("/users/:identity([-0-9]+)")
    @Authorized([Role.Manager, Role.Owner])
    public async updateUser(@Param("identity") identity: string, @Body() userBody: Partial<User>): Promise<User> {
        const userKey = User.parse(identity);
        const user = await this.userRepo.findOne({
            where: userKey
        });
        assert(user, ["User doesn't exist"]);
        user.update(userBody);
        const updatedUser = await this.userRepo.save(user);
        return updatedUser;
    }

    @Get("/users")
    @Authorized([Role.Manager, Role.Owner])
    public async getUsers(@AppCtx() context: Context, @Res() response: Response): Promise<User[]> {
        const { company, facilityId } = context.state;
        const options = this.extractQuery(context);
        const qb = this.userRepo.browse(options, company?.id, facilityId);
        const [users, count] = await qb.getManyAndCount();
        response.set("content-range", count.toString());
        return users;
    }
    @Get("/users/:identity([-0-9]+)")
    @Authorized([Role.Manager, Role.Owner, Role.Warehouseman])
    public async getOneUser(@Param("identity") identity: string, @AppCtx() context: Context): Promise<User> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const userKey = User.parse(identity);
        const userDb = await this.userRepo.findOne({
            where: userKey
        });
        assert(userDb, ["User doesn't exist"]);
        return userDb;
    }

    @Get(`/users/me`)
    public getUser(@AppCtx() context: Context): User {
        const { user } = context.state;
        assert(user, ["Missing user"]);
        return user;
    }

    @Post(`/users/sendtemppin`)
    public async sendTempPin(@Body() sendTempPinBody: SendTempPinBody): Promise<boolean> {
        const email = trimAndLowerCase(sendTempPinBody && sendTempPinBody.email);
        assert(email, ["Please enter your email"]);
        const userDb = await this.userRepo.findOne({
            where: {
                email
            }
        });
        assert(userDb, [`User doesn't exist`]);
        const result = await this.userRepo.getUserSpecFields(userDb.key, "tempPin", "tempPinExpirationDate");
        const userService = new UserService(this.connection.manager);
        if (result) {
            userDb.tempPin = result.tempPin;
            userDb.tempPinExpirationDate = result.tempPinExpirationDate;
        }
        await userService.sendTempPin(userDb);
        return true;
    }

    @Put("/users/verify")
    public async verifyUser(@Body() verifyBody: VerifyBody): Promise<boolean> {
        const email = trimAndLowerCase(verifyBody && verifyBody.email);
        assert(email, ["Please enter your email"]);
        const userDb = await this.userRepo.findOne({
            where: {
                email
            }
        });
        assert(userDb, [`User doesn't exist`]);
        const result = await this.userRepo.getUserSpecFields(userDb.key, "tempPin", "tempPinExpirationDate");
        if (!result) {
            throw new MissingCredentials();
        }
        userDb.tempPin = result.tempPin;
        userDb.tempPinExpirationDate = result.tempPinExpirationDate;
        userDb.verify(verifyBody.tempPin);
        await this.userRepo.save(userDb);
        return true;
    }

    @Post(`/users/changepassword`)
    public async changePassword(@Body() changePasswordBody: ChangePasswordBody): Promise<boolean> {
        const email = trimAndLowerCase(changePasswordBody && changePasswordBody.email);
        assert(email, ["Please enter your email"]);
        const userDb = await this.userRepo.findOne({
            where: {
                email
            }
        });
        assert(userDb, [`User doesn't exist`]);
        if (!userDb.verified) {
            throw new Unverified();
        }
        const result = await this.userRepo.getUserSpecFields(userDb.key);
        if (!result) {
            throw new MissingCredentials();
        }
        userDb.tempPin = result.tempPin;
        userDb.tempPinExpirationDate = result.tempPinExpirationDate;
        try {
            userDb.changePassword(changePasswordBody.tempPin, changePasswordBody.newPassword);
        } catch (err: any) {
            if (err.name === new TemporaryPinExpired().name) {
                await this.userRepo.update(userDb.key, {
                    tempPin: null as any,
                    tempPinExpirationDate: null as any
                });
            }
            throw err;
        }
        await this.userRepo.save(userDb);
        return true;
    }

    @Post("/users/login")
    public async login(@Body() loginBody: LoginBody): Promise<LoginResponse> {
        assert(loginBody.email, ["Email is required"]);
        assert(loginBody.password, ["Password is required"]);
        const userDb = await this.userRepo.findOne({
            where: {
                email: loginBody.email
            },
            relations: ["facilities"]
        });
        if (!userDb) {
            throw new InvalidCredentials();
        }
        if (!userDb.employeedById) {
            throw new InvalidCredentials();
        }
        if (!userDb.verified) {
            throw new Unverified();
        }
        const result = await this.userRepo.getUserSpecFields(userDb.key, "password");
        if (!result || !result.password) {
            throw new InvalidCredentials();
        }
        const cryptoGenerator = new CryptoGenerator();
        const passwordMatch = cryptoGenerator.compareRawWithHash(loginBody.password, result.password);
        if (!passwordMatch) {
            throw new InvalidCredentials();
        }
        const { idToken, refreshToken } = User.generateTokens(userDb.id, userDb.email, userDb.employeedById, userDb.phone);
        await this.userRepo.update(userDb.key, {
            refreshToken
        });
        return {
            companyId: userDb.employeedById,
            userId: userDb.id,
            email: userDb.email,
            name: userDb.toString(),
            role: userDb.role,
            idToken,
            refreshToken,
            facilities: userDb.facilities.map(f => new MiniFacility(f))
        };
    }

    @Post("/users/refresh")
    public async refreshToken(@Body() body: RefreshBody): Promise<TokenResponse> {
        assert(body.refreshToken, ["Missing refresh token"]);
        assert(body.idToken, ["Missing id token"]);
        const userDb = await this.userRepo.findOne({
            where: {
                refreshToken: body.refreshToken,
                verified: true
            }
        });
        assert(userDb, ["Missing token"], ForbiddenError);
        try {
            const { idToken, refreshToken } = User.verifyRefreshToken(body.refreshToken, body.idToken);
            await this.userRepo.update(userDb.key, {
                refreshToken
            });
            return {
                idToken,
                refreshToken
            };
        } catch (err: any) {
            await this.userRepo.update(userDb.key, {
                refreshToken: null as any
            });
            throwError(["Missing token"], ForbiddenError);
        }
    }

    @Post("/users/logout")
    public async logout(@AppCtx() context: Context): Promise<boolean> {
        const { user } = context.state;
        assert(user, ["Missing user"]);
        await this.userRepo.update(user.key, {
            refreshToken: null as any
        });
        return true;
    }

}