import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { assert, validator } from "./util";
import { OrderType } from "../enums";
import { Business } from "./business";
import { Product } from "./product";

@Entity()
@Unique("company_business_product_type", ["companyId", "businessId", "productId", "type"])
export class ProductPrice extends BaseModel<ProductPriceKey> implements ProductPriceKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    businessId: number;

    @PrimaryColumn()
    productId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", nullable: false })
    @IsNotEmpty({ message: "Product price is required" })
    @Check("product_price_>=_0", `"price" >= 0`)
    price: number;

    @Column({ type: "enum", enum: OrderType, nullable: false })
    type: OrderType;

    @ManyToOne(() => Business, { persistence: false })
    @Type(() => Business)
    @JoinColumn([{
        name: "companyId",
        referencedColumnName: "companyId"
    }, {
        name: "businessId",
        referencedColumnName: "id"
    }])
    business: Business;

    @ManyToOne(() => Product, p => p.prices, { onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @Type(() => Product)
    @JoinColumn([{
        name: "companyId",
        referencedColumnName: "companyId"
    }, {
        name: "productId",
        referencedColumnName: "id"
    }])
    product: Product;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.businessId, this.productId, this.id);
    }

    public get key(): ProductPriceKey {
        return {
            companyId: this.companyId,
            businessId: this.businessId,
            productId: this.productId,
            id: this.id
        };
    }

    public static parse(identity: string): ProductPriceKey {
        return this.parseIdentity(identity, "companyId", "businessId", "productId", "id");
    }

    public static create(companyId: number, businessId: number, productId: number, price: number, type: OrderType): ProductPrice {
        this.validation(price);
        const productPrice = new ProductPrice();
        productPrice.companyId = companyId;
        productPrice.businessId = businessId;
        productPrice.productId = productId;
        productPrice.price = price;
        productPrice.type = type || null as any;
        validator(productPrice);
        return productPrice;
    }

    public update(price: number): void {
        ProductPrice.validation(price);
        this.price = price;
        validator(this);
    }

    private static validation(price: number): void {
        assert(price >= 0, ["Price can be equal or greather than zero"]);
    }

}

export interface ProductPriceKey {
    companyId: number;
    businessId: number;
    productId: number;
    id: number;
}