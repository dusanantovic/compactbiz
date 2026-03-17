import { EntityManager, In } from "typeorm";
import { ProductPrice } from "../../models";
import { ProductPriceRepository, RepositoryProvider } from "../repositories";
import { OrderType } from "../../models/enums";
import { distinct } from "../../models/src/util";

export class ProductPriceService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly prouductPriceRepo: ProductPriceRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.prouductPriceRepo = this.repositoryProvider.getCustomRepository(ProductPrice, ProductPriceRepository);
    }

    public async handleProductPrices(companyId: number, businessId: number, type: OrderType, body: ProductPriceBody[]): Promise<ProductPrice[]> {
        if (body.length === 0) {
            return [];
        }
        body = distinct(body, x => x.productId);
        const productPricesDb = await this.prouductPriceRepo.find({
            where: {
                companyId,
                businessId,
                productId: In(body.map(x => x.productId)),
                type
            }
        });
        const prdouctPrices: ProductPrice[] = [];
        body.forEach(x => {
            const existingProductPrice = productPricesDb.find(pp => pp.productId === x.productId);
            if (existingProductPrice) {
                existingProductPrice.update(x.price);
                prdouctPrices.push(existingProductPrice);
            } else {
                const productPrice = ProductPrice.create(companyId, businessId, x.productId, x.price, type);
                prdouctPrices.push(productPrice);
            }
        });
        if (prdouctPrices.length === 0) {
            return [];
        }
        const savedProductPrices = await this.prouductPriceRepo.save(prdouctPrices);
        return savedProductPrices;
    }

}

interface ProductPriceBody {
    productId: number;
    price: number;
}