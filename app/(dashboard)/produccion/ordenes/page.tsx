"use client";

import { useState } from "react";
import { Factory, Plus } from "lucide-react";
import Link from "next/link";
import { useOrdenesProduccion } from "@/hooks/useProduccion";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PLANIFICADA: { class: "badge-secondary", label: "Planificada" },
  EN_PROCESO: { class: "badge-info", label: "En proceso" },
  COMPLETADA: { class: "badge-success", label: "Completada" },
  CANCELADA: { class: "badge-danger", label: "Cancelada" },
};

export default function OrdenesProduccionPage() {
  const { data, isLoading } = useOrdenesProduccion();
  const ordenes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Factory size={24} /> Órdenes de Producción
          </h1>
          <p className="text-slate-500">{ordenes.length} órdenes</p>
        </div>
        <Link href="/produccion/ordenes/nueva" className="btn btn-primary">
          <Plus size={18} /> Nueva Orden
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Producto</th>
                <th>Cant. Plan.</th>
                <th>Cant. Real.</th>
                <th>Operador</th>
                <th>F. Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : ordenes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron órdenes.</td></tr>
              ) : (
                ordenes.map((o) => {
                  const est = ESTADO_CONFIG[o.estado] ?? { class: "badge-secondary", label: o.estado };
                  return (
                    <tr key={o.id} className="table-row-hover">
                      <td className="font-mono text-xs">{o.numero}</td>
                      <td className="font-medium">{o.bom?.producto?.name ?? "—"}</td>
                      <td className="text-right">{o.cantidadPlanificada}</td>
                      <td className="text-right">{o.cantidadRealizada ?? 0}</td>
                      <td>{o.operador ?? "—"}</td>
                      <td>{o.fechaInicio ? new Date(o.fechaInicio).toLocaleDateString() : "—"}</td>
                      <td><span className={`badge ${est.class}`}>{est.label}</span></td>
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
