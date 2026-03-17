import { Facility } from "../../models";
import { FacilityKey } from "../../models/interfaces";
import { Brackets, EntityManager, EntityTarget, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";
import { FindManyOptionsStrict } from "src/controllers/baseController";

export class FacilityRepository extends BaseRepository<Facility> {

    public constructor(target: EntityTarget<Facility>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptionsStrict<Facility>): Promise<[Facility[], number]> {
        const qb = this.browseQb(companyId, options);
        if (options.q) {
            this.search(qb, options.q);
        }
        const [facilities, count] = await qb.getManyAndCount();
        return [facilities, count];
    }

    public async browseOne(key: FacilityKey, options?: FindManyOptions<Facility>): Promise<Facility | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const facility = await qb.getOne();
        return facility;
    }

    public browseQb(companyId: number, options: FindManyOptions<Facility>): SelectQueryBuilder<Facility> {
        if (options.where && typeof (options.where as FindOptionsWhere<Facility>).deleted !== "boolean") {
            (options.where as FindOptionsWhere<Facility>).deleted = false;
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("f"));
        qb.andWhere(`f."companyId" = :companyId`, { companyId });
        return qb;
    }

    public async addStaffMember(companyId: number, facilityId: number, userId: number): Promise<void> {
        await this.manager.query(
            `INSERT INTO compactbiz.facility_staff ("companyId", "facilityId", "userId") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [companyId, facilityId, userId]
        );
    }

    private search(qb: SelectQueryBuilder<Facility>, value: string): SelectQueryBuilder<Facility> {
        const brackets = new Brackets(ex => {
            const likeName = this.getWhereLike(qb.alias, "name", value);
            ex.where(likeName.where, likeName.params);
        });
        return qb.andWhere(brackets);
    }

}