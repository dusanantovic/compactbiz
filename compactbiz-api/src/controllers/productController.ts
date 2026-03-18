import { Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { ProductRepository } from "../repositories";
import { AppCtx, Context } from "../../context";
import { ProductService } from "../services";
import { Business, Package, PackageAdjustment, Product } from "../../models";

@Controller()
export class ProductController extends BaseController {

    private readonly productRepo: ProductRepository;

    public constructor() {
        super();
        this.productRepo = this.repositoryProvider.getCustomRepository(Product, ProductRepository);
    }

    @Post("/products")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async createProduct(@Body() productBody: Partial<Product>, @AppCtx() context: Context): Promise<Product> {
        const { company, facilityId, user } = context.state;
        const errors: string[] = [];
        if (!company) {
            errors.push("Missing company");
        }
        if (!facilityId) {
            errors.push("Missing facility");
        }
        if (!user) {
            errors.push("Missing user");
        }
        assert(errors.length === 0, errors);
        const result = await this.connection.transaction(async manager => {
            const productService = new ProductService(manager);
            const savedProduct = await productService.create(company!.id, facilityId!, user!.id, productBody);
            return savedProduct;
        });
        return result;
    }

    @Put("/products/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async updateProduct(@Param("identity") identity: string, @Body() productBody: Partial<Product>, @AppCtx() context: Context): Promise<Product> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const productKey = Product.parse(identity);
        const result = await this.connection.transaction(async manager => {
            const productService = new ProductService(manager);
            const updatedProduct = await productService.update(company.id, productKey, productBody);
            return updatedProduct;
        });
        return result;
    }

    @Get("/products")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async getProducts(@AppCtx() context: Context, @Res() response: Response): Promise<Product[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facilityId"]);
        const options = this.extractQuery(context);
        options.relations = ["brand"];
        const [products, count] = await this.productRepo.browse(company.id, facilityId, options);
        response.set("content-range", count.toString());
        return products;
    }

    @Get("/products/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async getProductByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Product> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const productKey = Product.parse(identity);
        productKey.companyId = company.id;
        const options = this.extractQuery(context);
        options.relations = ["brand", "prices", "prices.business"];
        const productDb = await this.productRepo.browseOne(productKey, options);
        assert(productDb, ["Product doesn't exist"]);
        return productDb;
    }

    @Get("/products/:identity([-0-9]+)/history")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async getProductHistory(@Param("identity") identity: string, @AppCtx() context: Context, @Res() response: Response): Promise<PackageAdjustment[]> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facilityId"]);
        const productKey = Product.parse(identity);
        productKey.companyId = company.id;
        const adjustments = await this.connection.manager
            .createQueryBuilder(PackageAdjustment, "pa")
            .innerJoin(Package, "pkg", `pkg."companyId" = pa."companyId" AND pkg."facilityId" = pa."facilityId" AND pkg."id" = pa."packageId"`)
            .leftJoinAndMapOne("pa.business", Business, "b", `b."companyId" = pa."companyId" AND b."id" = pa."businessId"`)
            .where(`pkg."companyId" = :companyId`, { companyId: company.id })
            .andWhere(`pkg."facilityId" = :facilityId`, { facilityId })
            .andWhere(`pkg."productId" = :productId`, { productId: productKey.id })
            .orderBy(`pa."id"`, "DESC")
            .getMany();
        response.set("content-range", adjustments.length.toString());
        return adjustments;
    }

    @Delete("/products/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager])
    public async deleteProductByIdnentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<boolean> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const productKey = Product.parse(identity);
        productKey.companyId = company.id;
        const productDb = await this.productRepo.browseOne(productKey);
        assert(productDb, ["Product doesn't exist"]);
        await this.productRepo.delete(productKey);
        return true;
    }

}