import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserPasswordNullable1732196166522 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE compactbiz."user"
                ALTER COLUMN "password" DROP NOT NULL,
                ADD CONSTRAINT "user_password_required_unless_staff"
                    CHECK ("password" IS NOT NULL OR ("employeedById" IS NOT NULL AND verified = false));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE compactbiz."user"
                DROP CONSTRAINT "user_password_required_unless_staff",
                ALTER COLUMN "password" SET NOT NULL;
        `);
    }

}
