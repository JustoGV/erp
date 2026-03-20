"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/Pagination";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";
import { useStockPorLocal } from "@/hooks/useInventario";

export default function StockPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const { handleError } = useApiToast();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const stockQuery = useStockPorLocal(selectedLocal?.id ?? null);

  if (stockQuery.isError) handleError(stockQuery.error);

  const items = stockQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control de Stock</h1>
          <p className="text-slate-600 mt-1">Existencias por depósito</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Depósito</th>
              <th>Stock</th>
              <th>Mínimo</th>
            </tr>
          </thead>
          <tbody>
            {isAllLocales ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  Selecciona un local para ver el stock.
                </td>
              </tr>
            ) : stockQuery.isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-500">
                  Cargando stock...
                </td>
              </tr>
            ) : pagedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  No hay stock disponible.
                </td>
              </tr>
            ) : (
              pagedItems.map((item) => (
                <tr key={item.id} className="table-row-hover">
                  <td className="font-medium">
                    {item.producto?.name ?? item.productoId}
                  </td>
                  <td>{item.deposito?.name ?? "-"}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.producto?.minStock ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
