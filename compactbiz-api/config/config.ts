import * as dotenv from "dotenv";
import path from "path";
import { Config } from "./types";

if (!process.env.ENVIRONMENT) {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

export const config: Config = {
    db: {
        type: "postgres",
        host: process.env.POSTGRES_HOST!,
        port: parseInt(process.env.POSTGRES_PORT!),
        database: process.env.POSTGRES_DB!,
        schema: process.env.POSTGRES_SCHEMA!,
        username: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_USER_PASSWORD!
    }
};