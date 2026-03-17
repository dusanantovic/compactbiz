import { EntityManager } from "typeorm";
import { Location, Product } from "../../models";
import { LocationType } from "../../models/enums";
import { ProductKey } from "../../models/interfaces";
import { assert } from "../../models/src/util";
import { LocationRepository, ProductRepository, RepositoryProvider } from "../repositories";
import { PackageService } from "./packageService";

export class ProductService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly productRepo: ProductRepository;
    private readonly locationRepo: LocationRepository;
    private readonly manager: EntityManager;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.productRepo = this.repositoryProvider.getCustomRepository(Product, ProductRepository);
        this.locationRepo = this.repositoryProvider.getCustomRepository(Location, LocationRepository);
        this.manager = manager;
    }

    public async create(companyId: number, facilityId: number, userId: number, productBody: Partial<Product>): Promise<Product> {
        const productName = productBody.name && productBody.name.trim();
        assert(productName, ["Missing product name"]);
        const [products] = await this.productRepo.browse(companyId, facilityId, {
            where: {
                name: productName
            }
        });
        assert(products.length === 0, [`Product with name "${productName}" already exists`]);
        const product = Product.create(companyId, productBody);
        const savedProduct = await this.productRepo.save(product);
        if (productBody.quantity && productBody.quantity > 0) {
            const defaultLocation = await this.locationRepo.findOneByOrFail({ companyId, facilityId, type: LocationType.Room });
            const packageService = new PackageService(this.manager);
            await packageService.createProduct(companyId, facilityId, userId, defaultLocation.id, savedProduct.id, productBody.quantity);
            savedProduct.quantity = productBody.quantity;
        }
        return savedProduct;
    }

    public async update(companyId: number, productKey: ProductKey, productBody: Partial<Product>): Promise<Product> {
        productKey.companyId = companyId;
        const productDb = await this.productRepo.browseOne(productKey);
        assert(productDb, ["Product doesn't exist"]);
        productDb.update(productBody);
        const updatedProduct = await this.productRepo.save(productDb);
        return updatedProduct;
    }

}