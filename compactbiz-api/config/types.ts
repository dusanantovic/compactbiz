export interface Config {
    db: ConfigDb;
}

interface ConfigDb {
    type: "postgres";
    host: string;
    port: number
    schema: string;
    username: string;
    password: string;
    database: string;
}