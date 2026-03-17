import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsEmail, IsOptional } from "class-validator";
import { BaseModel } from "./baseModel";
import { Address } from "./address";
import { trimAndLowerCase, validPhone, validator } from "./util";
import { InvalidPhoneNumber } from "./user";
import { DeleteType } from "../enums";

@Entity()
@Index("supplier_unique name_per_company", ["companyId", "name"], { where: `"deleted" = false` })
export class Supplier extends BaseModel<SupplierKey> implements SupplierKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @Column({ update: false, nullable: true })
    @IsEmail()
    @IsOptional()
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    deleted: boolean;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): SupplierKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): SupplierKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, supplierBody: Partial<Supplier>): Supplier {
        const supplier = new Supplier();
        supplier.companyId = companyId;
        supplier.email = trimAndLowerCase(supplierBody.email) as any;
        supplier.setPhone(supplierBody.phone);
        supplier.name = supplierBody.name || null as any;
        supplier.address = Address.create(supplierBody.address);
        supplier.isActive = typeof supplierBody.isActive === "boolean" ? supplierBody.isActive : true;
        validator(supplier);
        return supplier;
    }

    public update(supplierBody: Partial<Supplier>): void {
        this.email = trimAndLowerCase(supplierBody.email) as any;
        this.setPhone(supplierBody.phone);
        this.name = supplierBody.name || null as any;
        this.address.update(supplierBody.address);
        this.isActive = typeof supplierBody.isActive === "boolean" ? supplierBody.isActive : true;
        validator(this);
    }

    public delete(): DeleteType {
        this.deleted = true;
        return DeleteType.Hard;
        // return DeleteType.Soft;
    }

    private setPhone(phone?: string): void {
        if (phone && phone.trim()) {
            const isPhoneValid = validPhone(phone.trim());
            if (!isPhoneValid) {
                throw new InvalidPhoneNumber();
            }
            this.phone = phone.trim();
        } else {
            this.phone = null as any;
        }
    }

}

export interface SupplierKey {
    companyId: number;
    id: number;
}