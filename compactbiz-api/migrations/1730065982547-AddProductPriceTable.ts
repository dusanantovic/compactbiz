import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductPriceTable1730065982547 implements MigrationInterface {
    name = "AddProductPriceTable1730065982547";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "compactbiz"."product_price_type_enum" AS ENUM('Purchase', 'Sell')`);
        await queryRunner.query(`CREATE TABLE compactbiz."product_price" ("created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastModified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" integer NOT NULL, "businessId" integer NOT NULL, "productId" integer NOT NULL, "price" numeric NOT NULL, "type" "compactbiz"."product_price_type_enum" NOT NULL, CONSTRAINT "product_price_>=_0" CHECK ("price" >= 0), CONSTRAINT "PK_c046df476495846fccbc169f238" PRIMARY KEY ("companyId", "businessId", "productId"))`);
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" ADD CONSTRAINT "FK_1d542f9d0513afcf59a19d57723" FOREIGN KEY ("companyId", "productId") REFERENCES compactbiz."product"("companyId","id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product_price" DROP CONSTRAINT "FK_1d542f9d0513afcf59a19d57723"`);
        await queryRunner.query(`DROP TABLE "product_price"`);
        await queryRunner.query(`DROP TYPE "compactbiz"."product_price_type_enum"`);
    }

}
