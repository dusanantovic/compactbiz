import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseModel } from "./baseModel";
import { validator } from "./util";
import { PackageQuantity } from "./packageQuantity";
import { Product } from "./product";

@Entity()
@Check("package_balance", `"quantity" - "reserved" >= 0`)
@Index("company_facility_product", ["companyId", "facilityId", "productId"], { unique: true })
export class Package extends BaseModel<PackageKey> implements PackageKey {

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
    @IsNotEmpty({ message: "Package product is required" })
    productId: number;

    @Column({ nullable: true })
    label?: string;

    @Column({ nullable: false, default: 0 })
    @Check("package_sum_of_quantities_>=_0", `"quantity" >= 0`)
    quantity: number;

    @Column({ nullable: false, default: 0 })
    @Check("package_sum_of_reservations_>=_0", `"reserved" >= 0`)
    reserved: number;

    @Column({ default: true })
    temporary: boolean;

    @Column({ type: "timestamptz", nullable: true })
    @Type(() => Date)
    expiration?: Date;

    @ManyToOne(() => Product, p => p.packages, { persistence: false })
    @Type(() => Product)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "productId", referencedColumnName: "id"
    }])
    product: Product;

    @OneToMany(() => PackageQuantity, pq => pq.package, { persistence: false })
    @Type(() => PackageQuantity)
    packageQuantities: PackageQuantity[];

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.id);
    }

    public get key(): PackageKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            id: this.id
        };
    }

    public static parse(identity: string): PackageKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "id");
    }

    public static create(companyId: number, facilityId: number, packageBody: Partial<Package>, quantity?: number): Package {
        const pkg = new Package();
        pkg.companyId = companyId;
        pkg.facilityId = facilityId;
        pkg.productId = packageBody.productId || null as any;
        pkg.label = packageBody.label ? packageBody.label.trim() : null as any;
        pkg.expiration = packageBody.expiration || null as any;
        pkg.quantity = quantity || 0;
        pkg.reserved = 0;
        pkg.temporary = true;
        validator(pkg);
        return pkg;
    }

    public update(packageBody: Partial<Package>): void {
        this.label = packageBody.label ? packageBody.label.trim() : null as any;
        validator(this);
    }

    public activate(): void {
        this.temporary = false;
    }

}

export interface PackageKey {
    companyId: number;
    facilityId: number;
    id: number;
}