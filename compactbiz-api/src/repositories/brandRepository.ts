import { Brand } from "../../models";
import { BrandKey } from "../../models/interfaces";
import { Brackets, EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";
import { FindManyOptionsStrict } from "../controllers/baseController";

export class BrandRepository extends BaseRepository<Brand> {

    public constructor(target: EntityTarget<Brand>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptionsStrict<Brand>): Promise<[Brand[], number]> {
        const qb = this.browseQb(companyId, options);
        if (options.q) {
            this.search(qb, options.q);
        }
        const [brands, count] = await qb.getManyAndCount();
        return [brands, count];
    }

    public async browseOne(key: BrandKey, options?: FindManyOptions<Brand>): Promise<Brand | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const brandDb = await qb.getOne();
        return brandDb;
    }

    private browseQb(companyId: number, options: FindManyOptionsStrict<Brand>): SelectQueryBuilder<Brand> {
        if (!options.relations) {
            options.relations  = [];
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("b"));
        qb.andWhere(`b."companyId" = :companyId`, { companyId });
        return qb;
    }

    private search(qb: SelectQueryBuilder<Brand>, value: string): SelectQueryBuilder<Brand> {
        const brackets = new Brackets(ex => {
            const likeName = this.getWhereLike(qb.alias, "name", value);
            ex.where(likeName.where, likeName.params);
        });
        return qb.andWhere(brackets);
    }

}