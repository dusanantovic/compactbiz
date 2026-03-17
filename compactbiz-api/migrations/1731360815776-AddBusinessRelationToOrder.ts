import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessRelationToOrder1731360815776 implements MigrationInterface {
    name = "AddBusinessRelationToOrder1731360815776";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" ADD CONSTRAINT "FK_315260c8da5f9dfed42074b10ed" FOREIGN KEY ("companyId", "businessId") REFERENCES compactbiz."business"("companyId","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP CONSTRAINT "FK_315260c8da5f9dfed42074b10ed"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "quantity" integer NOT NULL DEFAULT '0'`);
    }

}
