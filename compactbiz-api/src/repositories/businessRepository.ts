import { Business } from "../../models";
import { BusinessKey } from "../../models/interfaces";
import { Brackets, EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";
import { FindManyOptionsStrict } from "../controllers/baseController";

export class BusinessRepository extends BaseRepository<Business> {

    public constructor(target: EntityTarget<Business>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptionsStrict<Business>): Promise<[Business[], number]> {
        const qb = this.browseQb(companyId, options);
        if (options.q) {
            this.search(qb, options.q);
        }
        const [business, count] = await qb.getManyAndCount();
        return [business, count];
    }

    public async browseOne(key: BusinessKey, options?: FindManyOptions<Business>): Promise<Business | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const businessDb = await qb.getOne();
        return businessDb;
    }

    private browseQb(companyId: number, options: FindManyOptionsStrict<Business>): SelectQueryBuilder<Business> {
        if (!options.relations) {
            options.relations = [];
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("b"));
        qb.andWhere(`b."companyId" = :companyId`, { companyId });
        return qb;
    }

    private search(qb: SelectQueryBuilder<Business>, value: string): SelectQueryBuilder<Business> {
        const brackets = new Brackets(ex => {
            const likeName = this.getWhereLike(qb.alias, "name", value);
            ex.where(likeName.where, likeName.params);
        });
        return qb.andWhere(brackets);
    }

}