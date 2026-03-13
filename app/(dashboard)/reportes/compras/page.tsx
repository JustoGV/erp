"use client";

import { useState } from "react";
import { useReporteCompras } from "@/hooks/useReportes";

export default function ReporteComprasPage() {
  const hoy = new Date();
  const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
  const [filtros, setFiltros] = useState({ desde: primerDia, hasta: "" });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteCompras(aplicados);
  const r = data?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporte de Compras</h1>

      {/* Filtros */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="compras-desde" className="label">
            Desde
          </label>
          <input
            id="compras-desde"
            type="date"
            className="input"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, desde: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="compras-hasta" className="label">
            Hasta
          </label>
          <input
            id="compras-hasta"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Comprado</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">
                {fmt(r?.resumen.totalComprado)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Pagado</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {fmt(r?.resumen.totalPagado)}
              </p>
            </div>
          </div>

          {/* Tabla órdenes */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold mb-4">
              Órdenes de Compra ({r?.ordenes.length ?? 0})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2 pr-4">Número</th>
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Proveedor</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {r?.ordenes.map((o) => (
                  <tr key={o.numero} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{o.numero}</td>
                    <td className="py-2 pr-4">{o.fecha?.slice(0, 10)}</td>
                    <td className="py-2 pr-4">{o.proveedor}</td>
                    <td className="py-2 pr-4 text-right font-semibold">
                      {fmt(o.total)}
                    </td>
                    <td className="py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                        {o.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {!r?.ordenes.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Sin resultados para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Por proveedor */}
          {r?.porProveedor && r.porProveedor.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Compras por proveedor</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-gray-500">
                    <th className="pb-2 pr-4">Proveedor</th>
                    <th className="pb-2 pr-4 text-right">Total</th>
                    <th className="pb-2 text-right">Órdenes</th>
                  </tr>
                </thead>
                <tbody>
                  {r.porProveedor.map((p) => (
                    <tr key={p.nombre} className="border-b last:border-0">
                      <td className="py-2 pr-4">{p.nombre}</td>
                      <td className="py-2 pr-4 text-right font-semibold">
                        {fmt(p.total)}
                      </td>
                      <td className="py-2 text-right">{p.cantidad}</td>
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
