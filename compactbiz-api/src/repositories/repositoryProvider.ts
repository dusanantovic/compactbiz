import { EntityManager, EntityTarget, ObjectLiteral } from "typeorm";
import { BaseRepository } from "./baseRepository";

export class RepositoryProvider {

    private readonly manager: EntityManager;

    public constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public getCustomRepository<T extends ObjectLiteral, K extends new (entity: EntityTarget<T>, manager: EntityManager) => BaseRepository<T>>(
        entity: EntityTarget<T>,
        repository: K
    ): InstanceType<K> {
        return new repository(entity, this.manager) as InstanceType<K>;
    }

}