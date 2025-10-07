import { useState, useEffect } from "react";
import axios from "axios";
import type { Order, Product, Table } from "../types";
import toast from "react-hot-toast";
import { formatDate } from "../utils/date";
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react";

interface ReportData {
  todayRevenue: number;
  revenueChange: number;
  activeOrders: number;
  preparingOrders: number;
  occupiedTables: number;
  totalTables: number;
  lowStockItems: number;
  recentOrders: Order[];
  topSellingProducts: { name: string; count: number }[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subValue }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
    </div>
    <div className="h-6 w-6">{icon}</div>
  </div>
);

export default function Dashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDataAndGenerateReport = async () => {
    try {
      const [ordersRes, productsRes, tablesRes] = await Promise.all([
        axios.get("http://localhost:8080/orders"),
        axios.get("http://localhost:8080/products"),
        axios.get("http://localhost:8080/tables"),
      ]);

      const orders: Order[] = ordersRes.data || [];
      const products: Product[] = productsRes.data || [];
      const tables: Table[] = tablesRes.data || [];

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      const todayOrders = orders.filter(
        (o) => new Date(o.date).toDateString() === todayStr,
      );
      const yesterdayOrders = orders.filter(
        (o) => new Date(o.date).toDateString() === yesterdayStr,
      );

      const calculateRevenue = (orderList: Order[]) =>
        orderList.reduce(
          (total, order) =>
            total +
            order.items.reduce(
              (itemTotal, item) =>
                itemTotal + (item.product?.price || 0) * item.quantity,
              0,
            ),
          0,
        );

      const todayRevenue = calculateRevenue(todayOrders);
      const yesterdayRevenue = calculateRevenue(yesterdayOrders);

      const revenueChange =
        yesterdayRevenue === 0
          ? todayRevenue > 0
            ? 100
            : 0
          : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

      const activeOrders = orders.filter((o) => o.status === "open");
      const preparingOrders = activeOrders.filter(
        (o) => o.kitchen_status === "Preparing",
      ).length;

      const occupiedTableIds = new Set(activeOrders.map((o) => o.table_id));
      const occupiedTables = occupiedTableIds.size;
      const totalTables = tables.length;

      const lowStockItems = products.filter((p) => p.stock < 5).length; // Low stock = < 5

      const recentOrders = [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5);

      const productCount: { [key: string]: number } = {};
      todayOrders.forEach((order) => {
        order.items.forEach((item) => {
          const name = item.product?.name || "Unknown";
          productCount[name] = (productCount[name] || 0) + item.quantity;
        });
      });
      const topSellingProducts = Object.entries(productCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setReport({
        todayRevenue,
        revenueChange,
        activeOrders: activeOrders.length,
        preparingOrders,
        occupiedTables,
        totalTables,
        lowStockItems,
        recentOrders,
        topSellingProducts,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndGenerateReport();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-10 text-gray-500">Loading dashboard...</div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-10 text-red-500">
        Could not load dashboard data.
      </div>
    );
  }

  const occupancy =
    report.totalTables > 0
      ? (report.occupiedTables / report.totalTables) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">General overview of your restaurant</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={`$${report.todayRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-lime-400" />}
          subValue={`${report.revenueChange >= 0 ? "↑" : "↓"} ${report.revenueChange.toFixed(1)}% since yesterday`}
        />

        <StatCard
          title="Active Orders"
          value={report.activeOrders.toString()}
          icon={<ShoppingCart className="h-6 w-6 text-red-500" />}
          subValue={`${report.preparingOrders} in preparation`}
        />

        <StatCard
          title="Occupied Tables"
          value={`${report.occupiedTables}/${report.totalTables}`}
          icon={<Users className="h-6 w-6 text-yellow-400" />}
          subValue={`${occupancy.toFixed(0)}% occupancy`}
        />

        <StatCard
          title="Low Stock"
          value={report.lowStockItems.toString()}
          icon={<Package className="h-6 w-6 text-red-500" />}
          subValue={`products below minimum`}
        />
      </div>

      {/* Orders and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">
            Recent Orders
          </h3>
          {report.recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {report.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>Table {order.table?.name || `#${order.table_id}`}</span>
                  <span className="text-gray-500">
                    {formatDate(order.date)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center mt-4">
              No recent orders found
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">
            Top Selling Products
          </h3>
          {report.topSellingProducts.length > 0 ? (
            <ul className="space-y-3">
              {report.topSellingProducts.map(({ name, count }) => (
                <li
                  key={name}
                  className="flex justify-between items-center text-sm"
                >
                  <span>{name}</span>
                  <span className="font-semibold text-gray-500">
                    {count} sold
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center mt-4">
              No sales registered today
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
