import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { Location } from "./location";
import { Package } from "./package";
import { PackageAdjustment } from "./packageAdjustment";

@Entity()
@Check("package_quantity_balance", `"quantity" - "reserved" >= 0`)
export class PackageQuantity extends BaseModel<PackageQuantityKey> implements PackageQuantityKey {

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

    @Column({ default: 0 })
    @Check("package_quantity_>=_0", `"quantity" >= 0`)
    quantity: number;

    @Column({ default: 0 })
    @Check("package_reserved_>=_0", `"reserved" >= 0`)
    reserved: number;

    @Column({ default: true })
    forSale: boolean;

    @ManyToOne(() => Package, p => p.packageQuantities, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => Package)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "facilityId", referencedColumnName: "facilityId"
    }, {
        name: "packageId", referencedColumnName: "id"
    }])
    package: Package;

    @ManyToOne(() => Location, l => l.packageQuantities, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => Location)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "facilityId", referencedColumnName: "facilityId"
    }, {
        name: "locationId", referencedColumnName: "id"
    }])
    location: Location;

    @OneToMany(() => PackageAdjustment, pa => pa.packageQuantity, { persistence: false })
    @Type(() => PackageAdjustment)
    packageAdjustments: PackageAdjustment[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.packageId, this.locationId);
    }

    public get key(): PackageQuantityKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            packageId: this.packageId,
            locationId: this.locationId
        };
    }

    public static parse(identity: string): PackageQuantityKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "packageId", "locationId");
    }

    public static create(companyId: number, facilityId: number, packageId: number, locationId: number, forSale: boolean): PackageQuantity {
        const packageQuantity = new PackageQuantity();
        packageQuantity.companyId = companyId;
        packageQuantity.facilityId = facilityId;
        packageQuantity.packageId = packageId;
        packageQuantity.locationId = locationId;
        packageQuantity.quantity = 0;
        packageQuantity.reserved = 0;
        packageQuantity.forSale = forSale;
        return packageQuantity;
    }

    public setForSale(forSale: boolean): void {
        this.forSale = forSale;
    }

}

export interface PackageQuantityKey {
    companyId: number;
    facilityId: number;
    packageId: number;
    locationId: number;
}