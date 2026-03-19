import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslate } from "react-admin";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { http } from "../../http";
import { buildHttpUrl } from "../../httpDataProvider";

interface OrderSummary {
    pending?: number;
    inProgress?: number;
    delivery?: number;
    completed: number;
    canceled: number;
    sellRevenue?: number;
    purchaseCost?: number;
}

interface ProductSummary {
    total: number;
    lowStock: Array<{ id: number; name: string; quantity: number }>;
}

interface RecentOrder {
    id: number;
    type: string;
    status: string;
    total: number;
    submitted: string | null;
    businessName: string | null;
}

interface TopProduct {
    productId: number;
    name: string;
    totalSold: number;
}

interface DashboardData {
    orders?: OrderSummary;
    products?: ProductSummary;
    recentOrders?: RecentOrder[];
    topProducts?: TopProduct[];
}

const STATUS_COLORS: Record<string, "warning" | "info" | "success" | "error" | "default"> = {
    Pending: "warning",
    InProgress: "info",
    Complete: "success",
    Canceled: "error",
    Refunded: "error",
    Paused: "default",
    Temporary: "default",
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const StatCard = ({ label, value, color = "text.primary" }: { label: string; value: React.ReactNode; color?: string }) => (
    <Card elevation={2} sx={{ height: "100%" }}>
        <CardContent>
            <Typography variant="subtitle2" sx={{ color: "#64748b" }} gutterBottom>
                {label}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={color}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

export const Dashboard = () => {
    const translate = useTranslate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http(buildHttpUrl("dashboard"))
            .then(res => setData(res.json))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Box p={3}>
                <Typography color="error">Failed to load dashboard data.</Typography>
            </Box>
        );
    }

    const { orders, products, recentOrders, topProducts } = data;

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                {translate("resources.dashboard.name", { smart_count: 1 })}
            </Typography>

            {/* Order stats */}
            {orders && (
                <Grid container spacing={2} mb={3}>
                    {orders.pending != null && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                label={translate("resources.dashboard.pendingOrders", { smart_count: 1 })}
                                value={orders.pending}
                                color="warning.main"
                            />
                        </Grid>
                    )}
                    {orders.inProgress != null && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                label={translate("resources.dashboard.inProgressOrders", { smart_count: 1 })}
                                value={orders.inProgress}
                                color="info.main"
                            />
                        </Grid>
                    )}
                    {orders.delivery != null && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                label={translate("resources.dashboard.deliveryOrders", { smart_count: 1 })}
                                value={orders.delivery}
                                color="info.main"
                            />
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            label={translate("resources.dashboard.completedOrders", { smart_count: 1 })}
                            value={orders.completed}
                            color="success.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            label={translate("resources.dashboard.canceledOrders", { smart_count: 1 })}
                            value={orders.canceled}
                            color="error.main"
                        />
                    </Grid>
                    {orders.sellRevenue != null && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                label={translate("resources.dashboard.sellRevenue", { smart_count: 1 })}
                                value={formatCurrency(orders.sellRevenue)}
                                color="success.main"
                            />
                        </Grid>
                    )}
                    {orders.purchaseCost != null && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                label={translate("resources.dashboard.purchaseCost", { smart_count: 1 })}
                                value={formatCurrency(orders.purchaseCost)}
                                color="text.primary"
                            />
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Products stats */}
            {products && (
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            label={translate("resources.dashboard.totalProducts", { smart_count: 1 })}
                            value={products.total}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            label={translate("resources.dashboard.lowStockProducts", { smart_count: 1 })}
                            value={products.lowStock.length}
                            color={products.lowStock.length > 0 ? "warning.main" : "text.primary"}
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tables Row */}
            {(recentOrders || (products && products.lowStock) || topProducts) && (
                <Grid container spacing={3}>
                    {recentOrders && (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                        {translate("resources.dashboard.recentOrders", { smart_count: 1 })}
                                    </Typography>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#ID</TableCell>
                                                <TableCell>{translate("resources.misc.type", { smart_count: 1 })}</TableCell>
                                                <TableCell>{translate("resources.misc.business", { smart_count: 1 })}</TableCell>
                                                <TableCell align="right">{translate("resources.misc.price", { smart_count: 1 })}</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentOrders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        <Typography variant="body2" sx={{ color: "#64748b" }}>No orders yet</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                recentOrders.map(order => (
                                                    <TableRow key={order.id} hover>
                                                        <TableCell>{order.id}</TableCell>
                                                        <TableCell>{order.type}</TableCell>
                                                        <TableCell>{order.businessName ?? "—"}</TableCell>
                                                        <TableCell align="right">{formatCurrency(Number(order.total))}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={order.status}
                                                                color={STATUS_COLORS[order.status] ?? "default"}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {(topProducts || products) && (
                        <Grid item xs={12} md={recentOrders ? 6 : 12}>
                            {topProducts && (
                                <Card elevation={2} sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                            {translate("resources.dashboard.topProducts", { smart_count: 1 })}
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{translate("resources.misc.name", { smart_count: 1 })}</TableCell>
                                                    <TableCell align="right">{translate("resources.misc.quantity", { smart_count: 1 })}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {topProducts.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">
                                                            <Typography variant="body2" sx={{ color: "#64748b" }}>No sales yet</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    topProducts.map(p => (
                                                        <TableRow key={p.productId} hover>
                                                            <TableCell>{p.name}</TableCell>
                                                            <TableCell align="right">{Number(p.totalSold)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}

                            {products && (
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                            {translate("resources.dashboard.lowStock", { smart_count: 1 })}
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{translate("resources.misc.name", { smart_count: 1 })}</TableCell>
                                                    <TableCell align="right">{translate("resources.misc.quantity", { smart_count: 1 })}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {products.lowStock.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">
                                                            <Typography variant="body2" sx={{ color: "#64748b" }}>All products well stocked</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    products.lowStock.map(p => (
                                                        <TableRow key={p.id} hover>
                                                            <TableCell>{p.name}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography
                                                                    variant="body2"
                                                                    color={Number(p.quantity) <= 0 ? "error.main" : "warning.main"}
                                                                    fontWeight="bold"
                                                                >
                                                                    {Number(p.quantity)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
};
