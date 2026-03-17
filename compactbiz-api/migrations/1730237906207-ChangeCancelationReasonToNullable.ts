import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCancelationReasonToNullable1730237906207 implements MigrationInterface {
    name = "ChangeCancelationReasonToNullable1730237906207";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order" ALTER COLUMN "cancelationReason" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order" ALTER COLUMN "cancelationReason" SET NOT NULL`);
    }

}
