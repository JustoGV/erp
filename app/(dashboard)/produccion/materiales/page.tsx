"use client";

import { Boxes } from "lucide-react";
import { useMaterialesProduccion } from "@/hooks/useProduccion";

export default function MaterialesPage() {
  const { data, isLoading } = useMaterialesProduccion();
  const materiales = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Boxes size={24} /> Materiales de Producción
        </h1>
        <p className="text-slate-500">{materiales.length} materiales registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Stock Mín.</th>
                <th>Stock Máx.</th>
                <th>Costo Unit.</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
              ) : materiales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No se encontraron materiales.</td></tr>
              ) : (
                materiales.map((m) => (
                  <tr key={m.id} className="table-row-hover">
                    <td className="font-mono text-xs">{m.code}</td>
                    <td className="font-medium">{m.nombre}</td>
                    <td>{m.tipo}</td>
                    <td>{m.unidad}</td>
                    <td className={`text-right font-semibold ${(m.stockActual ?? 0) <= (m.stockMinimo ?? 0) ? "text-red-600" : "text-slate-900"}`}>
                      {m.stockActual ?? 0}
                    </td>
                    <td className="text-right">{m.stockMinimo ?? 0}</td>
                    <td className="text-right">{m.stockMaximo ?? 0}</td>
                    <td className="text-right">${m.costoUnitario?.toLocaleString() ?? "—"}</td>
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
