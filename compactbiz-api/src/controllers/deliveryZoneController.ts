import { DeliveryZone } from "../../models";
import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { DeliveryZoneRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class DeliveryZoneController extends BaseController {

    private readonly deliveryZoneRepo: DeliveryZoneRepository;

    public constructor() {
        super();
        this.deliveryZoneRepo = this.repositoryProvider.getCustomRepository(DeliveryZone, DeliveryZoneRepository);
    }

    @Post("/deliveryzones")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createDeliveryZone(@Body() deliveryZoneBody: Partial<DeliveryZone>, @AppCtx() context: Context): Promise<DeliveryZone> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const newDeliveryZone = DeliveryZone.create(company.id, facilityId, deliveryZoneBody);
        const savedDeliveryZone = await this.deliveryZoneRepo.save(newDeliveryZone);
        return savedDeliveryZone;
    }

    @Put("/deliveryzones/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateDeliveryZone(@Param("identity") identity: string, @Body() deliveryZoneBody: Partial<DeliveryZone>, @AppCtx() context: Context): Promise<DeliveryZone> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const deliveryZoneKey = DeliveryZone.parse(identity);
        deliveryZoneKey.companyId = company.id;
        deliveryZoneKey.facilityId = facilityId;
        const deliveryZoneDb = await this.deliveryZoneRepo.browseOne(deliveryZoneKey);
        assert(deliveryZoneDb, ["Delivery zone doesn't exist"]);
        deliveryZoneDb.update(deliveryZoneBody);
        const updatedDeliveryZone = await this.deliveryZoneRepo.save(deliveryZoneDb);
        return updatedDeliveryZone;
    }

    @Get("/deliveryzones")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getDeliveryZones(@AppCtx() context: Context, @Res() response: Response): Promise<DeliveryZone[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const options = this.extractQuery(context);
        const [deliveryZones, count] = await this.deliveryZoneRepo.browse(company.id, facilityId, options);
        response.set("content-range", count.toString());
        return deliveryZones;
    }

    @Get("/deliveryzones/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getDeliveryZoneByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<DeliveryZone> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const deliveryZoneKey = DeliveryZone.parse(identity);
        deliveryZoneKey.companyId = company.id;
        deliveryZoneKey.facilityId = facilityId;
        const deliveryZoneDb = await this.deliveryZoneRepo.browseOne(deliveryZoneKey);
        assert(deliveryZoneDb, ["Delivery zone doesn't exist"]);
        return deliveryZoneDb;
    }

    @Delete("/deliveryzones/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteDeliveryZoneByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const deliveryZoneKey = DeliveryZone.parse(identity);
        deliveryZoneKey.companyId = company.id;
        deliveryZoneKey.facilityId = facilityId;
        const deliveryZoneDb = await this.deliveryZoneRepo.browseOne(deliveryZoneKey, {
            relations: ["assignedToLocations"]
        });
        assert(deliveryZoneDb, ["Delivery zone doesn't exist"]);
        assert(deliveryZoneDb.assignedToLocations.length === 0, ["Delivery zone cannot be deleted. You can only delete delivery zones without assigned locations."]);
        return true;
    }

}