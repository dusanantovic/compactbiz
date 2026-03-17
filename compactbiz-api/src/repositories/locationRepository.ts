import { Location } from "../../models";
import { LocationKey } from "../../models/interfaces";
import { EntityManager, EntityTarget, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class LocationRepository extends BaseRepository<Location> {

    public constructor(target: EntityTarget<Location>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, facilityId: number, options: FindManyOptions<Location>): Promise<[Location[], number]> {
        const qb = this.browseQb(companyId, facilityId, options);
        const [locations, count] = await qb.getManyAndCount();
        return [locations, count];
    }

    public async browseOne(key: LocationKey, options?: FindManyOptions<Location>): Promise<Location | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, key.facilityId, options);
        const locationDb = await qb.getOne();
        return locationDb;
    }

    public browseQb(companyId: number, facilityId: number, options: FindManyOptions<Location>): SelectQueryBuilder<Location> {
        if (options.where && typeof (options.where as FindOptionsWhere<Location>).deleted !== "boolean") {
            (options.where as FindOptionsWhere<Location>).deleted = false;
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("l"));
        qb.andWhere(`l."companyId" = :companyId`, { companyId });
        qb.andWhere(`l."facilityId" = :facilityId`, { facilityId });
        return qb;
    }

}