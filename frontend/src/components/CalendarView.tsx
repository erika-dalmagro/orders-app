import { useState, useEffect } from "react";
import axios from "axios";
import type { Order } from "../types";
import toast from "react-hot-toast";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orders, setOrders] = useState<Order[]>([]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchOrdersForDate = async (date: Date) => {
    const formattedDate = formatDate(date);
    try {
      const res = await axios.get(
        `http://localhost:8080/orders/by-date?date=${formattedDate}`
      );
      setOrders(res.data);
      toast.success(`Orders loaded for ${formattedDate}`);
    } catch (err) {
      console.error("Failed to fetch orders for date:", err);
      setOrders([]);
      toast.error(`Failed to load orders for ${formattedDate}`);
    }
  };

  useEffect(() => {
    fetchOrdersForDate(selectedDate);
  }, [selectedDate]); // Refetch orders when selectedDate changes

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc
  };

  const renderCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const numDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 text-center text-gray-500"></div>
      );
    }

    // Fill days of the month
    for (let day = 1; day <= numDays; day++) {
      const currentDayDate = new Date(year, month, day);
      const isSelected =
        currentDayDate.toDateString() === selectedDate.toDateString();
      const today = new Date();
      const isToday = currentDayDate.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 text-center border cursor-pointer hover:bg-gray-200 text-gray-900 ${
            isSelected ? "bg-blue-300 font-bold" : ""
          } ${isToday ? "border-blue-500 font-semibold" : ""}`}
          onClick={() => setSelectedDate(currentDayDate)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setSelectedDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setSelectedDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-4">Orders Calendar View</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
        >
          Previous
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-gray-900">
        {dayNames.map((day) => (
          <div
            key={day}
            className="font-semibold text-center py-2 border-b-2 border-gray-300"
          >
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900">
        Orders for {formatDate(selectedDate)}:
      </h3>
      {orders.length === 0 ? (
        <p className="text-gray-700">No orders for this date.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border p-4 rounded-md shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-gray-900">
                  Table {order.table?.name || `#${order.table_id}`}
                </h4>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    order.status === "open"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Order ID: {order.id} | Date:{" "}
                {new Date(order.date).toLocaleDateString()}{" "}
                {new Date(order.date).toLocaleTimeString()}
              </p>
              <ul className="list-disc list-inside text-gray-700">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.product?.name} x {item.quantity} — $
                    {item.product
                      ? (item.product.price * item.quantity).toFixed(2)
                      : "N/A"}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
