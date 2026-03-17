import { Brand } from "../../models";
import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { BrandRepository } from "../repositories";
import { AppCtx, Context } from "../../context";
import { BrandService } from "../services";

@Controller()
export class BrandController extends BaseController {

    private readonly brandRepo: BrandRepository;

    public constructor() {
        super();
        this.brandRepo = this.repositoryProvider.getCustomRepository(Brand, BrandRepository);
    }

    @Post("/brands")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createBrand(@Body() brandBody: Partial<Brand>, @AppCtx() context: Context): Promise<Brand> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const brandService = new BrandService(this.connection.manager);
        const savedBrand = await brandService.create(company.id, brandBody);
        return savedBrand;
    }

    @Put("/brands/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateBrand(@Param("identity") identity: string, @Body() brandBody: Partial<Brand>, @AppCtx() context: Context): Promise<Brand> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const brandKey = Brand.parse(identity);
        const brandService = new BrandService(this.connection.manager);
        const updatedBrand = await brandService.update(company.id, brandKey, brandBody);
        return updatedBrand;
    }

    @Get("/brands")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getBrand(@AppCtx() context: Context, @Res() response: Response): Promise<Brand[]> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const options = this.extractQuery(context);
        const [brands, count] = await this.brandRepo.browse(company.id, options);
        response.set("content-range", count.toString());
        return brands;
    }

    @Get("/brands/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getBrandByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Brand> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const brandKey = Brand.parse(identity);
        brandKey.companyId = company.id;
        const brandDb = await this.brandRepo.browseOne(brandKey);
        assert(brandDb, ["Brand doesn't exist"]);
        return brandDb;
    }

    @Delete("/brands/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteBrandByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const brandKey = Brand.parse(identity);
        brandKey.companyId = company.id;
        const brandDb = await this.brandRepo.browseOne(brandKey);
        assert(brandDb, ["Brand doesn't exist"]);
        await this.brandRepo.delete(brandKey);
        return true;
    }

}