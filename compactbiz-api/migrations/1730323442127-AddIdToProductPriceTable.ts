import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdToProductPriceTable1730323442127 implements MigrationInterface {
    name = "AddIdToProductPriceTable1730323442127";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" DROP CONSTRAINT "PK_c046df476495846fccbc169f238"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" ADD CONSTRAINT "PK_59b8caa0823039c7766d899bd8c" PRIMARY KEY ("companyId", "businessId", "productId", "id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" DROP CONSTRAINT "PK_59b8caa0823039c7766d899bd8c"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" ADD CONSTRAINT "PK_c046df476495846fccbc169f238" PRIMARY KEY ("companyId", "businessId", "productId")`);
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" DROP COLUMN "id"`);
    }

}
