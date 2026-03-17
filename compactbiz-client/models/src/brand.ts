import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseModel } from "./baseModel";
import { Product } from "./product";
import { validator } from "./util";

@Entity()
@Unique("company_brand_name", ["companyId", "name"])
export class Brand extends BaseModel<BrandKey> implements BrandKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Product, p => p.brand, { onDelete: "SET NULL", onUpdate: "NO ACTION" })
    @Type(() => Product)
    products: Product[];

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Brand name is required" })
    name: string;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): BrandKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): BrandKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, brandBody: Partial<Brand>): Brand {
        const brand = new Brand();
        brand.companyId = companyId;
        brand.name = brandBody.name ? (brandBody.name.trim() || null) : null as any;
        validator(brand);
        return brand;
    }

    public update(brandBody: Partial<Brand>): void {
        this.name = brandBody.name ? (brandBody.name.trim() || null) : null as any;
        validator(this);
    }

}

export interface BrandKey {
    companyId: number;
    id: number;
}