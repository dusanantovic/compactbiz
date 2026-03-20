import { Brackets, EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { Product, ProductPrice } from "../../models";
import { ProductKey } from "../../models/interfaces";
import { OrderType } from "../../models/enums";
import { extract } from "../../models/src/util";
import { BaseRepository } from "./baseRepository";
import { FindManyOptionsStrict } from "../controllers/baseController";

export class ProductRepository extends BaseRepository<Product> {

    public constructor(target: EntityTarget<Product>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptionsStrict<Product>, facilityId?: number): Promise<[Product[], number]> {
        let qb = this.browseQb(companyId, options);
        if (facilityId) {
            qb.addSelect(`(
                SELECT
                    COALESCE(SUM(pkg."quantity"), 0)
                FROM
                    compactbiz."package" pkg
                WHERE
                    pkg."companyId" = "${qb.alias}"."companyId" AND
                    pkg."facilityId" = :facilityId AND
                    pkg."productId" = "${qb.alias}"."id"
            ) as "quantity"`);
            qb.addSelect(`(
                SELECT
                    COALESCE(SUM(pkg."reserved"), 0)
                FROM
                    compactbiz."package" pkg
                WHERE
                    pkg."companyId" = "${qb.alias}"."companyId" AND
                    pkg."facilityId" = :facilityId AND
                    pkg."productId" = "${qb.alias}"."id"
            ) as "reserved"`);
            qb.setParameter("facilityId", facilityId);
        }
        if (options.q) {
            qb = this.search(qb, options.q);
        }
        const { entities, raw } = await qb.getRawAndEntities();
        entities.forEach(x => {
            const rData = raw.find(y => y["p_id"] === x.id);
            x.quantity = rData?.quantity ?? 0;
            x.reserved = rData?.reserved ?? 0;
        });
        const count = await qb.getCount();
        return [entities, count];
    }

    public async browseOne(key: ProductKey, options?: FindManyOptions<Product>): Promise<Product | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const productDb = await qb.getOne();
        return productDb;
    }

    public browseQb(companyId: number, options: FindManyOptions<Product>): SelectQueryBuilder<Product> {
        const businessId = extract(options?.where ?? {}, "businessId") as number | undefined;
        const orderType = extract(options?.where ?? {}, "orderType") as OrderType | undefined;
        const name = extract(options?.where ?? {}, "name") as string | undefined;
        if (!options.relations) {
            options.relations  = [];
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("p"));
        if (businessId && orderType) {
            qb.leftJoinAndMapMany(
                `${qb.alias}.prices`, ProductPrice, "pp",
                `pp."companyId" = "${qb.alias}"."companyId" AND pp."businessId" = :businessId AND pp."productId" = "${qb.alias}"."id" AND pp."type" = :orderType`,
                { businessId, orderType }
            );
        }
        qb.andWhere(`p."companyId" = :companyId`, { companyId });
        if (name) {
            qb.andWhere(`TRIM(LOWER("${qb.alias}"."name")) = :name`, { name: name.trim().toLowerCase() });
        }
        return qb;
    }

    private search(qb: SelectQueryBuilder<Product>, value: string): SelectQueryBuilder<Product> {
        const brackets = new Brackets(ex => {
            const likeName = this.getWhereLike(qb.alias, "name", value);
            ex.where(likeName.where, likeName.params);
        });
        return qb.andWhere(brackets);
    }

}