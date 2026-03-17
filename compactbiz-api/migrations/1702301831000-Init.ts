import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1702301831000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE compactbiz.brand (
                created timestamptz NOT NULL DEFAULT now(),
                "lastModified" timestamptz NOT NULL DEFAULT now(),
                "companyId" int4 NOT NULL,
                id serial4 NOT NULL,
                "name" varchar NOT NULL,
                CONSTRAINT "PK_4251fe52bc460e88880223131db" PRIMARY KEY ("companyId", id),
                CONSTRAINT company_brand_name UNIQUE ("companyId", name)
            );
        `);
        await queryRunner.query(`CREATE TABLE compactbiz.category (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            "parentId" int4 NULL,
            CONSTRAINT "PK_5546d3381537abdbaae386bdf8e" PRIMARY KEY ("companyId", id),
            CONSTRAINT "REL_adeab1d8efecc6e38efb1d6089" UNIQUE ("companyId", "parentId"),
            CONSTRAINT company_category_name UNIQUE ("companyId", name),
            CONSTRAINT "FK_adeab1d8efecc6e38efb1d60896" FOREIGN KEY ("companyId","parentId") REFERENCES compactbiz.category("companyId",id)
        );`);
        await queryRunner.query(`CREATE TABLE compactbiz.company (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            email varchar NOT NULL,
            hostname varchar NOT NULL,
            status compactbiz."company_status_enum" NOT NULL DEFAULT 'Demo'::compactbiz.company_status_enum,
            CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY (id),
            CONSTRAINT "UQ_a76c5cd486f7779bd9c319afd27" UNIQUE (name),
            CONSTRAINT "UQ_b0fc567cf51b1cf717a9e8046a1" UNIQUE (email),
            CONSTRAINT "UQ_c78d8002eb8c10ab163f6a281ca" UNIQUE (hostname)
        );`);
        await queryRunner.query(`CREATE UNIQUE INDEX company_email ON compactbiz.company USING btree (email);`);
        await queryRunner.query(`CREATE UNIQUE INDEX company_hostname ON compactbiz.company USING btree (hostname);`);
        await queryRunner.query(`CREATE UNIQUE INDEX company_name ON compactbiz.company USING btree (name);`);
        await queryRunner.query(`CREATE TABLE compactbiz."user" (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            id serial4 NOT NULL,
            email varchar NOT NULL,
            phone varchar NULL,
            "firstName" varchar NOT NULL,
            "middleName" varchar NULL,
            "lastName" varchar NOT NULL,
            "password" varchar NOT NULL,
            "role" int4 NOT NULL DEFAULT 0,
            verified bool NOT NULL DEFAULT false,
            "tempPin" varchar NULL,
            "tempPinExpirationDate" timestamptz NULL,
            "refreshToken" varchar NULL,
            "employeedById" int4 NULL,
            "addressCountry" varchar NULL,
            "addressCity" varchar NULL,
            "addressStreet" varchar NULL,
            "addressStreetnumber" varchar NULL,
            "addressZip" int4 NULL,
            CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
            CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE (phone),
            CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)
        );`);
        await queryRunner.query(`CREATE TABLE compactbiz.delivery_zone (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            fee numeric NOT NULL DEFAULT '0'::numeric,
            "minAmount" numeric NOT NULL DEFAULT '0'::numeric,
            "freeMin" numeric NOT NULL DEFAULT '0'::numeric,
            geofence polygon NOT NULL,
            CONSTRAINT "PK_1f76a764e9363e12bf6c883c6b3" PRIMARY KEY ("companyId", "facilityId", id),
            CONSTRAINT "delivery_zone_fee_>=_0" CHECK ((fee >= (0)::numeric)),
            CONSTRAINT "delivery_zone_free_min_>=_0" CHECK (("freeMin" >= (0)::numeric)),
            CONSTRAINT "delivery_zone_min_amount_>=_0" CHECK (("minAmount" >= (0)::numeric))
        );`);
        await queryRunner.query(`CREATE TABLE compactbiz.facility (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            email varchar NOT NULL,
            deleted bool NOT NULL DEFAULT false,
            "addressCountry" varchar NULL,
            "addressCity" varchar NULL,
            "addressStreet" varchar NULL,
            "addressStreetnumber" varchar NULL,
            "addressZip" int4 NULL,
            CONSTRAINT "PK_443eb2b73ede1cf10190dec6386" PRIMARY KEY ("companyId", id),
            CONSTRAINT company_facility_name UNIQUE ("companyId", name)
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.facility ADD CONSTRAINT "FK_5b0258d55c8e7bc17ffa199f8ba" FOREIGN KEY ("companyId") REFERENCES compactbiz.company(id);`);
        await queryRunner.query(`CREATE TABLE compactbiz.facility_staff (
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "userId" int4 NOT NULL,
            CONSTRAINT "PK_6f5fc41707929fa8bc2e14cd9f1" PRIMARY KEY ("companyId", "facilityId", "userId")
        );`);
        await queryRunner.query(`CREATE INDEX "IDX_f37665d66fc9a9591966eae5fe" ON compactbiz.facility_staff USING btree ("companyId", "facilityId");`);
        await queryRunner.query(`CREATE INDEX "IDX_f79a22d861415ebfc915028fc8" ON compactbiz.facility_staff USING btree ("userId");`);
        await queryRunner.query(`ALTER TABLE compactbiz.facility_staff ADD CONSTRAINT "FK_f37665d66fc9a9591966eae5fe7" FOREIGN KEY ("companyId","facilityId") REFERENCES compactbiz.facility("companyId",id) ON DELETE CASCADE ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE compactbiz.facility_staff ADD CONSTRAINT "FK_f79a22d861415ebfc915028fc89" FOREIGN KEY ("userId") REFERENCES compactbiz."user"(id);`);
        await queryRunner.query(`CREATE TABLE compactbiz."location" (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            "type" compactbiz."location_type_enum" NOT NULL DEFAULT 'Room'::compactbiz.location_type_enum,
            "isActive" bool NOT NULL DEFAULT true,
            deleted bool NOT NULL DEFAULT false,
            "driverId" int4 NULL,
            "vehicleMake" varchar NULL,
            "vehicleModel" varchar NULL,
            "vehicleYear" int4 NULL,
            "vehicleLicenseplate" varchar NULL,
            CONSTRAINT "PK_ebd0ee3f2c47ad6e6b673d6c312" PRIMARY KEY ("companyId", "facilityId", id),
            CONSTRAINT "REL_69cc1679e08db3803d409b81bf" UNIQUE ("driverId")
        );`);
        await queryRunner.query(`CREATE UNIQUE INDEX company_facility_location_name ON compactbiz.location USING btree ("companyId", "facilityId", name) WHERE (deleted = false);`);
        await queryRunner.query(`ALTER TABLE compactbiz."location" ADD CONSTRAINT "FK_69cc1679e08db3803d409b81bf5" FOREIGN KEY ("driverId") REFERENCES compactbiz."user"(id);`);
        await queryRunner.query(`CREATE TABLE compactbiz.location_delivery_zone (
            "deliveryZoneCompanyId" int4 NOT NULL,
            "deliveryZoneFacilityId" int4 NOT NULL,
            "deliveryZoneId" int4 NOT NULL,
            "locationCompanyId" int4 NOT NULL,
            "locationFacilityId" int4 NOT NULL,
            "locationId" int4 NOT NULL,
            CONSTRAINT "PK_df22175f1818e5eb9c2ca322395" PRIMARY KEY ("deliveryZoneCompanyId", "deliveryZoneFacilityId", "deliveryZoneId", "locationCompanyId", "locationFacilityId", "locationId")
        );`);
        await queryRunner.query(`CREATE INDEX "IDX_1fe88e96e3c61df7d8fcfa2141" ON compactbiz.location_delivery_zone USING btree ("locationCompanyId", "locationFacilityId", "locationId");`);
        await queryRunner.query(`CREATE INDEX "IDX_4e7e3e29fadd28f6ba9f6f156d" ON compactbiz.location_delivery_zone USING btree ("deliveryZoneCompanyId", "deliveryZoneFacilityId", "deliveryZoneId");`);
        await queryRunner.query(`ALTER TABLE compactbiz.location_delivery_zone ADD CONSTRAINT "FK_1fe88e96e3c61df7d8fcfa21410" FOREIGN KEY ("locationCompanyId","locationFacilityId","locationId") REFERENCES compactbiz."location"("companyId","facilityId",id);`);
        await queryRunner.query(`ALTER TABLE compactbiz.location_delivery_zone ADD CONSTRAINT "FK_4e7e3e29fadd28f6ba9f6f156d5" FOREIGN KEY ("deliveryZoneCompanyId","deliveryZoneFacilityId","deliveryZoneId") REFERENCES compactbiz.delivery_zone("companyId","facilityId",id) ON DELETE CASCADE ON UPDATE CASCADE;`);
        await queryRunner.query(`CREATE TABLE compactbiz.product (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NULL,
            "categoryId" int4 NULL,
            "brandId" int4 NULL,
            unit compactbiz."product_unit_enum" NOT NULL DEFAULT 'pcs'::compactbiz.product_unit_enum,
            "unitWeight" int4 NOT NULL,
            price numeric NOT NULL,
            "isActive" bool NOT NULL DEFAULT true,
            CONSTRAINT "PK_33783a0ac35e7f5d918550255c3" PRIMARY KEY ("companyId", id),
            CONSTRAINT company_product_name UNIQUE ("companyId", name)
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.product ADD CONSTRAINT "FK_a787731a1615cb4ee4d7e99beae" FOREIGN KEY ("companyId","brandId") REFERENCES compactbiz.brand("companyId",id);`);
        await queryRunner.query(`CREATE TABLE compactbiz."order" (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "customerId" int4 NOT NULL,
            id serial4 NOT NULL,
            "type" compactbiz."order_type_enum" NOT NULL,
            status compactbiz."order_status_enum" NOT NULL,
            subtotal numeric NOT NULL DEFAULT '0'::numeric,
            delivery numeric NOT NULL DEFAULT '0'::numeric,
            discount numeric NOT NULL DEFAULT '0'::numeric,
            taxes numeric NOT NULL DEFAULT '0'::numeric,
            total numeric NOT NULL DEFAULT '0'::numeric,
            "driverId" int4 NULL,
            submitted timestamptz NULL,
            completed timestamptz NULL,
            canceled timestamptz NULL,
            "canceledById" int4 NULL,
            "cancelationReason" varchar(255) NOT NULL,
            "completedById" int4 NULL,
            "addressCountry" varchar NULL,
            "addressCity" varchar NULL,
            "addressStreet" varchar NULL,
            "addressStreetnumber" varchar NULL,
            "addressZip" int4 NULL,
            CONSTRAINT "PK_cf8ad5fab0345386b73aec5d030" PRIMARY KEY ("companyId", "facilityId", "customerId", id),
            CONSTRAINT "order_delivery_>=_from_zero" CHECK ((delivery >= (0)::numeric)),
            CONSTRAINT "order_discount_>=_from_zero" CHECK ((discount >= (0)::numeric)),
            CONSTRAINT "order_subtotal_>=_from_zero" CHECK ((subtotal >= (0)::numeric)),
            CONSTRAINT "order_taxes_>=_from_zero" CHECK ((taxes >= (0)::numeric)),
            CONSTRAINT "order_total_>=_from_zero" CHECK ((total >= (0)::numeric))
        );`);
        await queryRunner.query(`CREATE TABLE compactbiz.order_detail (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "customerId" int4 NOT NULL,
            "orderId" int4 NOT NULL,
            "productId" int4 NOT NULL,
            quantity int4 NOT NULL DEFAULT 0,
            price numeric NOT NULL,
            CONSTRAINT "PK_e18aeb5f6520eb8144d745d9da5" PRIMARY KEY ("companyId", "facilityId", "customerId", "orderId", "productId"),
            CONSTRAINT "order_detail_price_>=_0" CHECK ((price >= (0)::numeric)),
            CONSTRAINT "order_detail_quantity_>=_0" CHECK ((quantity >= 0))
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.order_detail ADD CONSTRAINT "FK_919ad61014b211d70b2fdea947c" FOREIGN KEY ("companyId","facilityId","customerId","orderId") REFERENCES compactbiz."order"("companyId","facilityId","customerId",id) ON DELETE CASCADE ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE compactbiz.order_detail ADD CONSTRAINT "FK_c2666901ef6a0450afd91d36ea9" FOREIGN KEY ("companyId","productId") REFERENCES compactbiz.product("companyId",id);`);
        await queryRunner.query(`CREATE TABLE compactbiz.order_detail_quantity (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "customerId" int4 NOT NULL,
            "orderId" int4 NOT NULL,
            "productId" int4 NOT NULL,
            "locationId" int4 NOT NULL,
            "packageId" int4 NOT NULL,
            quantity int4 NOT NULL,
            CONSTRAINT "PK_2094242ebb0bdcb76ab6a1b863c" PRIMARY KEY ("companyId", "facilityId", "customerId", "orderId", "productId", "locationId", "packageId"),
            CONSTRAINT "order_detail_quantity_>_0" CHECK ((quantity > 0))
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.order_detail_quantity ADD CONSTRAINT "FK_089a0ad8b237a337954fa6733c4" FOREIGN KEY ("companyId","facilityId","customerId","orderId","productId") REFERENCES compactbiz.order_detail("companyId","facilityId","customerId","orderId","productId") ON DELETE CASCADE ON UPDATE CASCADE;`);
        await queryRunner.query(`CREATE TABLE compactbiz.supplier (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            id serial4 NOT NULL,
            "name" varchar NOT NULL,
            email varchar NULL,
            phone varchar NULL,
            "isActive" bool NOT NULL DEFAULT true,
            deleted bool NOT NULL DEFAULT false,
            "addressCountry" varchar NULL,
            "addressCity" varchar NULL,
            "addressStreet" varchar NULL,
            "addressStreetnumber" varchar NULL,
            "addressZip" int4 NULL,
            CONSTRAINT "PK_9f9a51f576d6f970ee1a46d2359" PRIMARY KEY ("companyId", id)
        );`);
        await queryRunner.query(`CREATE INDEX "supplier_unique name_per_company" ON compactbiz.supplier USING btree ("companyId", name) WHERE (deleted = false);`);
        await queryRunner.query(`CREATE TABLE compactbiz.package (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            id serial4 NOT NULL,
            "productId" int4 NOT NULL,
            "label" varchar NULL,
            quantity int4 NOT NULL DEFAULT 0,
            reserved int4 NOT NULL DEFAULT 0,
            "temporary" bool NOT NULL DEFAULT true,
            expiration timestamptz NULL,
            CONSTRAINT "PK_7a0f46e5a95a18d2be5a202db8a" PRIMARY KEY ("companyId", "facilityId", id),
            CONSTRAINT package_balance CHECK (((quantity - reserved) >= 0)),
            CONSTRAINT "package_sum_of_quantities_>=_0" CHECK ((quantity >= 0)),
            CONSTRAINT "package_sum_of_reservations_>=_0" CHECK ((reserved >= 0))
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.package ADD CONSTRAINT "FK_4f11176577658ca47d0169cb4d5" FOREIGN KEY ("companyId","productId") REFERENCES compactbiz.product("companyId",id);`);
        await queryRunner.query(`CREATE TABLE compactbiz.package_adjustment (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "packageId" int4 NOT NULL,
            "locationId" int4 NOT NULL,
            id serial4 NOT NULL,
            "userId" int4 NOT NULL,
            "newLocationId" int4 NULL,
            delta int4 NOT NULL,
            note varchar(255) NULL,
            CONSTRAINT "PK_a5e56e00f880130207aa5ee4a20" PRIMARY KEY ("companyId", "facilityId", "packageId", "locationId", id),
            CONSTRAINT "package_adjustment_delta_!=_0" CHECK ((delta <> 0))
        );`);
        await queryRunner.query(`CREATE TABLE compactbiz.package_quantity (
            created timestamptz NOT NULL DEFAULT now(),
            "lastModified" timestamptz NOT NULL DEFAULT now(),
            "companyId" int4 NOT NULL,
            "facilityId" int4 NOT NULL,
            "packageId" int4 NOT NULL,
            "locationId" int4 NOT NULL,
            quantity int4 NOT NULL DEFAULT 0,
            reserved int4 NOT NULL DEFAULT 0,
            "forSale" bool NOT NULL DEFAULT true,
            CONSTRAINT "PK_e44d361caf1776528f1835259e4" PRIMARY KEY ("companyId", "facilityId", "packageId", "locationId"),
            CONSTRAINT "package_quantity_>=_0" CHECK ((quantity >= 0)),
            CONSTRAINT package_quantity_balance CHECK (((quantity - reserved) >= 0)),
            CONSTRAINT "package_reserved_>=_0" CHECK ((reserved >= 0))
        );`);
        await queryRunner.query(`ALTER TABLE compactbiz.package_quantity ADD CONSTRAINT "FK_bcd9458358b4a49553c49f4dd4d" FOREIGN KEY ("companyId","facilityId","locationId") REFERENCES compactbiz."location"("companyId","facilityId",id);`);
        await queryRunner.query(`ALTER TABLE compactbiz.package_quantity ADD CONSTRAINT "FK_faac5c7b3bf01de5ccb935a0bd5" FOREIGN KEY ("companyId","facilityId","packageId") REFERENCES compactbiz.package("companyId","facilityId",id);`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Empty
    }

}
