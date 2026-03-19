import { Business } from "../../models";
import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { BusinessRepository } from "../repositories";
import { AppCtx, Context } from "../../context";
import { BusinessService } from "../services";

@Controller()
export class BusinessController extends BaseController {

    private readonly businessRepo: BusinessRepository;

    public constructor() {
        super();
        this.businessRepo = this.repositoryProvider.getCustomRepository(Business, BusinessRepository);
    }

    @Post("/businesses")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createBusiness(@Body() businessBody: Partial<Business>, @AppCtx() context: Context): Promise<Business> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const businessService = new BusinessService(this.connection.manager);
        const savedBusiness = await businessService.create(company.id, businessBody);
        return savedBusiness;
    }

    @Put("/businesses/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateBusiness(@Param("identity") identity: string, @Body() businessBody: Partial<Business>, @AppCtx() context: Context): Promise<Business> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const businessKey = Business.parse(identity);
        const businessService = new BusinessService(this.connection.manager);
        const updatedBusiness = await businessService.update(company.id, businessKey, businessBody);
        return updatedBusiness;
    }

    @Get("/businesses")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales, Role.Warehouseman, Role.Cashier, Role.Driver])
    public async getBusiness(@AppCtx() context: Context, @Res() response: Response): Promise<Business[]> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const options = this.extractQuery(context);
        const [business, count] = await this.businessRepo.browse(company.id, options);
        response.set("content-range", count.toString());
        return business;
    }

    @Get("/businesses/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getBusinessByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Business> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const businessKey = Business.parse(identity);
        businessKey.companyId = company.id;
        const businessDb = await this.businessRepo.browseOne(businessKey);
        assert(businessDb, ["Business doesn't exist"]);
        return businessDb;
    }

    @Delete("/businesses/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteBusinessByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const businessKey = Business.parse(identity);
        businessKey.companyId = company.id;
        const businessDb = await this.businessRepo.browseOne(businessKey);
        assert(businessDb, ["Business doesn't exist"]);
        await this.businessRepo.delete(businessKey);
        return true;
    }

}