import { Company } from "../../models";
import { BaseRepository } from "./baseRepository";
import { Brackets, EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { throwError } from "../../models/src/util";
import { NotFoundError } from "routing-controllers";
import { FindManyOptionsStrict } from "src/controllers/baseController";
import { CompanyKey } from "models/interfaces";

export class CompanyRepository extends BaseRepository<Company> {

    public constructor(target: EntityTarget<Company>, manager: EntityManager) {
        super(target, manager);
    }
    public async browse(companyId: number, options: FindManyOptionsStrict<Company>): Promise<[Company[], number]> {
        const qb = this.browseQb(companyId, options);
        if (options.q) {
            this.search(qb, options.q);
        }
        const [companies, count] = await qb.getManyAndCount();
        return [companies, count];
    }
    private browseQb(companyId: number, options: FindManyOptionsStrict<Company>): SelectQueryBuilder<Company> {
        if (!options.relations) {
            options.relations = [];
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("c"));
        qb.andWhere(`c."id" = :companyId`, { companyId });
        return qb;
    }
    public async browseOne(companyKey:CompanyKey, options?: FindManyOptions<Company>): Promise<Company | null> {
        options = this.getOptionsWithConditionData(companyKey, options);
        const qb = this.browseQb(companyKey.id, options);
        const companyDb = await qb.getOne();
        return companyDb;
    }
    private search(qb: SelectQueryBuilder<Company>, value: string): SelectQueryBuilder<Company> {
        const brackets = new Brackets(ex => {
            const likeName = this.getWhereLike(qb.alias, "name", value);
            ex.where(likeName.where, likeName.params);
        });
        return qb.andWhere(brackets);
    }
    public async getById(id: number, relations: string[] = []): Promise<Company> {
        let qb = this.getQueryBuilderWithFilters({
            where: { id },
            relations
        });
        qb = this.getQbWithExtraselect(qb);
        const company = await qb.getOne();
        if (company === null) {
            throwError([`Cannot find compay with ID: ${id}`], NotFoundError);
        }
        return company;
    }

    private getQbWithExtraselect(qb: SelectQueryBuilder<Company>): SelectQueryBuilder<Company> {
        return qb;
    }

}