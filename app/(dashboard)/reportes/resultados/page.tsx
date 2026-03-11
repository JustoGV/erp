"use client";

import { useState } from "react";
import { useReporteResultados } from "@/hooks/useReportes";

export default function ReporteResultadosPage() {
  const hoy = new Date();
  const [filtros, setFiltros] = useState({
    desde: `${hoy.getFullYear()}-01-01`,
    hasta: `${hoy.getFullYear()}-12-31`,
  });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteResultados(aplicados);
  const r = data?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estado de Resultados</h1>

      <div className="card flex gap-4 items-end flex-wrap">
        <div>
          <label htmlFor="resultados-desde" className="label">
            Desde
          </label>
          <input
            id="resultados-desde"
            type="date"
            className="input"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, desde: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="resultados-hasta" className="label">
            Hasta
          </label>
          <input
            id="resultados-hasta"
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
          Consultar
        </button>
      </div>

      {isLoading ? (
        <div>Calculando...</div>
      ) : r ? (
        <div className="card max-w-md space-y-4">
          <h3 className="font-semibold text-gray-700">
            Período: {r.periodo.desde} → {r.periodo.hasta}
          </h3>
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Ingresos</span>
            <span className="text-green-700 font-semibold">
              {fmt(r.ingresos)}
            </span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Egresos</span>
            <span className="text-red-600 font-semibold">{fmt(r.egresos)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-bold text-gray-900">Resultado Neto</span>
            <span
              className={`text-xl font-bold ${
                r.esGanancia ? "text-green-700" : "text-red-600"
              }`}
            >
              {r.esGanancia ? "+" : "-"}
              {fmt(Math.abs(r.resultado))}
            </span>
          </div>
          <p className="text-sm text-center mt-2">
            <span
              className={`px-3 py-1 rounded-full font-medium text-sm ${
                r.esGanancia
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {r.esGanancia ? "Ganancia" : "Pérdida"}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
