import { Facility, Location } from "../../models";
import { LocationType, Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { FacilityRepository, LocationRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class FacilityController extends BaseController {

    private readonly facilityRepo: FacilityRepository;

    public constructor() {
        super();
        this.facilityRepo = this.repositoryProvider.getCustomRepository(Facility, FacilityRepository);
    }

    @Post("/facilities")
    @Authorized([Role.Owner, Role.Manager])
    public async createFacility(@Body() facilityBody: Partial<Facility>, @AppCtx() context: Context): Promise<Facility> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const savedFacility = await this.connection.transaction(async manager => {
            const facilityRepo = this.getRepositoryProvider(manager).getCustomRepository(Facility, FacilityRepository);
            const locationRepo = this.getRepositoryProvider(manager).getCustomRepository(Location, LocationRepository);
            const newFacility = Facility.create(company.id, facilityBody);
            const savedFacility = await facilityRepo.save(newFacility);
            const newLocation = Location.create(savedFacility.companyId, savedFacility.id, {
                name: "Default Room",
                isActive: true,
                type: LocationType.Room
            });
            await locationRepo.save(newLocation);
            return savedFacility;
        });
        return savedFacility;
    }

    @Put("/facilities/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager])
    public async updateFacility(@Param("identity") identity: string, @Body() facilityBody: Partial<Facility>, @AppCtx() context: Context): Promise<Facility> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const facilityKey = Facility.parse(identity);
        facilityKey.companyId = company.id;
        const facilityDb = await this.facilityRepo.browseOne(facilityKey);
        assert(facilityDb, ["Facility doesn't exist"]);
        facilityDb.update(facilityBody);
        const updatedFacility = await this.facilityRepo.save(facilityDb);
        return updatedFacility;
    }

    @Get("/facilities")
    @Authorized([Role.Owner, Role.Manager])
    public async getFacilities(@AppCtx() context: Context, @Res() response: Response): Promise<Facility[]> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const options = this.extractQuery(context);
        const [facilities, count] = await this.facilityRepo.browse(company.id, options);
        response.set("content-range", count.toString());
        return facilities;
    }

    @Get("/facilities/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager])
    public async getFacilityByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Facility> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const facilityKey = Facility.parse(identity);
        facilityKey.companyId = company.id;
        const facilityDb = await this.facilityRepo.browseOne(facilityKey);
        assert(facilityDb, ["Facility doesn't exist"]);
        return facilityDb;
    }

    @Delete("/facilities/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager])
    public async deleteFacilityByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const facilityKey = Facility.parse(identity);
        facilityKey.companyId = company.id;
        const facilityDb = await this.facilityRepo.browseOne(facilityKey);
        assert(facilityDb, ["Facility doesn't exist"]);
        facilityDb.delete();
        await this.facilityRepo.update(facilityKey, {
            deleted: facilityDb.deleted
        });
        return true;
    }

}