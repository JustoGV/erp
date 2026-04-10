"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { useReporteVentas } from "@/hooks/useReportes";
import { downloadReporteXLSX } from "@/lib/services/reportes.service";

export default function ReporteVentasPage() {
  const hoy = new Date();
  const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
  const [filtros, setFiltros] = useState({ desde: primerDia, hasta: "" });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteVentas(aplicados);
  const r = data?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  const handleDescargar = () =>
    downloadReporteXLSX("ventas", aplicados, `ventas-${aplicados.desde}.xlsx`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporte de Ventas</h1>
        <div className="no-print flex items-center gap-2">
          <button onClick={handleDescargar} className="btn btn-secondary">
            Exportar Excel
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="no-print card flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="ventas-desde" className="label">
            Desde
          </label>
          <input
            id="ventas-desde"
            type="date"
            className="input"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, desde: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="ventas-hasta" className="label">
            Hasta
          </label>
          <input
            id="ventas-hasta"
            type="date"
            className="input"
            value={filtros.hasta}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, hasta: e.target.value }))
            }
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setAplicados(filtros)}
        >
          Aplicar filtros
        </button>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="print-title hidden border-b pb-3 mb-2">
        <p className="text-xs text-gray-500">Período: {aplicados.desde} — {aplicados.hasta || "hoy"}</p>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Facturado</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {fmt(r?.resumen.totalFacturado)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Cantidad de Facturas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {r?.resumen.cantidadFacturas ?? "—"}
              </p>
            </div>
          </div>

          {/* Tabla de facturas */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold mb-4">
              Facturas ({r?.facturas.length ?? 0})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2 pr-4">Número</th>
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Cliente</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {r?.facturas.map((f) => (
                  <tr key={f.numero} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{f.numero}</td>
                    <td className="py-2 pr-4">{f.fecha?.slice(0, 10)}</td>
                    <td className="py-2 pr-4">{f.cliente}</td>
                    <td className="py-2 pr-4 text-right font-semibold">
                      {fmt(f.total)}
                    </td>
                    <td className="py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                        {f.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {!r?.facturas.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Sin resultados para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Por cliente */}
          {r?.porCliente && r.porCliente.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Ventas por cliente</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-gray-500">
                    <th className="pb-2 pr-4">Cliente</th>
                    <th className="pb-2 pr-4 text-right">Total</th>
                    <th className="pb-2 text-right">Facturas</th>
                  </tr>
                </thead>
                <tbody>
                  {r.porCliente.map((c) => (
                    <tr key={c.nombre} className="border-b last:border-0">
                      <td className="py-2 pr-4">{c.nombre}</td>
                      <td className="py-2 pr-4 text-right font-semibold">
                        {fmt(c.total)}
                      </td>
                      <td className="py-2 text-right">{c.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
