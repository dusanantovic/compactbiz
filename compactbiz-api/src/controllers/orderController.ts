import { OrderStatus, Role } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Response } from "express";
import { Authorized, Body, Controller, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { OrderRepository } from "../repositories";
import { AppCtx, Context } from "../../context";
import { OrderService } from "../services";
import { Order } from "../../models";

@Controller()
export class OrderController extends BaseController {

    private readonly orderRepo: OrderRepository;

    public constructor() {
        super();
        this.orderRepo = this.repositoryProvider.getCustomRepository(Order, OrderRepository);
    }

    @Post("/orders")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async createOrder(@Body() orderBody: Partial<Order>, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId, user } = context.state;
        const errors: string[] = [];
        if (!company) {
            errors.push("Missing company");
        }
        if (!facilityId) {
            errors.push("Missing facility");
        }
        if (!user) {
            errors.push("Missing user");
        }
        assert(errors.length === 0, errors);
        let result = await this.connection.transaction(async manager => {
            const orderService = new OrderService(manager);
            const savedOrder = await orderService.create(company!.id, facilityId!, user!.id, orderBody);
            return savedOrder;
        });
        result = (await this.orderRepo.browseOne(result.key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
        return result;
    }

    @Put("/orders/:id")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async editOrder(@Param("id") id: string, @Body() orderBody: Partial<Order>, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId, user } = context.state;
        const errors: string[] = [];
        if (!company) {
            errors.push("Missing company");
        }
        if (!facilityId) {
            errors.push("Missing facility");
        }
        if (!user) {
            errors.push("Missing user");
        }
        assert(errors.length === 0, errors);
        const key = Order.parse(id);
        key.companyId = company!.id;
        key.facilityId = facilityId!;
        let result = await this.connection.transaction(async manager => {
            const orderService = new OrderService(manager);
            const savedOrder = await orderService.edit(user!.id, key, orderBody);
            return savedOrder;
        });
        result = (await this.orderRepo.browseOne(result.key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
        return result;
    }

    @Post("/orders/:id/submit")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async submitOrder(@Param("id") id: string, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const key = Order.parse(id);
        key.companyId = company!.id;
        key.facilityId = facilityId!;
        const order = await this.orderRepo.browseOne(key, {});
        assert(order, ["Order doesn't exist"]);
        order!.submit();
        await this.orderRepo.save(order!);
        return (await this.orderRepo.browseOne(key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
    }

    @Post("/orders/:id/start")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales])
    public async startOrder(@Param("id") id: string, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const key = Order.parse(id);
        key.companyId = company!.id;
        key.facilityId = facilityId!;
        const order = await this.orderRepo.browseOne(key, {});
        assert(order, ["Order doesn't exist"]);
        order!.start();
        await this.orderRepo.save(order!);
        return (await this.orderRepo.browseOne(key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
    }

    @Post("/orders/:id/complete")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales, Role.Driver])
    public async completeOrder(@Param("id") id: string, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId, user } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        assert(user, ["Missing user"]);
        const key = Order.parse(id);
        key.companyId = company!.id;
        key.facilityId = facilityId!;
        const order = await this.orderRepo.browseOne(key, {});
        assert(order, ["Order doesn't exist"]);
        order!.complete(user!.id);
        await this.orderRepo.save(order!);
        return (await this.orderRepo.browseOne(key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
    }

    @Post("/orders/:id/deliver")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales, Role.Warehouseman])
    public async deliverOrder(@Param("id") id: string, @AppCtx() context: Context): Promise<Order> {
        const { company, facilityId } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facility"]);
        const key = Order.parse(id);
        key.companyId = company!.id;
        key.facilityId = facilityId!;
        const order = await this.orderRepo.browseOne(key, {});
        assert(order, ["Order doesn't exist"]);
        order!.deliver();
        await this.orderRepo.save(order!);
        return (await this.orderRepo.browseOne(key, {
            relations: ["details", "details.quantities", "details.product", "business"]
        }))!;
    }

    @Get("/orders")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Warehouseman, Role.Sales, Role.Driver])
    public async getOrders(@AppCtx() context: Context, @Res() response: Response): Promise<Order[]> {
        const { company, user } = context.state;
        assert(company, ["Missing company"]);
        const options = this.extractQuery(context);
        options.relations = ["business"];
        if (user?.role === Role.Warehouseman) {
            options.where = { ...((options.where as object) ?? {}), status: OrderStatus.InProgress };
        }
        if (user?.role === Role.Driver) {
            options.where = { ...((options.where as object) ?? {}), status: OrderStatus.Delivery };
        }
        const [orders, count] = await this.orderRepo.browse(company.id, options);
        response.set("content-range", count.toString());
        return orders;
    }

    @Get("/orders/:identity([-0-9]+)")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Sales, Role.Warehouseman, Role.Driver])
    public async getOrderByIdentity(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Order> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const orderKey = Order.parse(identity);
        orderKey.companyId = company.id;
        const options = this.extractQuery(context);
        options.relations = ["details", "details.quantities", "details.product", "business"];
        const orderDb = await this.orderRepo.browseOne(orderKey, options);
        assert(orderDb, ["Order doesn't exist"]);
        return orderDb;
    }

}