import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { validator } from "./util";
import { Order } from "./order";
import { Product } from "./product";

@Entity()
export class OrderDetail extends BaseModel<OrderDetailKey> implements OrderDetailKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    facilityId: number;

    @PrimaryColumn()
    businessId: number;

    @PrimaryColumn()
    orderId: number;

    @PrimaryColumn()
    productId: number;

    @Column({ default: 0, nullable: false })
    @Check("order_detail_quantity_>=_0", `"quantity" >= 0`)
    quantity: number;

    @Column({ type: "decimal", nullable: false })
    @Check("order_detail_price_>=_0", `"price" >= 0`)
    price: number;

    @ManyToOne(() => Order, o => o.details, { onUpdate: "CASCADE", onDelete: "CASCADE" })
    @Type(() => Order)
    @JoinColumn([
        { name: "companyId", referencedColumnName: "companyId" },
        { name: "facilityId", referencedColumnName: "facilityId" },
        { name: "businessId", referencedColumnName: "businessId" },
        { name: "orderId", referencedColumnName: "id" }
    ])
    order: Order;

    @ManyToOne(() => Product, p => p.bought, { persistence: false })
    @Type(() => Product)
    @JoinColumn([
        { name: "companyId", referencedColumnName: "companyId" },
        { name: "productId", referencedColumnName: "id" }
    ])
    product: Product;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.businessId, this.orderId, this.productId);
    }

    public get key(): OrderDetailKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            businessId: this.businessId,
            orderId: this.orderId,
            productId: this.productId
        };
    }

    public static parse(identity: string): OrderDetailKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "businessId", "orderId", "productId");
    }

    public static create(companyId: number, facilityId: number, businessId: number, orderId: number, productId: number, price: number): OrderDetail {
        const orderDetail = new OrderDetail();
        orderDetail.companyId = companyId;
        orderDetail.facilityId = facilityId;
        orderDetail.businessId = businessId;
        orderDetail.orderId = orderId;
        orderDetail.productId = productId;
        orderDetail.price = price;
        validator(orderDetail);
        return orderDetail;
    }

}

export interface OrderDetailKey {
    companyId: number;
    facilityId: number;
    businessId: number;
    orderId: number;
    productId: number;
}