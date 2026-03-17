import { Facility, User } from "../../models";
import { assert, trimAndLowerCase } from "../../models/src/util";
import { Role } from "../../models/enums";
import { Response } from "express";
import { Authorized, Body, Controller, Get, Post, QueryParam, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { FacilityRepository, UserRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class AdminController extends BaseController {

    @Get("/admin/facilities")
    @Authorized(Role.Admin)
    public async getFacilitiesForCompany(
        @QueryParam("companyId") companyId: number,
        @QueryParam("q") q: string,
        @Res() response: Response
    ): Promise<Facility[]> {
        assert(companyId, ["Missing companyId"]);
        const facilityRepo = this.repositoryProvider.getCustomRepository(Facility, FacilityRepository);
        const [facilities, count] = await facilityRepo.browse(companyId, { where: {}, q });
        response.set("content-range", count.toString());
        return facilities;
    }

    @Get("/adminstaff")
    @Authorized(Role.Admin)
    public async getAdminUsers(@AppCtx() context: Context, @Res() response: Response): Promise<User[]> {
        const userRepo = this.repositoryProvider.getCustomRepository(User, UserRepository);
        const options = this.extractQuery(context);
        const qb = userRepo.browse(options);
        const [users, count] = await qb.getManyAndCount();
        response.set("content-range", count.toString());
        return users;
    }

    @Post("/adminstaff")
    @Authorized(Role.Admin)
    public async createAdminUser(
        @Body() body: Partial<User> & { companyId: number; facilityId: number }
    ): Promise<User> {
        const { companyId, facilityId } = body;
        assert(companyId, ["Missing companyId"]);
        assert(facilityId, ["Missing facilityId"]);

        const userRepo = this.repositoryProvider.getCustomRepository(User, UserRepository);
        const email = trimAndLowerCase(body.email);
        if (email) {
            const existing = await userRepo.findOne({ where: { email } });
            assert(!existing, [`User with email (${body.email}) already exist`]);
        }

        const savedUser = await this.connection.transaction(async manager => {
            const facilityRepo = this.getRepositoryProvider(manager).getCustomRepository(Facility, FacilityRepository);
            const txUserRepo = this.getRepositoryProvider(manager).getCustomRepository(User, UserRepository);
            const newUser = User.create(body);
            newUser.employeedById = companyId;
            newUser.verified = true;
            const savedUser = await txUserRepo.save(newUser);
            const facility = await facilityRepo.findOne({
                where: { companyId, id: facilityId },
                relations: ["staff"]
            });
            assert(facility, ["Facility doesn't exist"]);
            facility.staff.push(savedUser);
            await facilityRepo.save(facility);

            return savedUser;
        });

        return savedUser;
    }

}
