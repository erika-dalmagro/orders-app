import { useEffect, useState } from "react";
import axios from "axios";
import type { Table } from "../types";
import toast from "react-hot-toast";
import EditTableModal from "./EditTableModal";
import { useTranslation } from "react-i18next";

export default function TableManager() {
  const { t } = useTranslation();
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
      toast.success(t("tableCreatedSuccess"));

      setName("");
      setCapacity("");
      setSingleTab(true);
      loadTables();
    } catch (error) {
      toast.error(t("errorCreatingTable"));
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
    if (window.confirm(t("confirmDeleteTable"))) {
      try {
        await axios.delete(`http://localhost:8080/tables/${id}`);
        toast.success(t("tableDeletedSuccess"));
        loadTables();
      } catch (error: any) {
        toast.error(
          t(error.response?.data?.error === "Cannot delete table with open orders" ? "errorDeleteTableWithOpenOrders" : "errorDeletingTable")
        );
        console.error(error);
      }
    }
  };

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-4">{t('tableManager')}</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-center">
        <input
          className="border p-2"
          placeholder={t('tableNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder={t('capacity')}
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
            {t('singleTab')}
          </label>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          {t('add')} {t('tables')}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                {t('name')}
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                {t('capacity')}
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                {t('tab')}
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id} className="border-b">
                <td className="py-2 px-4 text-gray-900">{table.name}</td>
                <td className="py-2 px-4 text-gray-900">{table.capacity}</td>
                <td className="py-2 px-4 text-gray-900">
                  {table.single_tab ? t('singleTab') : t('multiple')}
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(table)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      {t('delete')}
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
