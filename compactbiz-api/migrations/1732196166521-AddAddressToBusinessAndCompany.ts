import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressToBusinessAndCompany1732196166521 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE compactbiz."business"
                ADD COLUMN "addressCountry" varchar NULL,
                ADD COLUMN "addressCity" varchar NULL,
                ADD COLUMN "addressStreet" varchar NULL,
                ADD COLUMN "addressStreetnumber" varchar NULL,
                ADD COLUMN "addressZip" int4 NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE compactbiz."company"
                ADD COLUMN "addressCountry" varchar NULL,
                ADD COLUMN "addressCity" varchar NULL,
                ADD COLUMN "addressStreet" varchar NULL,
                ADD COLUMN "addressStreetnumber" varchar NULL,
                ADD COLUMN "addressZip" int4 NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE compactbiz."business"
                DROP COLUMN "addressCountry",
                DROP COLUMN "addressCity",
                DROP COLUMN "addressStreet",
                DROP COLUMN "addressStreetnumber",
                DROP COLUMN "addressZip";
        `);
        await queryRunner.query(`
            ALTER TABLE compactbiz."company"
                DROP COLUMN "addressCountry",
                DROP COLUMN "addressCity",
                DROP COLUMN "addressStreet",
                DROP COLUMN "addressStreetnumber",
                DROP COLUMN "addressZip";
        `);
    }

}
