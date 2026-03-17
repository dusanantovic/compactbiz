import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { trimAndLowerCase, validator } from "./util";
import { User } from "./user";
import { Address } from "./address";
import { Company } from "./company";

@Entity()
@Unique("company_facility_name", ["companyId", "name"])
export class Facility extends BaseModel<FacilityKey> implements FacilityKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Facility name is required" })
    name: string;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Facility email is required" })
    @IsEmail({ ignore_max_length: false, require_tld: true, allow_ip_domain: false })   
    email: string;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @Column({ default: false })
    deleted: boolean;

    @ManyToOne(() => Company, c => c.facilities, { persistence: false })
    @Type(() => Company)
    company: Company;

    @ManyToMany(() => User, u => u.facilities, { persistence: true })
    @Type(() => User)
    @JoinTable({
        name: "facility_staff",
        joinColumns: [
            { name: "companyId", referencedColumnName: "companyId" },
            { name: "facilityId", referencedColumnName: "id" }
        ],
        inverseJoinColumns: [{
            name: "userId", referencedColumnName: "id"
        }]
    })
    staff: User[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): FacilityKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): FacilityKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, facilityBody: Partial<Facility>): Facility {
        const facility = new Facility();
        facility.companyId = companyId;
        facility.name = facilityBody.name || null as any;
        facility.email = trimAndLowerCase(facilityBody.email) as any;
        facility.address = Address.create(facilityBody.address);
        validator(facility);
        return facility;
    }

    public update(facilityBody: Partial<Facility>): void {
        this.name = facilityBody.name || null as any;
        this.email = trimAndLowerCase(facilityBody.email) as any;
        this.address.update(facilityBody.address);
        validator(this);
    }

    public delete(): void {
        this.deleted = true;
    }

}

export interface FacilityKey {
    companyId: number;
    id: number;
}