"use client";

import { useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProductos, useCategorias } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

export default function ProductosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProductos({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const { data: categorias } = useCategorias();

  const productos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">{total} productos registrados</p>
        </div>
        <Link href="/inventario/productos/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Producto
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Costo</th>
                <th>Stock</th>
                <th>Mín.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.categoria?.name ?? "—"}</td>
                    <td className="text-right">${p.price?.toLocaleString()}</td>
                    <td className="text-right">${p.cost?.toLocaleString()}</td>
                    <td
                      className={`text-right font-semibold ${(p.stockTotal ?? 0) <= (p.minStock ?? 0) ? "text-red-600" : "text-slate-900"}`}
                    >
                      {p.stockTotal ?? 0}
                    </td>
                    <td className="text-right">{p.minStock ?? 0}</td>
                    <td>
                      <span
                        className={`badge ${p.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
