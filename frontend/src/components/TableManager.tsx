import { useEffect, useState } from "react";
import axios from "axios";
import type { Table } from "../types";
import toast from "react-hot-toast";
import EditTableModal from "./EditTableModal";

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);
  const [editingTableInModal, setEditingTableInModal] = useState<Table | null>(
    null,
  );

  const loadTables = () => {
    axios
      .get("http://localhost:8080/tables")
      .then((res) => setTables(res.data))
      .catch(() => toast.error("Failed to load tables."));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/tables", {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });
      toast.success("Table created successfully!");

      setName("");
      setCapacity("");
      setSingleTab(true);
      loadTables();
    } catch (error) {
      toast.error("An error occurred creating table. Check the console.");
      console.error(error);
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTableInModal(table);
  };

  const handleCloseModal = () => {
    setEditingTableInModal(null);
  };

  const handleTableUpdated = () => {
    loadTables();
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        await axios.delete(`http://localhost:8080/tables/${id}`);
        toast.success("Table deleted successfully!");
        loadTables();
      } catch (error: any) {
        toast.error(
          error.response?.data?.error ||
            "Error deleting table. Check console for details.",
        );
        console.error(error);
      }
    }
  };

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-4">Table Manager</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-center">
        <input
          className="border p-2"
          placeholder="Table Name (e.g., Table 1, Bar)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder="Capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
          min={1}
        />
        <div className="flex items-center gap-2">
          <input
            id="singleTab"
            type="checkbox"
            checked={singleTab}
            onChange={(e) => setSingleTab(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="singleTab"
            className="text-sm font-medium text-gray-700 mr-4"
          >
            Single Tab
          </label>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add Table
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                Name
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                Capacity
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                Tab
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 px-4 text-gray-900">{t.name}</td>
                <td className="py-2 px-4 text-gray-900">{t.capacity}</td>
                <td className="py-2 px-4 text-gray-900">
                  {t.single_tab ? "Single" : "Multiple"}
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(t)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTableInModal && (
        <EditTableModal
          table={editingTableInModal}
          onClose={handleCloseModal}
          onTableUpdated={handleTableUpdated}
        />
      )}
    </div>
  );
}
