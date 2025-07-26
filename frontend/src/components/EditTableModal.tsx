import { useEffect, useState } from "react";
import axios from "axios";
import type { Table } from "../types";
import toast from "react-hot-toast";

interface EditTableModalProps {
  table: Table | null;
  onClose: () => void;
  onTableUpdated: () => void;
}

export default function EditTableModal({
  table,
  onClose,
  onTableUpdated,
}: EditTableModalProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (table) {
      setName(table.name);
      setCapacity(table.capacity.toString());
      setSingleTab(table.single_tab);
      setError("");
    }
  }, [table]);

  if (!table) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.put(`http://localhost:8080/tables/${table.id}`, {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });

      toast.success("Table updated successfully!");
      onTableUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error updating table.");
      toast.error(err.response?.data?.error || "Error updating table.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Table: {table.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="tableName"
              className="block text-sm font-medium text-gray-700"
            >
              Name:
            </label>
            <input
              id="tableName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Table Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="tableCapacity"
              className="block text-sm font-medium text-gray-700"
            >
              Capacity:
            </label>
            <input
              id="tableCapacity"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              min={1}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="editSingleTab"
              type="checkbox"
              checked={singleTab}
              onChange={(e) => setSingleTab(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="editSingleTab"
              className="text-sm font-medium text-gray-700"
            >
              Single Tab
            </label>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
