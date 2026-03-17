import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { BaseModel } from "./baseModel";
import { validator } from "./util";
import { Type } from "class-transformer";
import { Company, Order } from ".";
import { Address } from "./address";

@Entity()
export class Business extends BaseModel<BusinessKey> implements BusinessKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    @Index("business_company_name", { unique: true })
    @IsNotEmpty({ message: "Business name is required" })
    name: string;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @ManyToOne(() => Company, c => c.businesses, { persistence: false })
    @Type(() => Company)
    company: Company;

    @OneToMany(() => Order, o => o.business, { persistence: false })
    @Type(() => Order)
    orders: Order[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): BusinessKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): BusinessKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, businessBody: Partial<Business>): Business {
        const business = new Business();
        business.companyId = companyId;
        business.name = (businessBody.name ? (businessBody.name.trim() || null) : null) as any;
        business.address = Address.create(businessBody.address);
        validator(business);
        return business;
    }

    public update(businessBody: Partial<Business>): void {
        this.name = businessBody.name || null as any;
        this.address.update(businessBody.address);
        validator(this);
    }

}

export interface BusinessKey {
    companyId: number;
    id: number;
}