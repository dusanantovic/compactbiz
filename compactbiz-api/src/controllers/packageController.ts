import { Package } from "../../models";
import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Get, Param, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { PackageRepository } from "../repositories";
import { AppCtx, Context } from "../../context";

@Controller()
export class PackageController extends BaseController {

    private readonly packageRepo: PackageRepository;

    public constructor() {
        super();
        this.packageRepo = this.repositoryProvider.getCustomRepository(Package, PackageRepository);
    }

    @Put("/packages/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updatePackage(@Param("identity") identity: string, @Body() packageBody: Partial<Package>, @AppCtx() context: Context): Promise<Package> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const packageKey = Package.parse(identity);
        packageKey.companyId = company.id;
        packageKey.facilityId = facilityId;
        const packageDb = await this.packageRepo.browseOne(packageKey);
        assert(packageDb, ["Package doesn't exist"]);
        packageDb.update(packageBody);
        const updatedPackage = await this.packageRepo.save(packageDb);
        return updatedPackage;
    }

    @Get("/packages")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getPackages(@AppCtx() context: Context, @Res() response: Response): Promise<Package[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const options = this.extractQuery(context);
        const [packages, count] = await this.packageRepo.browse(company.id, facilityId, options);
        response.set("content-range", count.toString());
        return packages;
    }

    @Get("/packages/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getPackageByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Package> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const packageKey = Package.parse(identity);
        packageKey.companyId = company.id;
        packageKey.facilityId = facilityId;
        const packageDb = await this.packageRepo.browseOne(packageKey);
        assert(packageDb, ["Package doesn't exist"]);
        return packageDb;
    }

}