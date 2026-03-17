import { Check, Column, Entity, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseModel } from "./baseModel";
import { Polygon } from "./polygon";
import { Location } from "./location";
import { assert, validator } from "./util";

@Entity()
export class DeliveryZone extends BaseModel<DeliveryZoneKey> implements DeliveryZoneKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    facilityId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "decimal", default: 0 })
    @Check("delivery_zone_fee_>=_0", `"fee" >= 0`)
    fee: number;

    @Column({ type: "decimal", default: 0 })
    @Check("delivery_zone_min_amount_>=_0", `"minAmount" >= 0`)
    minAmount: number;

    @Column({ type: "decimal", default: 0 })
    @Check("delivery_zone_free_min_>=_0", `"freeMin" >= 0`)
    freeMin: number;

    @Column({ type: "polygon", nullable: false })
    @IsNotEmpty({ message: "You cannot save a zone with an empty map. Please draw your zone on the map." })
    @Type(() => Polygon)
    geofence: Polygon;

    @ManyToMany(() => Location, l => l.deliveryZones)
    @Type(() => Location)
    @JoinTable({
        name: "location_delivery_zone"
    })
    assignedToLocations: Location[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.id);
    }

    public get key(): DeliveryZoneKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            id: this.id
        };
    }

    public static parse(identity: string): DeliveryZoneKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "id");
    }

    public static create(companyId: number, facilityId: number, deliveryZoneBody: Partial<DeliveryZone>): DeliveryZone {
        const deliveryZone = new DeliveryZone();
        deliveryZone.companyId = companyId;
        deliveryZone.facilityId = facilityId;
        deliveryZone.name = deliveryZoneBody.name ? deliveryZoneBody.name.trim() : null as any;
        deliveryZone.fee = typeof deliveryZoneBody.fee === "number" ? deliveryZoneBody.fee : 0;
        deliveryZone.minAmount = typeof deliveryZoneBody.minAmount === "number" ? deliveryZoneBody.minAmount : 0;
        deliveryZone.freeMin = typeof deliveryZoneBody.freeMin === "number" ? deliveryZoneBody.freeMin : 0;
        deliveryZone.geofence = deliveryZoneBody.geofence ? deliveryZoneBody.geofence.toString() : null as any;
        validator(deliveryZone);
        return deliveryZone;
    }

    public update(deliveryZoneBody: Partial<DeliveryZone>): void {
        this.name = deliveryZoneBody.name ? deliveryZoneBody.name.trim() : null as any;
        this.fee = typeof deliveryZoneBody.fee === "number" ? deliveryZoneBody.fee : 0;
        this.minAmount = typeof deliveryZoneBody.minAmount === "number" ? deliveryZoneBody.minAmount : 0;
        this.freeMin = typeof deliveryZoneBody.freeMin === "number" ? deliveryZoneBody.freeMin : 0;
        this.geofence = deliveryZoneBody.geofence ? deliveryZoneBody.geofence.toString() : null as any;
        this.validate();
        validator(this);
    }

    private validate(): void {
        assert(typeof this.fee !== "number" || this.fee >= 0, ["Delivery zone fee must be larger than zero"]);
        assert(typeof this.freeMin !== "number" || this.freeMin >= 0, ["Delivery zone free minimum amount must be larger than zero"]);
        assert(typeof this.minAmount !== "number" || this.minAmount >= 0, ["Delivery zone minimum amount must be larger than zero"]);
    }

}

export interface DeliveryZoneKey {
    companyId: number;
    facilityId: number;
    id: number;
}