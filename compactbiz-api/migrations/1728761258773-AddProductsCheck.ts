import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductsCheck1728761258773 implements MigrationInterface {
    public name = "AddProductsCheck1728761258773";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" DROP CONSTRAINT "FK_089a0ad8b237a337954fa6733c4"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD CONSTRAINT "unit_weight_>_0" CHECK ("unitWeight" > 0)`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD CONSTRAINT "product_price_>=_0" CHECK ("price" >= 0)`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" ADD CONSTRAINT "FK_767fbd0cfe3f40a3f8aa73121b0" FOREIGN KEY ("companyId", "facilityId", "customerId", "orderId", "productId") REFERENCES compactbiz."order_detail"("companyId","facilityId","customerId","orderId","productId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" DROP CONSTRAINT "FK_767fbd0cfe3f40a3f8aa73121b0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP CONSTRAINT "product_price_>=_0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP CONSTRAINT "unit_weight_>_0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" ADD CONSTRAINT "FK_089a0ad8b237a337954fa6733c4" FOREIGN KEY ("companyId", "facilityId", "customerId", "orderId", "productId") REFERENCES compactbiz."order_detail"("companyId","facilityId","customerId","orderId","productId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
