import { PackageQuantity } from "../../models";
import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Controller, Param, Patch, Get, Res } from "routing-controllers";
import { AppCtx, Context } from "../../context";
import { BaseController } from "./baseController";
import { PackageQuantityRepository } from "../repositories";

@Controller()
export class PackageQuantityController extends BaseController {

    private readonly packageQuantityRepo: PackageQuantityRepository;

    public constructor() {
        super();
        this.packageQuantityRepo = this.repositoryProvider.getCustomRepository(PackageQuantity, PackageQuantityRepository);
    }

    @Get("/packagequantities")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getPackageQuantities(@AppCtx() context: Context, @Res() response: Response): Promise<PackageQuantity[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const options = this.extractQuery(context);
        const [packageQuantities, count] = await this.packageQuantityRepo.browse(company.id, facilityId, options);
        response.set("content-range", count.toString());
        return packageQuantities;
    }

    @Get("/packagequantities/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async getPackageQuantityByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<PackageQuantity> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const packageQuantityKey = PackageQuantity.parse(identity);
        packageQuantityKey.companyId = company.id;
        packageQuantityKey.facilityId = facilityId;
        const packageQuantityDb = await this.packageQuantityRepo.browseOne(packageQuantityKey);
        assert(packageQuantityDb, ["Package quantity doesn't exist"]);
        return packageQuantityDb;
    }

    @Patch("/packagequantities/:identity([-0-9]+)/forsale/:forSale")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async forSalePackageQuantity(@Param("identity") identity: string, @Param("forSale") forSale: boolean, @AppCtx() context: Context): Promise<PackageQuantity> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const packageQuantityKey = PackageQuantity.parse(identity);
        packageQuantityKey.companyId = company.id;
        packageQuantityKey.facilityId = facilityId;
        const packageQuantityDb = await this.packageQuantityRepo.browseOne(packageQuantityKey);
        assert(packageQuantityDb, ["Package quantity doesn't exist"]);
        packageQuantityDb.setForSale(forSale);
        await this.packageQuantityRepo.update(packageQuantityKey, {
            forSale: packageQuantityDb.forSale
        });
        return packageQuantityDb;
    }

}