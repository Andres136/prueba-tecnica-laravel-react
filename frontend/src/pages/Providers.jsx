// src/pages/Providers.jsx
import { useEffect, useState } from "react";
import {
  listProviders,
  deleteProvider,
  getToken,
  removeToken,
} from "../lib/api";

export default function Providers({ onLogout }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    async function load() {
      try {
        const data = await listProviders(token);
        // Ajusta según respuesta del backend (data, data.data, etc.)
        setProviders(data?.data || data || []);
      } catch (err) {
        console.error("Error cargando proveedores:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function handleLogout() {
    removeToken();
    if (onLogout) onLogout();
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar proveedor?")) return;
    try {
      await deleteProvider(id, token);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      alert("No se pudo eliminar el proveedor");
    }
  }

  if (loading) return <p>Cargando proveedores...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>

      {providers.length === 0 ? (
        <p>No hay proveedores.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Nombre</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id}>
                <td className="border px-3 py-2">{p.id}</td>
                <td className="border px-3 py-2">{p.name}</td>
                <td className="border px-3 py-2">{p.email}</td>
                <td className="border px-3 py-2">
                  {/* Aquí iría Editar si lo necesitas */}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
