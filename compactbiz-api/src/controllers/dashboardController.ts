import { Role, OrderStatus, PackageAdjustmentType, OrderType } from "../../models/enums";
import { assert } from "../../models/src/util";
import { Authorized, Controller, Get } from "routing-controllers";
import { BaseController } from "./baseController";
import { AppCtx, Context } from "../../context";

@Controller()
export class DashboardController extends BaseController {

    @Get("/dashboard")
    @Authorized([Role.Owner, Role.Manager, Role.InventoryManager, Role.Warehouseman, Role.Cashier, Role.Sales, Role.Driver])
    public async getDashboard(@AppCtx() context: Context): Promise<object> {
        const { company, facilityId, user } = context.state;
        assert(company, ["Missing company"]);
        assert(facilityId, ["Missing facilityId"]);

        const companyId = company.id;

        const orderStats = await this.getOrderStats(companyId, facilityId!);

        const countByStatus = (status: OrderStatus) =>
            orderStats
                .filter((r: any) => r.status === status)
                .reduce((sum: number, r: any) => sum + parseInt(r.count || "0", 10), 0);

        if (user?.role === Role.Warehouseman || user?.role === Role.Driver || user?.role === Role.Cashier) {
            return {
                orders: {
                    pending: countByStatus(OrderStatus.Pending),
                    inProgress: countByStatus(OrderStatus.InProgress),
                    completed: countByStatus(OrderStatus.Complete),
                    canceled: countByStatus(OrderStatus.Canceled),
                },
            };
        }

        const [recentOrders, productCount, lowStockProducts, topProducts] = await Promise.all([
            this.getRecentOrders(companyId, facilityId!),
            this.getProductCount(companyId),
            this.getLowStockProducts(companyId, facilityId!),
            this.getTopProducts(companyId, facilityId!),
        ]);

        const sellRevenue = orderStats
            .filter((r: any) => r.type === OrderType.Sell && r.status === OrderStatus.Complete)
            .reduce((sum: number, r: any) => sum + parseFloat(r.total || "0"), 0);

        const purchaseCost = orderStats
            .filter((r: any) => r.type === OrderType.Purchase && r.status === OrderStatus.Complete)
            .reduce((sum: number, r: any) => sum + parseFloat(r.total || "0"), 0);

        return {
            orders: {
                pending: countByStatus(OrderStatus.Pending),
                inProgress: countByStatus(OrderStatus.InProgress),
                completed: countByStatus(OrderStatus.Complete),
                canceled: countByStatus(OrderStatus.Canceled),
                sellRevenue,
                purchaseCost,
            },
            products: {
                total: productCount,
                lowStock: lowStockProducts,
            },
            recentOrders,
            topProducts,
        };
    }

    private async getOrderStats(companyId: number, facilityId: number): Promise<any[]> {
        return this.connection.query(`
            SELECT o."type", o."status", COUNT(*) AS count, COALESCE(SUM(o."total"), 0) AS total
            FROM compactbiz."order" o
            WHERE o."companyId" = $1
              AND o."facilityId" = $2
              AND o."status" != $3
            GROUP BY o."type", o."status"
        `, [companyId, facilityId, OrderStatus.Temporary]);
    }

    private async getRecentOrders(companyId: number, facilityId: number): Promise<any[]> {
        return this.connection.query(`
            SELECT
                o."id",
                o."type",
                o."status",
                o."total",
                o."submitted",
                b."name" AS "businessName"
            FROM compactbiz."order" o
            LEFT JOIN compactbiz."business" b
                ON b."companyId" = o."companyId"
               AND b."id" = o."businessId"
            WHERE o."companyId" = $1
              AND o."facilityId" = $2
              AND o."status" != $3
            ORDER BY o."submitted" DESC NULLS LAST, o."id" DESC
            LIMIT 10
        `, [companyId, facilityId, OrderStatus.Temporary]);
    }

    private async getProductCount(companyId: number): Promise<number> {
        const rows = await this.connection.query(`
            SELECT COUNT(*) AS count
            FROM compactbiz."product"
            WHERE "companyId" = $1
        `, [companyId]);
        return parseInt(rows[0]?.count || "0", 10);
    }

    private async getLowStockProducts(companyId: number, facilityId: number): Promise<any[]> {
        return this.connection.query(`
            SELECT
                p."id",
                p."name",
                COALESCE((
                    SELECT SUM(pa."delta")
                    FROM compactbiz."package" pkg
                    LEFT JOIN compactbiz."package_adjustment" pa
                        ON pa."companyId" = pkg."companyId"
                       AND pa."facilityId" = pkg."facilityId"
                       AND pa."packageId" = pkg."id"
                    WHERE pkg."companyId" = p."companyId"
                      AND pkg."facilityId" = $2
                      AND pkg."productId" = p."id"
                ), 0) AS quantity
            FROM compactbiz."product" p
            WHERE p."companyId" = $1
              AND COALESCE((
                    SELECT SUM(pa2."delta")
                    FROM compactbiz."package" pkg2
                    LEFT JOIN compactbiz."package_adjustment" pa2
                        ON pa2."companyId" = pkg2."companyId"
                       AND pa2."facilityId" = pkg2."facilityId"
                       AND pa2."packageId" = pkg2."id"
                    WHERE pkg2."companyId" = p."companyId"
                      AND pkg2."facilityId" = $2
                      AND pkg2."productId" = p."id"
                ), 0) <= 5
            ORDER BY quantity ASC
            LIMIT 10
        `, [companyId, facilityId]);
    }

    private async getTopProducts(companyId: number, facilityId: number): Promise<any[]> {
        return this.connection.query(`
            SELECT
                p."id" AS "productId",
                p."name",
                SUM(ABS(pa."delta")) AS "totalSold"
            FROM compactbiz."package_adjustment" pa
            INNER JOIN compactbiz."package" pkg
                ON pkg."companyId" = pa."companyId"
               AND pkg."facilityId" = pa."facilityId"
               AND pkg."id" = pa."packageId"
            INNER JOIN compactbiz."product" p
                ON p."companyId" = pkg."companyId"
               AND p."id" = pkg."productId"
            WHERE pkg."companyId" = $1
              AND pkg."facilityId" = $2
              AND pa."type" = $3
            GROUP BY p."id", p."name"
            ORDER BY "totalSold" DESC
            LIMIT 5
        `, [companyId, facilityId, PackageAdjustmentType.SellOrder]);
    }

}
