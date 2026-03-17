import { PackageQuantity } from "../../models";
import { PackageQuantityKey } from "../../models/interfaces";
import { EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class PackageQuantityRepository extends BaseRepository<PackageQuantity> {

    public constructor(target: EntityTarget<PackageQuantity>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, facilityId: number, options: FindManyOptions<PackageQuantity>): Promise<[PackageQuantity[], number]> {
        const qb = this.browseQb(companyId, facilityId, options);
        const [packageQuantities, count] = await qb.getManyAndCount();
        return [packageQuantities, count];
    }

    public async browseOne(key: PackageQuantityKey, options?: FindManyOptions<PackageQuantity>): Promise<PackageQuantity | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, key.facilityId, options);
        const packageQuantityDb = await qb.getOne();
        return packageQuantityDb;
    }

    public browseQb(companyId: number, facilityId: number, options: FindManyOptions<PackageQuantity>): SelectQueryBuilder<PackageQuantity> {
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("pq"));
        qb.andWhere(`pq."companyId" = :companyId`, { companyId });
        qb.andWhere(`pq."facilityId" = :facilityId`, { facilityId });
        return qb;
    }

}