import { OrderDetail } from "../../models";
import { BaseRepository } from "./baseRepository";
import { EntityManager, EntityTarget } from "typeorm";

export class OrderDetailRepository extends BaseRepository<OrderDetail> {

    public constructor(target: EntityTarget<OrderDetail>, manager: EntityManager) {
        super(target, manager);
    }

}