import { bigPush } from "../../models/src/util";
import { EntityManager, EntityMetadata, EntityTarget, FindManyOptions, FindOperator, ObjectLiteral, Repository, SelectQueryBuilder, FindOptionsWhere, FindOptionsUtils } from "typeorm";

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {

    public constructor(target: EntityTarget<T>, manager: EntityManager) {
        super(target, manager, manager.queryRunner);
    }

    public browseByOptions(options: FindManyOptions<T>): SelectQueryBuilder<T> {
        const qb = this.getQueryBuilderWithFilters(options);
        return qb;
    }

    protected getWhereLike(alias: string, column: string, value: string, searchByFullValue = false): { where: string; params: ObjectLiteral; } {
        const text = (searchByFullValue ? value : value.substring(0, 32)).toLowerCase();
        return {
            where: `CAST("${alias}"."${column}" AS text) ILIKE :p${column}`,
            params: { [`p${column}`]: `%${text}%` },
        };
    }

    protected getQueryBuilderWithFilters(options: FindManyOptions<T>, qb = this.createQueryBuilder()): SelectQueryBuilder<T> {
        const filter = (options.where ?? {}) as FindOptionsWhere<T>;
        const rest = {} as FindOptionsWhere<T>;
        const andWheres: WherePart[] = [];
        for (const [key, value] of Object.entries(filter)) {
            if (key === "q") {
                continue;
            }
            if (value === undefined) {
                delete filter[key];
                continue;
            } else if (
                value instanceof FindOperator ||
                this.metadata.embeddeds.find(em => key === em.propertyName) ||
                this.metadata.columns.find(c => c.propertyName === key)?.type === "enum"
            ) {
                rest[(key as unknown) as keyof T] = value;
            } else {
                const deepCondition = this.getConditionFromObjectLiteral({ [key]: value }, qb.alias, this.metadata);
                andWheres.push(...deepCondition);
            }
        }
        if (Object.keys(rest).length > 0) {
            qb.where(rest);
        }
        for (const and of andWheres) {
            qb.andWhere(and.condition, and.params);
        }
        qb.skip(options.skip).take(options.take);
        this.setOrderBy(options, qb);
        if (options.relations) {
            FindOptionsUtils["applyRelationsRecursively"](qb, options.relations as string[], qb.expressionMap.mainAlias!.name, qb.expressionMap.mainAlias!.metadata, "");
        }
        return qb;
    }

    protected setOrderBy(options: FindManyOptions<T>, qb: SelectQueryBuilder<T>, skipMetadata = false): void {
        if (options.order !== undefined) {
            const metadata = !skipMetadata ? qb.expressionMap.mainAlias!.metadata : undefined;
            Object.keys(options.order).forEach(key => {
                const order = options.order![key] as "ASC" | "DESC";
                if (metadata && metadata.findColumnWithPropertyPath(key)) {
                    qb.addOrderBy(qb.alias + "." + key, order);
                } else {
                    qb.addOrderBy(key, order);
                }
            });
        }
    }

    protected getOptionsWithConditionData(data: FindOptionsWhere<T>, options?: FindManyOptions<T>): FindManyOptions<T> {
        if (!options) {
            options = {};
        }
        if (!options.where) {
            options.where = {};
        }
        options.where = { ...options.where, ...data };
        return options;
    }

    private getConditionFromObjectLiteral(obj: Record<string, unknown>, acc: string, meta: EntityMetadata): WherePart[] {
        const wheres: WherePart[] = [];
        for (const [key, value] of Object.entries(obj)) {
            if (!(value instanceof Array) && typeof value === "object" && !(value instanceof FindOperator) && value !== null) {
                return this.getConditionFromObjectLiteral(
                    value as Record<string, unknown>,
                    `${key}`,
                    meta.relations.find(x => x.propertyName === key)?.inverseEntityMetadata ?? (meta.allEmbeddeds.find(x => x.propertyName === key) as any)
                );
            } else {
                const column = `"${acc}"."${key}"`;
                const metadata = meta.columns.find(x => x.propertyName === key)!;
                if (value !== "" && typeof value === "string" && metadata?.type !== Number && metadata?.type !== "enum") {
                    wheres.push({
                        condition: `${column}::text ilike :${acc}_${key}`,
                        params: { [`${acc}_${key}`]: `%${value}%`.toLowerCase() },
                    });
                } else if (value instanceof Array) {
                    wheres.push({
                        condition: `${acc}.${key} in (:...${acc}_${key})`,
                        params: { [`${acc}_${key}`]: value },
                    });
                } else if(value !== "") {
                    wheres.push({
                        condition: `${acc}.${key} = :${acc}_${key}`,
                        params: { [`${acc}_${key}`]: value },
                    });
                }
            }
        }
        return wheres;
    }

    public async useBuffer<T, K>(data: T[], size = data.length, callback: (x: T[]) => Promise<K | K[] | void>): Promise<K[]> {
        const results: K[] = [];
        if (size <= 0 || size > data.length) {
            size = data.length;
        }
        const n = Math.ceil(data.length / size);
        for (let i = 0; i < n; i++) {
            const dataForExecute: T[] = [];
            for (let j = i * size; j < size * (i + 1); j++) {
                if (!data[j]) {
                    break;
                }
                dataForExecute.push(data[j]);
            }
            try {
                const executedResults = await callback(dataForExecute);
                if (executedResults) {
                    if (Array.isArray(executedResults)) {
                        bigPush(results, executedResults);
                    } else {
                        results.push(executedResults);
                    }
                }
            } catch (err: any) {
                console.log("Data For Execute", JSON.stringify(dataForExecute));
                console.log("Buffer error", JSON.stringify(err));
                throw err;
            }
        }
        return results;
    }

}

interface WherePart {
    condition: string;
    params: object;
}