import { Column, Entity, Index, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { assert, validator } from "./util";
import { User } from "./user";
import { Vehicle } from "./vehicle";
import { LocationType } from "../enums";
import { DeliveryZone } from "./deliveryZone";
import { PackageQuantity } from "./packageQuantity";
import { DeleteType } from "../enums";

@Entity()
@Index("company_facility_location_name", ["companyId", "facilityId", "name"], { where: `"deleted" = false`, unique: true })
export class Location extends BaseModel<LocationKey> implements LocationKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    facilityId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Location name is required" })
    name: string;

    @Column({ nullable: false, type: "enum", enum: LocationType, default: LocationType.Room })
    type: LocationType;

    @Column({ default: true })
    isActive: boolean;

    @Column(() => Vehicle)
    @Type(() => Vehicle)
    vehicle: Vehicle;

    @Column({ default: false })
    deleted: boolean;

    @Column({ nullable: true })
    driverId?: number;

    @OneToOne(() => User, u => u.location, { persistence: false })
    @Type(() => User)
    @JoinColumn([{
        name: "driverId", referencedColumnName: "id"
    }])
    driver?: User;

    @OneToMany(() => PackageQuantity, pq => pq.location, { persistence: false })
    @Type(() => PackageQuantity)
    packageQuantities: PackageQuantity[];

    @ManyToMany(() => DeliveryZone, dz => dz.assignedToLocations)
    @Type(() => DeliveryZone)
    deliveryZones: DeliveryZone[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.id);
    }

    public get key(): LocationKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            id: this.id
        };
    }

    public static parse(identity: string): LocationKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "id");
    }

    public static create(companyId: number, facilityId: number, locationBody: Partial<Location>): Location {
        const location = new Location();
        location.companyId = companyId;
        location.facilityId = facilityId;
        location.name = locationBody.name || null as any;
        location.isActive = typeof locationBody.isActive === "boolean" ? locationBody.isActive : true;
        if (locationBody.type === LocationType.Vehicle) {
            location.vehicle = Vehicle.create(locationBody.vehicle);
            assert(location.vehicle.isValid(), ["Vehicle data is missing"]);
            location.type = LocationType.Vehicle;
        } else {
            location.vehicle = new Vehicle();
            location.type = LocationType.Room;
        }
        validator(location);
        return location;
    }

    public update(locationBody: Partial<Location>): void {
        this.name = locationBody.name || null as any;
        this.isActive = typeof locationBody.isActive === "boolean" ? locationBody.isActive : true;
        if (this.type === LocationType.Vehicle) {
            this.vehicle.update(locationBody.vehicle);
            assert(this.vehicle.isValid(), ["Vehicle data is missing"]);
        } else {
            this.vehicle = new Vehicle();
        }
        validator(this);
    }

    public delete(): DeleteType {
        this.packageQuantities = this.packageQuantities.filter(pq => pq.quantity > 0);
        this.deleted = true;
        if (this.deliveryZones.length === 0 && this.packageQuantities.length === 0) {
            return DeleteType.Hard;
        }
        return DeleteType.Soft;
    }

}

export interface LocationKey {
    companyId: number;
    facilityId: number;
    id: number;
}