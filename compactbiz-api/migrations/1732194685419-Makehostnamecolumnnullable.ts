import { MigrationInterface, QueryRunner } from "typeorm";

export class  Makehostnamecolumnnullable1732194685419 implements MigrationInterface {
    name = "Makehostnamecolumnnullable1732194685419";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "compactbiz"."company_hostname"`);
        await queryRunner.query(`ALTER TABLE compactbiz."company" ALTER COLUMN "hostname" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE compactbiz."company" DROP CONSTRAINT "UQ_c78d8002eb8c10ab163f6a281ca"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."company" ADD CONSTRAINT "UQ_c78d8002eb8c10ab163f6a281ca" UNIQUE ("hostname")`);
        await queryRunner.query(`ALTER TABLE compactbiz."company" ALTER COLUMN "hostname" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "company_hostname" ON compactbiz."company" ("hostname") `);
    }

}
