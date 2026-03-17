import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { OrderStatus, OrderType } from "../enums";
import { BaseModel } from "./baseModel";
import { assert, validator } from "./util";
import { Address } from "./address";
import { OrderDetail } from "./orderDetail";
import { Business } from "./business";

@Entity()
export class Order extends BaseModel<OrderKey> implements OrderKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    facilityId: number;

    @PrimaryColumn()
    businessId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: OrderType, nullable: false })
    type: OrderType;

    @Column({ type: "enum", enum: OrderStatus, nullable: false })
    status: OrderStatus;

    @Column(() => Address)
    @Type(() => Address)
    address: Address;

    @Column({ type: "decimal", default: 0 })
    @Check("order_subtotal_>=_from_zero", `"subtotal" >= 0`)
    subtotal: number;

    @Column({ type: "decimal", default: 0 })
    @Check("order_delivery_>=_from_zero", `"delivery" >= 0`)
    delivery: number;

    @Column({ type: "decimal", default: 0 })
    @Check("order_discount_>=_from_zero", `"discount" >= 0`)
    discount: number;

    @Column({ type: "decimal", default: 0 })
    @Check("order_taxes_>=_from_zero", `"taxes" >= 0`)
    taxes: number;

    @Column({ type: "decimal", default: 0 })
    @Check("order_total_>=_from_zero", `"total" >= 0`)
    total: number;

    @Column({ type: "timestamptz", nullable: true })
    @Type(() => Date)
    submitted?: Date;

    @Column({ type: "timestamptz", nullable: true })
    @Type(() => Date)
    completed?: Date;

    @Column({ type: "timestamptz", nullable: true })
    @Type(() => Date)
    canceled?: Date;

    @Column({ nullable: true })
    canceledById?: number;

    @Column({ length: 255, nullable: true })
    cancelationReason?: string;

    @Column({ length: 255, nullable: true })
    notes?: string;

    @Column({ nullable: true })
    completedById?: number;

    @OneToMany(() => OrderDetail, od => od.order, { persistence: false })
    @Type(() => OrderDetail)
    details: OrderDetail[];

    @ManyToOne(() => Business, b => b.orders, { persistence: false })
    @Type(() => Business)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId"
    }, {
        name: "businessId", referencedColumnName: "id"
    }])
    business: Business;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.facilityId, this.businessId, this.id);
    }

    public get key(): OrderKey {
        return {
            companyId: this.companyId,
            facilityId: this.facilityId,
            businessId: this.businessId,
            id: this.id
        };
    }

    public static parse(identity: string): OrderKey {
        return this.parseIdentity(identity, "companyId", "facilityId", "businessId", "id");
    }

    public static activeStatuses(): OrderStatus[] {
        return [OrderStatus.Pending, OrderStatus.InProgress, OrderStatus.Delivery, OrderStatus.Paused];
    }

    public static inactiveStatuses(): OrderStatus[] {
        return [OrderStatus.Canceled, OrderStatus.Complete, OrderStatus.Refunded];
    }

    public static create(companyId: number, facilityId: number, businessId?: number, type?: OrderType, notes?:string): Order {
        const order = new Order();
        order.companyId = companyId;
        order.facilityId = facilityId;
        order.businessId = businessId ?? null as any;
        order.type = type ?? null as any;
        order.status = OrderStatus.Temporary;
        order.notes = notes ?? null as any;
        validator(order);
        return order;
    }

    public update(type?: OrderType): void {
        this.type = type ?? null as any;
        validator(this);
    }

    public submit(): void {
        assert(this.status === OrderStatus.Temporary, [`Order in status "${this.status}" cannot be submitted`]);
        this.submitted = new Date();
        this.status = OrderStatus.Pending;
        validator(this);
    }

    public start(): void {
        assert(this.status === OrderStatus.Pending, [`Order in status "${this.status}" cannot be started`]);
        this.status = OrderStatus.InProgress;
        validator(this);
    }

    public deliver(): void {
        assert(this.status === OrderStatus.InProgress, [`Order in status "${this.status}" cannot be moved to delivery`]);
        this.status = OrderStatus.Delivery;
        validator(this);
    }

    public complete(userId: number): void {
        assert(Order.activeStatuses().includes(this.status), [`Order in status "${this.status}" cannot be completed`]);
        this.completed = new Date();
        this.completedById = userId;
        this.status = OrderStatus.Complete;
        validator(this);
    }

    public cancel(userId: number, reason?: string): void {
        assert(Order.activeStatuses().includes(this.status), [`Order in status "${this.status}" cannot be canceled`]);
        this.canceled = new Date();
        this.canceledById = userId;
        this.cancelationReason = reason && reason.trim() || null as any;
        this.status = OrderStatus.Canceled;
        validator(this);
    }

    public changeAddress(address: Address): void {
        assert(Order.activeStatuses().includes(this.status), [`Order address cannot be changed in status "${this.status}"`]);
        this.address = address;
    }

}

export interface OrderKey {
    companyId: number;
    facilityId: number;
    businessId: number;
    id: number;
}