import { MigrationInterface, QueryRunner } from "typeorm";

export class  AddNotesToOrder1732196166519 implements MigrationInterface {
    name = "AddNotesToOrder1732196166519";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order" ADD "notes" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP COLUMN "notes"`);
    }

}
