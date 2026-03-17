import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNormalizex1702301832459 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION "compactbiz".normalizex(s text)
            RETURNS text
            LANGUAGE plpgsql IMMUTABLE STRICT
            AS $function$
                BEGIN
                    RETURN trim(regexp_replace(regexp_replace(s, '[^\s[:alnum:]&\.\/]+', ' ', 'g'), '[\s]{2,}', ' ', 'g'));
                END;
            $function$
        `);
    }

    public async down(): Promise<void> {
        // Empty
    }

}
