import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1702301832000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO compactbiz.company ("id", "name", "email", "hostname")
            VALUES (1, 'TestCompany', 'localhosttest@yopmail.com', 'localhost')
            ON CONFLICT DO NOTHING
        `);
        // Password (1234567890)
        await queryRunner.query(`
            INSERT INTO compactbiz."user" ("id", "email", "firstName", "lastName", "password", "role", "verified", "employeedById")
            VALUES (
                1, 'admintestcompactbiz@yopmail.com', 'Admin', 'Test',
                '2a8bb449cea7ba281af4e938b78814982f3cd61ea3854a38c17ddd62306636fededfe3331c6d3847e47a1379cb4df5f2d102410eb5c0f55728b3e628e26887e1f42dc4a624e72ea35b9943979e731b1a',
                4096, true, 1
            )
            ON CONFLICT DO NOTHING
        `);
        await queryRunner.query(`
            INSERT INTO compactbiz.facility ("companyId", "id", "name", "email")
            VALUES (1, 1, 'First Facility', 'nowherelocal@yopmail.com')
            ON CONFLICT DO NOTHING
        `);
        await queryRunner.query(`
            INSERT INTO compactbiz.facility_staff ("companyId", "facilityId", "userId")
            VALUES (1, 1, 1)
            ON CONFLICT DO NOTHING
        `);
        await queryRunner.query(`
            INSERT INTO compactbiz."location" ("companyId", "facilityId", "id", "name", "type", "isActive")
            VALUES (1, 1, 1, 'Default Room', 'Room', true)
            ON CONFLICT DO NOTHING
        `);
        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('compactbiz.company', 'id'), MAX(id)) FROM compactbiz.company`);
        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('compactbiz."user"', 'id'), MAX(id)) FROM compactbiz."user"`);
        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('compactbiz.facility', 'id'), MAX(id)) FROM compactbiz.facility`);
        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('compactbiz.location', 'id'), MAX(id)) FROM compactbiz.location`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Empty
    }

}
