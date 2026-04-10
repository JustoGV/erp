"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { useReporteRRHH } from "@/hooks/useReportes";
import { downloadReporteXLSX } from "@/lib/services/reportes.service";

export default function ReporteRRHHPage() {
  const hoy = new Date();
  const periodoDefault = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const [filtros, setFiltros] = useState({
    desde: `${periodoDefault}-01`,
    hasta: "",
  });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteRRHH(aplicados);
  const r = data?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  const handleDescargar = () =>
    downloadReporteXLSX("rrhh", aplicados, `nomina-${aplicados.desde}.xlsx`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporte de Recursos Humanos</h1>
        <div className="no-print flex items-center gap-2">
          <button onClick={handleDescargar} className="btn btn-secondary">
            Exportar Excel
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="print-title hidden border-b pb-3 mb-2">
        <p className="text-xs text-gray-500">Período: {aplicados.desde} — {aplicados.hasta || "hoy"}</p>
      </div>

      {/* Filtros */}
      <div className="no-print card flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="rrhh-desde" className="label">
            Desde
          </label>
          <input
            id="rrhh-desde"
            type="date"
            className="input"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, desde: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="rrhh-hasta" className="label">
            Hasta
          </label>
          <input
            id="rrhh-hasta"
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

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Bruto</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fmt(r?.resumen.totalBruto)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Deducciones</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {fmt(r?.resumen.totalDescuentos)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Neto</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {fmt(r?.resumen.totalNeto)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Liquidaciones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {r?.resumen.cantidad ?? "—"}
              </p>
            </div>
          </div>

          {/* Tabla */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold mb-4">
              Liquidaciones ({r?.liquidaciones.length ?? 0})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2 pr-4">Legajo</th>
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Cargo</th>
                  <th className="pb-2 pr-4">Período</th>
                  <th className="pb-2 pr-4 text-right">Bruto</th>
                  <th className="pb-2 pr-4 text-right">Deducciones</th>
                  <th className="pb-2 pr-4 text-right">Neto</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {r?.liquidaciones.map((l, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{l.legajo}</td>
                    <td className="py-2 pr-4">{l.nombre}</td>
                    <td className="py-2 pr-4 text-gray-500">{l.cargo}</td>
                    <td className="py-2 pr-4">{l.periodo}</td>
                    <td className="py-2 pr-4 text-right">
                      {fmt(l.totalBruto)}
                    </td>
                    <td className="py-2 pr-4 text-right text-red-600">
                      {fmt(l.totalDescuentos)}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-green-700">
                      {fmt(l.totalNeto)}
                    </td>
                    <td className="py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          l.estado === "APROBADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {l.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {!r?.liquidaciones.length && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-400">
                      Sin liquidaciones para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
