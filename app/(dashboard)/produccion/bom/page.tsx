"use client";

import { Layers } from "lucide-react";
import { useBOMs } from "@/hooks/useProduccion";

export default function BOMPage() {
  const { data, isLoading } = useBOMs();
  const boms = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers size={24} /> Lista de Materiales (BOM)
        </h1>
        <p className="text-slate-500">{boms.length} BOMs registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto Terminado</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Costo Estimado</th>
                <th>Materiales</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : boms.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron BOMs.</td></tr>
              ) : (
                boms.map((b) => (
                  <tr key={b.id} className="table-row-hover">
                    <td className="font-mono text-xs">{b.code}</td>
                    <td className="font-medium">{b.producto?.name ?? "—"}</td>
                    <td className="text-right">{b.cantidad}</td>
                    <td>{b.unidad}</td>
                    <td className="text-right">${b.costoEstimado?.toLocaleString() ?? "—"}</td>
                    <td className="text-center">{b.materiales?.length ?? 0}</td>
                    <td>
                      <span className={`badge ${b.activo ? "badge-success" : "badge-secondary"}`}>
                        {b.activo ? "Sí" : "No"}
                      </span>
                    </td>
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
