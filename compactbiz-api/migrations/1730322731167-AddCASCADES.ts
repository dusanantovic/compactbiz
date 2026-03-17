import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCASCADES1730322731167 implements MigrationInterface {
    name = "AddCASCADES1730322731167";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" DROP CONSTRAINT "FK_faac5c7b3bf01de5ccb935a0bd5"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" DROP CONSTRAINT "FK_bcd9458358b4a49553c49f4dd4d"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" ADD CONSTRAINT "FK_9bb33b9b060030c99603eeae763" FOREIGN KEY ("companyId", "facilityId", "packageId", "locationId") REFERENCES compactbiz."package_quantity"("companyId","facilityId","packageId","locationId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" ADD CONSTRAINT "FK_faac5c7b3bf01de5ccb935a0bd5" FOREIGN KEY ("companyId", "facilityId", "packageId") REFERENCES compactbiz."package"("companyId","facilityId","id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" ADD CONSTRAINT "FK_bcd9458358b4a49553c49f4dd4d" FOREIGN KEY ("companyId", "facilityId", "locationId") REFERENCES compactbiz."location"("companyId","facilityId","id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" DROP CONSTRAINT "FK_bcd9458358b4a49553c49f4dd4d"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" DROP CONSTRAINT "FK_faac5c7b3bf01de5ccb935a0bd5"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" DROP CONSTRAINT "FK_9bb33b9b060030c99603eeae763"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" ADD CONSTRAINT "FK_bcd9458358b4a49553c49f4dd4d" FOREIGN KEY ("companyId", "facilityId", "locationId") REFERENCES compactbiz."location"("companyId","facilityId","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_quantity" ADD CONSTRAINT "FK_faac5c7b3bf01de5ccb935a0bd5" FOREIGN KEY ("companyId", "facilityId", "packageId") REFERENCES compactbiz."package"("companyId","facilityId","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
