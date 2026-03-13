"use client";

import { AlertTriangle } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAlertasStock } from "@/hooks/useInventario";

export default function AlertasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: alertas, isLoading } = useAlertasStock(localId);
  const items = alertas ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={24} /> Alertas de Stock
        </h1>
        <p className="text-slate-500">{items.length} productos bajo stock mínimo</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Local</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No hay alertas de stock.</td></tr>
              ) : (
                items.map((a, i) => (
                  <tr key={i} className="table-row-hover">
                    <td>
                      <div>
                        <p className="font-medium">{a.productoNombre}</p>
                        <p className="text-xs text-slate-500">{a.productoCodigo}</p>
                      </div>
                    </td>
                    <td>{a.localNombre}</td>
                    <td className="text-right font-semibold text-red-600">{a.stockActual}</td>
                    <td className="text-right">{a.stockMinimo}</td>
                    <td className="text-right font-semibold text-red-600">-{a.diferencia}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
