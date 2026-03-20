"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import EntitySearchBar from "@/components/EntitySearchBar";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProductos, useCategorias } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

export default function ProductosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [textFilter, setTextFilter] = useState({ key: "nombre", value: "" });
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const { data, isLoading } = useProductos({
    localId,
    limit: 100,
    categoriaId: categoriaFilter || undefined,
  });
  const { data: categorias } = useCategorias();

  const allProductos = data?.data ?? [];
  const filtered = textFilter.value
    ? allProductos.filter((p) => {
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "codigo":  return p.code?.toLowerCase().includes(q);
          case "precio":  return String(p.price ?? "").includes(q);
          case "costo":   return String(p.cost ?? "").includes(q);
          case "stock":   return String(p.stockTotal ?? "").includes(q);
          case "estado":  return q === "true" ? p.active : q === "false" ? !p.active : true;
          default:        return p.name?.toLowerCase().includes(q);
        }
      })
    : allProductos;
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const productos = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = filtered.length;

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
          <EntitySearchBar
            fields={[
              { key: "codigo",  label: "Código",    type: "text" },
              { key: "nombre",  label: "Nombre",    type: "text" },
              {
                key: "categoriaId",
                label: "Categoría",
                type: "select",
                options: (categorias?.data ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              },
              { key: "precio",  label: "Precio",    type: "number" },
              { key: "costo",   label: "Costo",     type: "number" },
              { key: "stock",   label: "Stock",     type: "number" },
              { key: "estado",  label: "Estado",    type: "boolean" },
            ]}
            onSearch={(key, value) => {
              if (key === "categoriaId") { setCategoriaFilter(value); setTextFilter({ key: "nombre", value: "" }); }
              else if (key === "estado") { setCategoriaFilter(""); setTextFilter({ key, value }); }
              else { setTextFilter({ key, value }); setCategoriaFilter(""); }
              setPage(1);
            }}
          />
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
