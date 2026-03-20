import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { validator } from "./util";
import { Brand } from "./brand";
import { Package } from "./package";
import { OrderDetail } from "./orderDetail";
import { MeasurementUnit } from "../enums";
import { ProductPrice } from "./productPrice";

@Entity()
@Unique("company_product_name", ["companyId", "name"])
export class Product extends BaseModel<ProductKey> implements ProductKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    categoryId?: number;

    @Column({ nullable: true })
    brandId?: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "enum", enum: MeasurementUnit, default: MeasurementUnit.Piece })
    unit: MeasurementUnit;

    @Column({ nullable: false, default: 1 })
    //@IsNotEmpty({ message: "Product unit weight is required" })
    @Check("unit_weight_>_0", `"unitWeight" > 0`)
    unitWeight: number;

    @ManyToOne(() => Brand, b => b.products, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
    @Type(() => Brand)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "brandId", referencedColumnName: "id"
    }])
    brand: Brand;

    @OneToMany(() => Package, p => p.product, { persistence: false })
    @Type(() => Package)
    packages: Package[];

    @OneToMany(() => OrderDetail, od => od.product, { persistence: false })
    @Type(() => OrderDetail)
    bought: OrderDetail[];

    @OneToMany(() => ProductPrice, pp => pp.product, { onDelete: "NO ACTION", onUpdate: "NO ACTION" })
    @Type(() => ProductPrice)
    prices: ProductPrice[];

    quantity: number;
    reserved: number;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): ProductKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): ProductKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, productBody: Partial<Product>): Product {
        const product = new Product();
        product.companyId = companyId;
        product.name = productBody.name ? (productBody.name.trim() || null) : null as any;
        product.brandId = productBody.brandId || null as any;
        product.categoryId = productBody.categoryId || null as any;
        if (productBody.unit) {
            product.unit = productBody.unit;
        }
        if (productBody.unitWeight) {
            product.unitWeight = productBody.unitWeight;
        }
        product.isActive = typeof productBody.isActive === "boolean" ? productBody.isActive : true;
        validator(product);
        return product;
    }

    public update(productBody: Partial<Product>): void {
        this.name = productBody.name ? (productBody.name.trim() || null) : null as any;
        this.brandId = productBody.brandId || null as any;
        this.categoryId = productBody.categoryId || null as any;
        if (productBody.unit) {
            this.unit = productBody.unit;
        }
        if (productBody.unitWeight) {
            this.unitWeight = productBody.unitWeight;
        }
        this.isActive = typeof productBody.isActive === "boolean" ? productBody.isActive : true;
        validator(this);
    }

}

export interface ProductKey {
    companyId: number;
    id: number;
}