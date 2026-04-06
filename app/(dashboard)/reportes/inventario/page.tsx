"use client";

import { Printer } from "lucide-react";
import { useReporteInventario } from "@/hooks/useReportes";
import { downloadReporteXLSX } from "@/lib/services/reportes.service";

export default function ReporteInventarioPage() {
  const { data, isLoading } = useReporteInventario();
  const r = data?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporte de Inventario</h1>
        <div className="no-print flex items-center gap-2">
          <button
            onClick={() => downloadReporteXLSX("inventario")}
            className="btn btn-secondary"
          >
            Exportar Excel
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Imprimir PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Valorización Total</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">
                {fmt(r?.resumen.valorizacionTotal)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Productos con Alerta</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {r?.resumen.productosConAlerta ?? "—"}
              </p>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h3 className="font-semibold mb-4">
              Stock valorizado ({r?.items.length ?? 0} ítems)
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2 pr-4">SKU</th>
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Categoría</th>
                  <th className="pb-2 pr-4 text-right">Cantidad</th>
                  <th className="pb-2 pr-4 text-right">Costo</th>
                  <th className="pb-2 pr-4 text-right">Valorizado</th>
                  <th className="pb-2 text-center">Alerta</th>
                </tr>
              </thead>
              <tbody>
                {r?.items.map((item) => (
                  <tr
                    key={item.sku}
                    className={`border-b last:border-0 ${item.alertaStock ? "bg-red-50" : ""}`}
                  >
                    <td className="py-2 pr-4 font-mono text-xs">{item.sku}</td>
                    <td className="py-2 pr-4">{item.nombre}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {item.categoria}
                    </td>
                    <td className="py-2 pr-4 text-right">{item.cantidad}</td>
                    <td className="py-2 pr-4 text-right">{fmt(item.costo)}</td>
                    <td className="py-2 pr-4 text-right font-semibold">
                      {fmt(item.valorizado)}
                    </td>
                    <td className="py-2 text-center">
                      {item.alertaStock && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          ⚠ Stock bajo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!r?.items.length && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      Sin ítems de inventario
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
