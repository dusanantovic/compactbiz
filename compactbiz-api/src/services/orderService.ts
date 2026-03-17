import { EntityManager } from "typeorm";
import { Location, Order, OrderDetail, PackageAdjustment } from "../../models";
import { assert } from "../../models/src/util";
import { OrderKey } from "../../models/interfaces";
import { LocationRepository, OrderDetailRepository, OrderRepository, PackageAdjustmentRepository, RepositoryProvider } from "../repositories";
import { PackageService } from "./packageService";
import { LocationType, OrderType } from "../../models/enums";
import { ProductPriceService } from "./productPriceService";

export class OrderService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly orderRepo: OrderRepository;
    private readonly orderDetailRepo: OrderDetailRepository;
    private readonly locationRepo: LocationRepository;
    private readonly packageAdjustmentRepo: PackageAdjustmentRepository;
    private readonly manager: EntityManager;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.orderRepo = this.repositoryProvider.getCustomRepository(Order, OrderRepository);
        this.orderDetailRepo = this.repositoryProvider.getCustomRepository(OrderDetail, OrderDetailRepository);
        this.locationRepo = this.repositoryProvider.getCustomRepository(Location, LocationRepository);
        this.packageAdjustmentRepo = this.repositoryProvider.getCustomRepository(PackageAdjustment, PackageAdjustmentRepository);
        this.manager = manager;
    }

    public async create(companyId: number, facilityId: number, userId: number, orderBody: Partial<Order>): Promise<Order> {
        assert((orderBody.details ?? []).length > 0, ["Missing order items"]);
        const packageService = new PackageService(this.manager);
        const productPriceService = new ProductPriceService(this.manager);
        const order = Order.create(companyId, facilityId, orderBody.businessId, orderBody.type, orderBody.notes);
        const savedOrder = await this.orderRepo.save(order);
        const orderDetails: OrderDetail[] = [];
        orderBody.details!.forEach(od => {
            const orderDetail = OrderDetail.create(companyId, facilityId, savedOrder.businessId, savedOrder.id, od.productId, od.price);
            orderDetail.quantity = od.quantity;
            orderDetails.push(orderDetail);
        });
        const defaultLocation = await this.locationRepo.findOneByOrFail({ companyId, facilityId, type: LocationType.Room });
        if (savedOrder.type === OrderType.Purchase) {
            await packageService.createPurchaseOrder(companyId, facilityId, userId, defaultLocation.id, savedOrder.businessId, savedOrder.id, orderDetails.map(od => ({
                productId: od.productId,
                quantity: od.quantity
            })));
        } else {
            await packageService.createSellOrder(companyId, facilityId, userId, defaultLocation.id, savedOrder.businessId, savedOrder.id, orderDetails.map(od => ({
                productId: od.productId,
                quantity: od.quantity
            })));
        }
        await productPriceService.handleProductPrices(companyId, savedOrder.businessId, savedOrder.type, orderDetails.map(od => ({
            productId: od.productId,
            price: od.price
        })));
        order.details = await this.orderDetailRepo.save(orderDetails);
        return order;
    }

    public async edit(userId: number, orderKey: OrderKey, orderBody: Partial<Order>): Promise<Order> {
        assert((orderBody.details ?? []).length > 0, ["Missing order items"]);
        const { companyId, facilityId } = orderKey;
        const orderDb = await this.orderRepo.findOneOrFail({ where: orderKey, relations: ["details"]});
        await this.orderDetailRepo.delete({ companyId, facilityId, orderId: orderDb.id });
        await this.packageAdjustmentRepo.delete({ companyId, facilityId, orderId: orderDb.id });
        const packageService = new PackageService(this.manager);
        const productPriceService = new ProductPriceService(this.manager);
        orderDb.update(orderBody.type);
        await this.orderRepo.save(orderDb);
        const orderDetails: OrderDetail[] = [];
        orderBody.details!.forEach(od => {
            const orderDetail = OrderDetail.create(companyId, facilityId, orderDb.businessId, orderDb.id, od.productId, od.price);
            orderDetail.quantity = od.quantity;
            orderDetails.push(orderDetail);
        });
        const defaultLocation = await this.locationRepo.findOneByOrFail({ companyId, facilityId, type: LocationType.Room });
        if (orderDb.type === OrderType.Purchase) {
            await packageService.createPurchaseOrder(companyId, facilityId, userId, defaultLocation.id, orderDb.businessId, orderDb.id, orderDetails.map(od => ({
                productId: od.productId,
                quantity: od.quantity
            })));
        } else {
            await packageService.createSellOrder(companyId, facilityId, userId, defaultLocation.id, orderDb.businessId, orderDb.id, orderDetails.map(od => ({
                productId: od.productId,
                quantity: od.quantity
            })));
        }
        await productPriceService.handleProductPrices(companyId, orderDb.businessId, orderDb.type, orderDetails.map(od => ({
            productId: od.productId,
            price: od.price
        })));
        orderDb.details = await this.orderDetailRepo.save(orderDetails);
        return orderDb;
    }

}