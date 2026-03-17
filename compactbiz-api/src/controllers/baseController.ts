import { extract, throwError, traverse } from "../../models/src/util";
import { DataSource, EntityManager, FindManyOptions, FindOptionsWhere, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from "typeorm";
import { DBConnection } from "../../dbConnection";
import { RepositoryProvider } from "../repositories";
import { Context } from "../../context";

export interface FindManyOptionsStrict<T> extends FindManyOptions<T> {
    q?: string;
}

export class BaseController {

    protected readonly connection: DataSource;
    protected readonly repositoryProvider: RepositoryProvider;

    public constructor() {
        this.connection = DBConnection.getConnection();
        this.repositoryProvider = this.getRepositoryProvider(this.connection.manager);
    }

    protected extractQuery<T extends object>(context: Context): FindManyOptionsStrict<T> {
        const rangeString = extract(context.query, "range") as string | undefined;
        const range: [number, number] = (rangeString ? JSON.parse(rangeString) : [0, 19]) || [0, 19];
        const sortString = extract(context.query, "sort") as string | undefined;
        const sort = (sortString ? JSON.parse(sortString) : []) || [];
        let q = extract(context.query, "q") as string | undefined;
        q = typeof q === "string" ? q.trim() : "";
        const order: any = {};
        if (sort.length > 0) {
            order[sort[0]] = sort[1];
        }
        if ((range[1] - range[0] + 1) > 100) {
            throwError(["The requested range is too large. Maximum number of result records is 100"]);
        }
        traverse(context.query, val => {
            if (typeof val === "string") {
                if (val.startsWith("!")) {
                    return Not(val.slice(1) === "null" ? IsNull() : val.slice(1));
                } else if (val === "null") {
                    return IsNull();
                }
            }
            return val;
        });
        traverse(context.query, val => typeof val === "string" && val.startsWith(">") ? MoreThan(parseInt(val.slice(1))) : val);
        traverse(context.query, val => typeof val === "string" && val.startsWith("<") ? LessThan(parseInt(val.slice(1))) : val);
        traverse(context.query, val => typeof val === "string" && val.startsWith(">=") ? MoreThanOrEqual(parseInt(val.slice(2))) : val);
        traverse(context.query, val => typeof val === "string" && val.startsWith("<=") ? LessThanOrEqual(parseInt(val.slice(2))) : val);
        const result: FindManyOptionsStrict<T> = {
            where: context.query as FindOptionsWhere<T>,
            skip: range[0],
            take: range[1] - range[0] + 1, // Math.min(range[1] - range[0] + 1, 25)
            order,
            q
        };
        return result;
    }

    protected getRepositoryProvider(manager: EntityManager): RepositoryProvider {
        return new RepositoryProvider(manager);
    }

}