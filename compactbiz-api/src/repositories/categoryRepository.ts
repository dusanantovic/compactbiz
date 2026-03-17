import { Category } from "../../models";
import { BaseRepository } from "./baseRepository";
import { EntityManager, EntityTarget } from "typeorm";

export class CategoryRepository extends BaseRepository<Category> {

    public constructor(target: EntityTarget<Category>, manager: EntityManager) {
        super(target, manager);
    }

}