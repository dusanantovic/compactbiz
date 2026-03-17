import { Supplier } from "../../models";
import { DeleteType, Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { SupplierRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class SupplierController extends BaseController {

    private readonly supplierRepo: SupplierRepository;

    public constructor() {
        super();
        this.supplierRepo = this.repositoryProvider.getCustomRepository(Supplier, SupplierRepository);
    }

    @Post("/suppliers")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createSupplier(@Body() supplierBody: Partial<Supplier>, @AppCtx() context: Context): Promise<Supplier> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const newSupplier = Supplier.create(company.id, supplierBody);
        const savedSupplier = await this.supplierRepo.save(newSupplier);
        return savedSupplier;
    }

    @Put("/suppliers/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateSupplier(@Param("identity") identity: string, @Body() supplierBody: Partial<Supplier>, @AppCtx() context: Context): Promise<Supplier> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const supplierKey = Supplier.parse(identity);
        supplierKey.companyId = company.id;
        const supplierDb = await this.supplierRepo.browseOne(supplierKey);
        assert(supplierDb, ["Supplier doesn't exist"]);
        supplierDb.update(supplierBody);
        const updatedSupplier = await this.supplierRepo.save(supplierDb);
        return updatedSupplier;
    }

    @Get("/suppliers")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getSuppliers(@AppCtx() context: Context, @Res() response: Response): Promise<Supplier[]> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const options = this.extractQuery(context);
        const [suppliers, count] = await this.supplierRepo.browse(company.id, options);
        response.set("content-range", count.toString());
        return suppliers;
    }

    @Get("/suppliers/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getSupplierByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Supplier> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const supplierKey = Supplier.parse(identity);
        supplierKey.companyId = company.id;
        const supplierDb = await this.supplierRepo.browseOne(supplierKey);
        assert(supplierDb, ["Supplier doesn't exist"]);
        return supplierDb;
    }

    @Delete("/suppliers/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteSupplierByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const supplierKey = Supplier.parse(identity);
        supplierKey.companyId = company.id;
        const supplierDb = await this.supplierRepo.browseOne(supplierKey);
        assert(supplierDb, ["Supplier doesn't exist"]);
        const deleteType = supplierDb.delete();
        if (deleteType === DeleteType.Soft) {
            await this.supplierRepo.update(supplierKey, {
                deleted: supplierDb.deleted
            });
        } else {
            await this.supplierRepo.delete(supplierKey);
        }
        return true;
    }

}