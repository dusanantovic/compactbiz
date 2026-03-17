import { Package } from "../../models";
import { PackageKey } from "../../models/interfaces";
import { EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class PackageRepository extends BaseRepository<Package> {

    public constructor(target: EntityTarget<Package>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, facilityId: number, options: FindManyOptions<Package>): Promise<[Package[], number]> {
        const qb = this.browseQb(companyId, facilityId, options);
        const [packages, count] = await qb.getManyAndCount();
        return [packages, count];
    }

    public async browseOne(key: PackageKey, options?: FindManyOptions<Package>): Promise<Package | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, key.facilityId, options);
        const packageDb = await qb.getOne();
        return packageDb;
    }

    public browseQb(companyId: number, facilityId: number, options: FindManyOptions<Package>): SelectQueryBuilder<Package> {
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("p"));
        qb.andWhere(`p."companyId" = :companyId`, { companyId });
        qb.andWhere(`p."facilityId" = :facilityId`, { facilityId });
        return qb;
    }

}