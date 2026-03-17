import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTypes1702301821000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE compactbiz."company_status_enum" AS ENUM ('Active', 'Paused', 'Inactive', 'Demo');`);
        await queryRunner.query(`CREATE TYPE compactbiz."location_type_enum" AS ENUM ('Room', 'Vehicle');`);
        await queryRunner.query(`CREATE TYPE compactbiz."order_status_enum" AS ENUM ('Temporary', 'Pending', 'InProgress', 'Complete', 'Canceled', 'Refunded', 'Paused');`);
        await queryRunner.query(`CREATE TYPE compactbiz."order_type_enum" AS ENUM ('Pickup', 'Delivery');`);
        await queryRunner.query(`CREATE TYPE compactbiz."product_unit_enum" AS ENUM ('g', 'kg', 'mg', 'tonne', 'oz', 'lb', 'ml', 'l', 'cl', 'gal', 'fl oz', 'pcs');`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Empty
    }

}
