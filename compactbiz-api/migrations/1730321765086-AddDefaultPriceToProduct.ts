import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultPriceToProduct1730321765086 implements MigrationInterface {
    name = "AddDefaultPriceToProduct1730321765086";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "defaultPrice" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD CONSTRAINT "product_default_price_>=_0" CHECK ("defaultPrice" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP CONSTRAINT "product_default_price_>=_0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "defaultPrice"`);
    }

}
