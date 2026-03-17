import { Point, Polygon } from "./models";
import { DataSource } from "typeorm";
import * as pg from "pg";
import DataSourceInstance from "./dataSourceInstance";
 
export class DBConnection {

    private static dbConnection: DBConnection;
    private dataSource: DataSource;

    private constructor() {
        // Empty
    }

    public static async setConnection(): Promise<DataSource> {
        if (!this.dbConnection) {
            this.dbConnection = new DBConnection();
            await this.dbConnection.setDataSource();
        }
        return this.getConnection();
    }

    public static getConnection(): DataSource {
        return this.dbConnection.getDataSource();
    }

    private async setDataSource(): Promise<void> {
        const dataSource = DataSourceInstance;
        try {
            this.setTypeParser();
            this.dataSource = await dataSource.initialize();
            console.log("Database status: Connected");
        } catch(err) {
            console.error("Database status: Error", err);
        }
    }

    private getDataSource(): DataSource {
        return this.dataSource;
    }

    private setTypeParser(): void {
        pg.types.setTypeParser(20, (value: string) => parseInt(value)); // bigint
        pg.types.setTypeParser(1700, (value: string) => parseFloat(value)); // numeric
        // @ts-ignore
        pg.types.setTypeParser(600, (value: string) => Point.parse(value)); // point
        pg.types.setTypeParser(604, (value: string) => Polygon.parse(value)); // polygon
    }

}