import { Location } from "../../models";
import { DeleteType, Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { LocationRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class LocationController extends BaseController {

    private readonly locationRepo: LocationRepository;

    public constructor() {
        super();
        this.locationRepo = this.repositoryProvider.getCustomRepository(Location, LocationRepository);
    }

    @Post("/locations")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createLocation(@Body() locationBody: Partial<Location>, @AppCtx() context: Context): Promise<Location> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const newLocation = Location.create(company.id, facilityId, locationBody);
        const savedLocation = await this.locationRepo.save(newLocation);
        return savedLocation;
    }

    @Put("/locations/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateLocation(@Param("identity") identity: string, @Body() locationBody: Partial<Location>, @AppCtx() context: Context): Promise<Location> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const locationKey = Location.parse(identity);
        locationKey.companyId = company.id;
        locationKey.facilityId = facilityId;
        const locationDb = await this.locationRepo.browseOne(locationKey);
        assert(locationDb, ["Location doesn't exist"]);
        locationDb.update(locationBody);
        const updatedLocation = await this.locationRepo.save(locationDb);
        return updatedLocation;
    }

    @Get("/locations")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getLocations(@AppCtx() context: Context, @Res() response: Response): Promise<Location[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const options = this.extractQuery(context);
        const [locations, count] = await this.locationRepo.browse(company.id, facilityId, options);
        response.set("content-range", count.toString());
        return locations;
    }

    @Get("/locations/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getLocationByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Location> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const locationKey = Location.parse(identity);
        locationKey.companyId = company.id;
        locationKey.facilityId = facilityId;
        const locationDb = await this.locationRepo.browseOne(locationKey);
        assert(locationDb, ["Location doesn't exist"]);
        return locationDb;
    }

    @Delete("/locations/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteLocationByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const locationKey = Location.parse(identity);
        locationKey.companyId = company.id;
        locationKey.facilityId = facilityId;
        const locationDb = await this.locationRepo.browseOne(locationKey, {
            relations: ["deliveryZones", "packageQuantities"]
        });
        assert(locationDb, ["Location doesn't exist"]);
        const deleteType = locationDb.delete();
        if (deleteType === DeleteType.Soft) {
            await this.locationRepo.update(locationKey, {
                deleted: locationDb.deleted
            });
        } else {
            await this.locationRepo.delete(locationKey);
        }
        return true;
    }

}