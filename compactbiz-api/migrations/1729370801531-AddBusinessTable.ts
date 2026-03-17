import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessTable1729370801531 implements MigrationInterface {
    name = "AddBusinessTable1729370801531";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compactbiz"."business" ("created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastModified" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_c6894e962b80bc10a694c0271e2" UNIQUE ("name"), CONSTRAINT "PK_015f3c3bbcc5e83fafdd6e14484" PRIMARY KEY ("companyId", "id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "business_company_name" ON "compactbiz"."business" ("name") `);
        await queryRunner.query(`ALTER TABLE "compactbiz"."business" ADD CONSTRAINT "FK_fc80e1ba4078fbe98166311e284" FOREIGN KEY ("companyId") REFERENCES "compactbiz"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compactbiz"."business" DROP CONSTRAINT "FK_fc80e1ba4078fbe98166311e284"`);
        await queryRunner.query(`DROP INDEX "compactbiz"."business_company_name"`);
        await queryRunner.query(`DROP TABLE "compactbiz"."business"`);
    }

}
