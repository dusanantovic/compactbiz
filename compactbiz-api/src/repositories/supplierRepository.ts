import { Supplier } from "../../models";
import { SupplierKey } from "../../models/interfaces";
import { EntityManager, EntityTarget, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class SupplierRepository extends BaseRepository<Supplier> {

    public constructor(target: EntityTarget<Supplier>, manager: EntityManager) {
        super(target, manager);
    }

    public async browse(companyId: number, options: FindManyOptions<Supplier>): Promise<[Supplier[], number]> {
        const qb = this.browseQb(companyId, options);
        const [suppliers, count] = await qb.getManyAndCount();
        return [suppliers, count];
    }

    public async browseOne(key: SupplierKey, options?: FindManyOptions<Supplier>): Promise<Supplier | null> {
        options = this.getOptionsWithConditionData(key, options);
        const qb = this.browseQb(key.companyId, options);
        const supplierDb = await qb.getOne();
        return supplierDb;
    }

    public browseQb(companyId: number, options: FindManyOptions<Supplier>): SelectQueryBuilder<Supplier> {
        if (options.where && typeof (options.where as FindOptionsWhere<Supplier>).deleted !== "boolean") {
            (options.where as FindOptionsWhere<Supplier>).deleted = false;
        }
        const qb = this.getQueryBuilderWithFilters(options, this.createQueryBuilder("s"));
        qb.andWhere(`s."companyId" = :companyId`, { companyId });
        return qb;
    }

}