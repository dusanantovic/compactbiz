import { Order } from "../../models";
import { OrderKey } from "../../models/interfaces";
import { BaseRepository } from "./baseRepository";
import { FindManyOptionsStrict } from "../controllers/baseController";
import { Brackets, EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";

export class OrderRepository extends BaseRepository<Order> {

    public constructor(target: EntityTarget<Order>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptionsStrict<Order>): Promise<[Order[], number]> {
        const relations = [...((options.relations ?? []) as string[])];
        let qb = this.browseQb(companyId, options);
        if (options.q) {
            qb = this.search(qb, options.q, relations as string[]);
        }
        const [orders, count] = await qb.getManyAndCount();
        return [orders, count];
    }

    public async browseOne(key: OrderKey, options?: FindManyOptions<Order>): Promise<Order | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const productDb = await qb.getOne();
        return productDb;
    }

    public browseQb(companyId: number, options: FindManyOptions<Order>): SelectQueryBuilder<Order> {
        if (!options.relations) {
            options.relations = [];
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("o"));
        qb.andWhere(`o."companyId" = :companyId`, { companyId });
        return qb;
    }

    private search(qb: SelectQueryBuilder<Order>, value: string, relations: string[]): SelectQueryBuilder<Order> {
        const brackets = new Brackets(ex => {
            const likeId = this.getWhereLike(qb.alias, "id", value);
            ex.orWhere(likeId.where, likeId.params);
            ex.orWhere(`CONCAT("${qb.alias}"."companyId", '-', "${qb.alias}"."facilityId", '-', "${qb.alias}"."businessId", '-', "${qb.alias}"."id") = :identity`, { identity: value });
            const likeType = this.getWhereLike(qb.alias, "type", value);
            ex.orWhere(likeType.where, likeType.params);
            if (relations.includes("business")) {
                const likeBusiness = this.getWhereLike(`${qb.alias}__business`, "name", value);
                ex.orWhere(likeBusiness.where, likeBusiness.params);
            }
        });
        return qb.andWhere(brackets);
    }

}