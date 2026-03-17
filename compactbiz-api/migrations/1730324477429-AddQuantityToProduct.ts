import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuantityToProduct1730324477429 implements MigrationInterface {
    name = "AddQuantityToProduct1730324477429";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "quantity" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "quantity"`);
    }

}
