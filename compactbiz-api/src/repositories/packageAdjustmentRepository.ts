import { PackageAdjustment } from "../../models";
import { BaseRepository } from "./baseRepository";
import { EntityManager, EntityTarget } from "typeorm";

export class PackageAdjustmentRepository extends BaseRepository<PackageAdjustment> {

    public constructor(target: EntityTarget<PackageAdjustment>, manager: EntityManager) {
        super(target, manager);
    }

}