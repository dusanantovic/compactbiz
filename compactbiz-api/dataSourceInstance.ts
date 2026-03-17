import * as models from "./models";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "./config";

const dataSourceConfig: DataSourceOptions = {
    ...config.db,
    entities: Object.values(models),
    migrations: ["./migrations/*.ts"],
    migrationsTableName: "migration",
    synchronize: false,
    logging: ["error"],
    ssl: process.env.ENVIRONMENT === "prod" ? {
        rejectUnauthorized: false
    } : undefined
    // subscribers: []
};

export default new DataSource(dataSourceConfig);