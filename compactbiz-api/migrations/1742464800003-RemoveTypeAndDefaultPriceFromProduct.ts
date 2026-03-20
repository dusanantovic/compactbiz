import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTypeAndDefaultPriceFromProduct1742464800003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "compactbiz"."product_type_enum"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP CONSTRAINT IF EXISTS "product_default_price_>=_0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "defaultPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "defaultPrice" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD CONSTRAINT "product_default_price_>=_0" CHECK ("defaultPrice" >= 0)`);
        await queryRunner.query(`CREATE TYPE "compactbiz"."product_type_enum" AS ENUM('Purchase', 'Sell', 'Both')`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "type" "compactbiz"."product_type_enum" NOT NULL DEFAULT 'Both'`);
    }

}
