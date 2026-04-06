"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAlertasStock } from "@/hooks/useInventario";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function AlertasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const { data: alertas, isLoading } = useAlertasStock(localId);
  const allItems = alertas ?? [];

  const items = useMemo(() => {
    if (!searchValue.trim()) return allItems;
    const q = searchValue.toLowerCase();
    const n = parseFloat(searchValue);
    switch (searchKey) {
      case "local":       return allItems.filter((a) => (a.localNombre ?? "").toLowerCase().includes(q));
      case "stockActual": return isNaN(n) ? allItems : allItems.filter((a) => (a.stockActual ?? 0) <= n);
      case "minStock":    return isNaN(n) ? allItems : allItems.filter((a) => (a.stockMinimo ?? 0) <= n);
      case "diferencia":  return isNaN(n) ? allItems : allItems.filter((a) => (a.diferencia ?? 0) >= n);
      default:            return allItems.filter((a) =>
        (a.productoNombre ?? "").toLowerCase().includes(q) ||
        (a.productoCodigo ?? "").toLowerCase().includes(q),
      );
    }
  }, [allItems, searchKey, searchValue]);

  const handleSearch = (key: string, value: string) => {
    setSearchKey(key);
    setSearchValue(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={24} /> Alertas de Stock
        </h1>
        <p className="text-slate-500">{allItems.length} productos bajo stock mínimo</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "producto",    label: "Producto",    type: "text" },
              { key: "local",       label: "Local",       type: "text" },
              { key: "stockActual", label: "Stock Actual", type: "number" },
              { key: "minStock",    label: "Stock Mínimo", type: "number" },
              { key: "diferencia",  label: "Diferencia",  type: "number" },
            ]}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Criticidad</th>
                <th>Producto</th>
                <th>Local</th>
                <th className="text-right">Stock Actual</th>
                <th className="text-right">Stock Mínimo</th>
                <th className="text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay alertas de stock.</td></tr>
              ) : (
              items.map((a, i) => {
                const esCritico = a.criticidad === "CRITICO";
                return (
                  <tr key={a.productoId ?? i} className="table-row-hover">
                    <td>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${esCritico ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                        {a.criticidad}
                      </span>
                    </td>
                    <td>
                      <p className="font-medium">{a.productoNombre ?? "—"}</p>
                      <p className="text-xs text-slate-500">{a.productoCodigo}</p>
                    </td>
                    <td>{a.localNombre ?? "—"}</td>
                    <td className="text-right font-semibold text-red-600">{a.stockActual} {a.unidad}</td>
                    <td className="text-right">{a.stockMinimo} {a.unidad}</td>
                    <td className="text-right font-semibold text-red-600">-{a.diferencia}</td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
