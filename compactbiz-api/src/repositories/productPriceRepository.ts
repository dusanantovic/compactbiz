import { ProductPrice } from "../../models";
import { BaseRepository } from "./baseRepository";
import { EntityManager, EntityTarget } from "typeorm";

export class ProductPriceRepository extends BaseRepository<ProductPrice> {

    public constructor(target: EntityTarget<ProductPrice>, manager: EntityManager) {
        super(target, manager);
    }

}