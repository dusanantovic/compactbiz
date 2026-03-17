import { DeliveryZone } from "../../models";
import { DeliveryZoneKey } from "../../models/interfaces";
import { EntityManager, EntityTarget, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class DeliveryZoneRepository extends BaseRepository<DeliveryZone> {

    public constructor(target: EntityTarget<DeliveryZone>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, facilityId: number, options: FindManyOptions<DeliveryZone>): Promise<[DeliveryZone[], number]> {
        const qb = this.browseQb(companyId, facilityId, options);
        const [deliveryZones, count] = await qb.getManyAndCount();
        return [deliveryZones, count];
    }

    public async browseOne(key: DeliveryZoneKey, options?: FindManyOptions<DeliveryZone>): Promise<DeliveryZone | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, key.facilityId, options);
        const deliveryZone = await qb.getOne();
        return deliveryZone;
    }

    public browseQb(companyId: number, facilityId: number, options: FindManyOptions<DeliveryZone>): SelectQueryBuilder<DeliveryZone> {
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("dz"));
        qb.andWhere(`dz."companyId" = :companyId`, { companyId });
        qb.andWhere(`dz."facilityId" = :facilityId`, { facilityId });
        return qb;
    }

}