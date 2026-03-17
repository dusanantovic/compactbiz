import { IsNotEmpty } from "class-validator";
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "./baseModel";
import { assert } from "./util";
import { PackageAdjustmentType } from "../enums";
import { PackageQuantity } from "./packageQuantity";
import { Type } from "class-transformer";

@Entity()
export class PackageAdjustment extends BaseModel<PackageAdjustmentKey> implements PackageAdjustmentKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    facilityId: number;

    @PrimaryColumn()
    packageId: number;

    @PrimaryColumn()
    locationId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Package adjustment user is required" })
    userId: number;

    @Column({ nullable: true })
    newLocationId?: number;

    @Column({ nullable: false })
    @Check("package_adjustment_delta_!=_0", `"delta" != 0`)
    delta: number;

    @Column({ nullable: true, length: 255 })
    note?: string;

    @Column({ type: "enum", nullable: false, enum: PackageAdjustmentType })
    type: PackageAdjustmentType;

    @Column({ nullable: true })
    businessId?: number;

    @Column({ nullable: true })
    orderId?: number;

    @ManyToOne(() => PackageQuantity, pq => pq.packageAdjustments, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => PackageQuantity)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "facilityId", referencedColumnName: "facilityId"
    }, {
        name: "packageId", referencedColumnName: "packageId"
    }, {
        name: "locationId", referencedColumnName: "locationId"
    }])
    packageQuantity: PackageQuantity;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): PackageAdjustmentKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            packageId: this.packageId,
            locationId: this.locationId
        };
    }

    public static parse(identity: string): PackageAdjustmentKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "packageId", "locationId");
    }

    public static create(companyId: number, facilityId: number, packageId: number, locationId: number, userId: number, delta: number, type: PackageAdjustmentType, note?: string, businessId?: number, orderId?: number, newLocationId?: number): PackageAdjustment {
        const packageAdjustment = new PackageAdjustment();
        packageAdjustment.companyId = companyId;
        packageAdjustment.facilityId = facilityId;
        packageAdjustment.packageId = packageId;
        packageAdjustment.locationId = locationId;
        packageAdjustment.userId = userId;
        assert(delta !== 0, ["Package adjustment quantity must be less or larger than zero"]);
        packageAdjustment.delta = delta;
        packageAdjustment.newLocationId = newLocationId || null as any;
        assert(!note || note.trim().length <= 255, ["Package adjustment note lenght can contain maximum 255 characters"]);
        packageAdjustment.note = note ? note.trim() : null as any;
        packageAdjustment.type = type;
        packageAdjustment.businessId = businessId || null as any;
        packageAdjustment.orderId = orderId || null as any;
        return packageAdjustment;
    }

}

export interface PackageAdjustmentKey {
    companyId: number;
    facilityId: number;
    packageId: number;
    locationId: number;
}