import { useState } from "react";
import ProductManager from "./components/ProductManager";
import CreateOrderForm from "./components/CreateOrderForm";
import OrderList from "./components/OrderList";
import EditOrderModal from "./components/EditOrderModal";
import type { Order } from "./types";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";
import TableManager from "./components/TableManager";
import CalendarView from "./components/CalendarView";

const navigation = [
  { name: "Orders", href: "orders" },
  { name: "Products", href: "products" },
  { name: "Tables", href: "tables" },
  { name: "Calendar", href: "calendar" },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "tables" | "calendar"
  >("orders");
  const [refreshOrders, setRefreshOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

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
    <div className="min-h-dvh text-gray-900 bg-gray-100">
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          <div className="mx-auto max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setActiveTab(item.href)}
                        className={classNames(
                          activeTab === item.href
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu */}
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon
                    aria-hidden="true"
                    className="block size-6 group-data-open:hidden"
                  />
                  <XMarkIcon
                    aria-hidden="true"
                    className="hidden size-6 group-data-open:block"
                  />
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  onClick={() => setActiveTab(item.href)}
                  className={classNames(
                    activeTab === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>

        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Restaurant System
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto p-6">
              {activeTab === "products" ? (
                <ProductManager />
              ) : activeTab === "tables" ? (
                <TableManager />
              ) : activeTab === "calendar" ? (
                <CalendarView />
              ) : (
                <>
                  <CreateOrderForm onOrderCreated={reloadOrders} />
                  <OrderList
                    key={refreshOrders.toString()}
                    onEditOrder={handleEditOrder}
                  />
                </>
              )}

              {editingOrder && (
                <EditOrderModal
                  order={editingOrder}
                  onClose={handleCloseModal}
                  onOrderUpdated={handleOrderUpdated}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
