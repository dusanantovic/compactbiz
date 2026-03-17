import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductPriceUniqueForCBPType1730068851879 implements MigrationInterface {
    name = "AddProductPriceUniqueForCBPType1730068851879";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" ADD CONSTRAINT "company_business_product_type" UNIQUE ("companyId", "businessId", "productId", "type")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" DROP CONSTRAINT "company_business_product_type"`);
    }

}
