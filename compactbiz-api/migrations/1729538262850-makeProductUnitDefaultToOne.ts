import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeProductUnitDefaultToOne1729538262850 implements MigrationInterface {
    name = "MakeProductUnitDefaultToOne1729538262850";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" ALTER COLUMN "unitWeight" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."product" ALTER COLUMN "unitWeight" DROP DEFAULT`);
    }

}
