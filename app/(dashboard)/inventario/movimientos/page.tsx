"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useMovimientosStock } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";

const TIPO_LABEL: Record<string, { label: string; class: string }> = {
  ENTRADA: { label: "Entrada", class: "badge-success" },
  SALIDA: { label: "Salida", class: "badge-danger" },
  AJUSTE: { label: "Ajuste", class: "badge-warning" },
  AJUSTE_POSITIVO: { label: "Ajuste +", class: "badge-success" },
  AJUSTE_NEGATIVO: { label: "Ajuste -", class: "badge-danger" },
  TRANSFERENCIA: { label: "Transferencia", class: "badge-info" },
  PRODUCCION_ENTRADA: { label: "Prod. Entrada", class: "badge-success" },
  PRODUCCION_SALIDA: { label: "Prod. Salida", class: "badge-warning" },
};

const TIPOS = Object.keys(TIPO_LABEL);

export default function MovimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [fechaFilter, setFechaFilter] = useState("");
  const [cantidadFilter, setCantidadFilter] = useState<number | null>(null);

  const handleSearch = (key: string, value: string) => {
    if (key === "tipo") { setTipoFilter(value); }
    else if (key === "fecha") { setFechaFilter(value); }
    else if (key === "cantidad") { setCantidadFilter(value ? parseInt(value, 10) : null); }
    else { setSearch(value); }
    setPage(1);
  };

  const { data, isLoading } = useMovimientosStock({
    localId,
    page,
    limit: 20,
    search: search || undefined,
    tipo: tipoFilter || undefined,
  });
  const movimientos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const displayMovimientos = useMemo(() => {
    let result = movimientos;
    if (fechaFilter) {
      result = result.filter((m) => new Date(m.fecha ?? m.createdAt).toISOString().slice(0, 10) === fechaFilter);
    }
    if (cantidadFilter !== null) {
      result = result.filter((m) => m.cantidad === cantidadFilter);
    }
    return result;
  }, [movimientos, fechaFilter, cantidadFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowDownUp size={24} /> Movimientos de Stock
        </h1>
        <p className="text-slate-500">{total} movimientos registrados</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "producto", label: "Producto", type: "text" },
              { key: "local",    label: "Local",    type: "text" },
              { key: "fecha",    label: "Fecha",    type: "date" },
              { key: "cantidad", label: "Cantidad", type: "number" },
              {
                key: "tipo",
                label: "Tipo",
                type: "select",
                options: TIPOS.map((t) => ({ value: t, label: TIPO_LABEL[t].label })),
              },
            ]}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th className="text-right">Cantidad</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron movimientos.</td></tr>
              ) : (
                displayMovimientos.map((m) => {
                  const tipo = TIPO_LABEL[m.tipo] ?? { label: m.tipo, class: "badge-secondary" };
                  return (
                    <tr key={m.id} className="table-row-hover">
                      <td>{new Date(m.fecha ?? m.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${tipo.class}`}>{tipo.label}</span></td>
                      <td className="font-medium">{m.producto?.name ?? m.productoId}</td>
                      <td className="text-right font-semibold">{m.cantidad}</td>
                      <td>{m.local?.name ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
