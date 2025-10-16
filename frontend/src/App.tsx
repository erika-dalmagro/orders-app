import { useState } from "react";
import ProductManager from "./components/ProductManager";
import CreateOrderForm from "./components/CreateOrderForm";
import OrderList from "./components/OrderList";
import EditOrderModal from "./components/EditOrderModal";
import KitchenView from "./components/KitchenView";
import Dashboard from "./components/Dashboard";
import type { Order } from "./types";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ViewColumnsIcon,
  CalendarIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";
import TableManager from "./components/TableManager";
import CalendarView from "./components/CalendarView";

const navigation = [
  { name: "Dashboard", href: "dashboard", icon: HomeIcon },
  { name: "Orders", href: "orders", icon: ShoppingBagIcon },
  { name: "Products", href: "products", icon: CubeIcon },
  { name: "Tables", href: "tables", icon: ViewColumnsIcon },
  { name: "Calendar", href: "calendar", icon: CalendarIcon },
  { name: "Kitchen", href: "kitchen", icon: FireIcon },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "orders" | "tables" | "calendar" | "kitchen"
  >("dashboard");
  const [refreshOrders, setRefreshOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const reloadOrders = () => setRefreshOrders(!refreshOrders);

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleCloseModal = () => {
    setEditingOrder(null);
  };

  const handleOrderUpdated = () => {
    reloadOrders();
    handleCloseModal();
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              Restaurant System
            </h2>
            <button
              type="button"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.href;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.href);
                    setIsSidebarOpen(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">
              {navigation.find((item) => item.href === activeTab)?.name || "Dashboard"}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-6">
            {activeTab === "dashboard" ? (
              <Dashboard />
            ) : activeTab === "products" ? (
              <ProductManager />
            ) : activeTab === "tables" ? (
              <TableManager />
            ) : activeTab === "calendar" ? (
              <CalendarView onEditOrder={handleEditOrder} />
            ) : activeTab === "kitchen" ? (
              <KitchenView />
            ) : (
              <>
                <CreateOrderForm onOrderCreated={reloadOrders} />
                <OrderList
                  key={refreshOrders.toString()}
                  onEditOrder={handleEditOrder}
                />
              </>
            )}
        </main>
      </div>

      <Toaster />
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={handleCloseModal}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}
