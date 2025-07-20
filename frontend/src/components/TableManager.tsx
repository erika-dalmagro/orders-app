import { useEffect, useState } from "react";
import axios from "axios";
import type { Table } from "../types";
import toast from "react-hot-toast";
import EditTableModal from "./EditTableModal";

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [editingTableInModal, setEditingTableInModal] = useState<Table | null>(
    null
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
      });
      toast.success("Table created successfully!");

      setName("");
      setCapacity("");
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
            "Error deleting table. Check console for details."
        );
        console.error(error);
      }
    }
  };

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-4">Table Manager</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add Table
        </button>
      </form>

      <ul className="space-y-1">
        {tables.map((t) => (
          <li key={t.id} className="flex justify-between items-center">
            <strong>{t.name}</strong> — Capacity: {t.capacity}
            <div className="flex gap-1">
              <button
                onClick={() => handleEdit(t)}
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
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
          </li>
        ))}
      </ul>

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
