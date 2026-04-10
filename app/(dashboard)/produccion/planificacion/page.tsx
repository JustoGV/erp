"use client";

import { useState } from "react";
import { CalendarDays, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
  useCalendarioProduccion,
  useVerificarMateriales,
} from "@/hooks/useProduccion";
import type { EstadoOrdenProduccion } from "@/lib/types/produccion";

const ESTADO_CONFIG: Record<EstadoOrdenProduccion, { class: string; label: string }> = {
  PLANIFICADA: { class: "badge-secondary", label: "Planificada" },
  EN_PROCESO:  { class: "badge-info",      label: "En Proceso" },
  COMPLETADA:  { class: "badge-success",   label: "Completada" },
  CANCELADA:   { class: "badge-danger",    label: "Cancelada" },
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthEndStr() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default function PlanificacionPage() {
  const [desde, setDesde] = useState(todayStr);
  const [hasta, setHasta] = useState(monthEndStr);

  const { data: calData, isLoading: calLoading } = useCalendarioProduccion(desde, hasta);
  const ordenes = calData?.data ?? [];
  const resumen = calData?.resumen;

  const { data: matData, isLoading: matLoading } = useVerificarMateriales();
  const materiales = matData?.data ?? [];
  const tieneFaltantes = matData?.tieneFaltantes ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays size={24} /> Planificación de Producción
        </h1>
        <p className="text-slate-500">Calendario de órdenes activas y verificación de materiales</p>
      </div>

      {/* Filtro de fechas */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-lg"><Clock size={22} className="text-slate-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{resumen.pendientes}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg"><Clock size={22} className="text-blue-500" /></div>
            <div>
              <p className="text-sm text-slate-500">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">{resumen.enProceso}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle2 size={22} className="text-green-500" /></div>
            <div>
              <p className="text-sm text-slate-500">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{resumen.completadas}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendario de órdenes */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Órdenes en el período</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th className="text-right">Cant. Plan.</th>
                <th>F. Inicio</th>
                <th>F. Fin Plan.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {calLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : ordenes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay órdenes en este período.</td></tr>
              ) : ordenes.map((o) => {
                const est = ESTADO_CONFIG[o.estado] ?? { class: "badge-secondary", label: o.estado };
                return (
                  <tr key={o.id} className="table-row-hover">
                    <td className="font-mono text-xs">{o.code}</td>
                    <td className="font-medium">{o.productoNombre ?? o.bom?.producto?.name ?? "—"}</td>
                    <td className="text-right">{o.cantidadPlanificada}</td>
                    <td>{o.fechaInicio?.slice(0, 10) ?? "—"}</td>
                    <td>{o.fechaFinPlanificada?.slice(0, 10) ?? "—"}</td>
                    <td><span className={`badge ${est.class}`}>{est.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verificación de materiales */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Materiales vs Demanda Planificada</h2>
            {tieneFaltantes && (
              <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                <AlertTriangle size={16} /> Hay materiales insuficientes
              </span>
            )}
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Código</th>
                <th className="text-right">Demanda Total</th>
                <th className="text-right">Stock Disponible</th>
                <th className="text-right">Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {matLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : materiales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay demanda planificada actualmente.</td></tr>
              ) : materiales.map((m, i) => (
                <tr key={i} className={`table-row-hover ${!m.suficiente ? "bg-red-50" : ""}`}>
                  <td className="font-medium">{m.material.nombre}</td>
                  <td className="font-mono text-xs">{m.material.code}</td>
                  <td className="text-right">{m.demandaTotal}</td>
                  <td className="text-right">{m.stockDisponible}</td>
                  <td className={`text-right font-semibold ${m.diferencia < 0 ? "text-red-600" : "text-green-600"}`}>
                    {m.diferencia > 0 ? "+" : ""}{m.diferencia}
                  </td>
                  <td>
                    <span className={`badge ${m.suficiente ? "badge-success" : "badge-danger"}`}>
                      {m.suficiente ? "OK" : "Faltante"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

