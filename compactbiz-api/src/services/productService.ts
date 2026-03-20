import { EntityManager } from "typeorm";
import { Product } from "../../models";
import { ProductKey } from "../../models/interfaces";
import { assert } from "../../models/src/util";
import { ProductRepository, RepositoryProvider } from "../repositories";

export class ProductService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly productRepo: ProductRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.productRepo = this.repositoryProvider.getCustomRepository(Product, ProductRepository);
    }

    public async create(companyId: number, productBody: Partial<Product>): Promise<Product> {
        const productName = productBody.name && productBody.name.trim();
        assert(productName, ["Missing product name"]);
        const [products] = await this.productRepo.browse(companyId, {
            where: {
                name: productName
            }
        });
        assert(products.length === 0, [`Product with name "${productName}" already exists`]);
        const product = Product.create(companyId, productBody);
        const savedProduct = await this.productRepo.save(product);
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