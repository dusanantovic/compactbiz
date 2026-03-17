import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryOrderStatus1732196166520 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE compactbiz."order_status_enum" ADD VALUE 'Delivery' AFTER 'InProgress';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // PostgreSQL does not support removing enum values directly.
        // To roll back, recreate the enum without 'Delivery' and update the column.
        await queryRunner.query(`
            ALTER TABLE compactbiz."order" ALTER COLUMN "status" TYPE VARCHAR(255);
        `);
        await queryRunner.query(`DROP TYPE compactbiz."order_status_enum";`);
        await queryRunner.query(`CREATE TYPE compactbiz."order_status_enum" AS ENUM ('Temporary', 'Pending', 'InProgress', 'Complete', 'Canceled', 'Refunded', 'Paused');`);
        await queryRunner.query(`
            ALTER TABLE compactbiz."order" ALTER COLUMN "status" TYPE compactbiz."order_status_enum" USING "status"::compactbiz."order_status_enum";
        `);
    }

}
