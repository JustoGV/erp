"use client";

import { useState } from "react";
import { Package, Plus, Pencil, Ban, FileUp } from "lucide-react";
import EntitySearchBar from "@/components/EntitySearchBar";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProductos, useCategorias, useCreateProducto, useUpdateProducto } from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";

export default function ProductosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [textFilter, setTextFilter] = useState({ key: "nombre", value: "" });
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importPreOpen, setImportPreOpen] = useState(false);
  const [importCategoriaId, setImportCategoriaId] = useState("");

  const updateProducto = useUpdateProducto();
  const createProducto = useCreateProducto();

  const { data, isLoading } = useProductos({
    localId,
    limit: 100,
    categoriaId: categoriaFilter || undefined,
  });
  const { data: categorias } = useCategorias();

  const allProductos = data?.data ?? [];
  const filtered = allProductos
    .filter((p) => {
      if (activeFilter === "true") return p.active;
      if (activeFilter === "false") return !p.active;
      return true;
    })
    .filter((p) => {
        if (!textFilter.value) return true;
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "codigo":  return p.code?.toLowerCase().includes(q);
          case "precio":  return String(p.price ?? "").includes(q);
          case "costo":   return String(p.cost ?? "").includes(q);
          case "stock":   return String(p.stockTotal ?? "").includes(q);
          default:        return p.name?.toLowerCase().includes(q);
        }
      });
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
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setImportPreOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          <Link href="/inventario/productos/nuevo" className="btn btn-primary">
            <Plus size={18} /> Nuevo Producto
          </Link>
        </div>
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
              {
                key: "estado",
                label: "Estado",
                type: "select",
                options: [
                  { value: "true",  label: "Activo" },
                  { value: "false", label: "Inactivo" },
                ],
              },
            ]}
            onSearch={(key, value) => {
              if (key === "categoriaId") { setCategoriaFilter(value); setTextFilter({ key: "nombre", value: "" }); }
              else if (key === "estado") { setActiveFilter(value as "" | "true" | "false"); setCategoriaFilter(""); setTextFilter({ key: "nombre", value: "" }); }
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
                <th className="text-right">Precio</th>
                <th className="text-right">Costo</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Mín.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
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
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/inventario/productos/${p.id}`}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Link>
                        {isAdmin && p.active && (
                          <button
                            onClick={() => setConfirmBajaItem({ id: p.id, name: p.name })}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Dar de baja"
                          >
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
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

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja el producto <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={updateProducto.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateProducto.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateProducto.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Producto dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateProducto.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pre-step: elegir categoría antes de importar */}
      <Modal
        open={importPreOpen}
        onClose={() => { setImportPreOpen(false); setImportCategoriaId(""); }}
        title="Importar Productos"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Opcionalmente elegí una categoría para asignar a todos los productos importados.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select
              className="input w-full"
              value={importCategoriaId}
              onChange={(e) => setImportCategoriaId(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {(categorias?.data ?? []).filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="btn btn-secondary"
              onClick={() => { setImportPreOpen(false); setImportCategoriaId(""); }}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setImportPreOpen(false); setImportOpen(true); }}
            >
              Continuar
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Producto"
        templateFileName="plantilla_productos.xlsx"
        columns={[
          { key: "code",        label: "Código",      required: true,  type: "string",  example: "PRD-001" },
          { key: "name",        label: "Nombre",      required: true,  type: "string",  example: "Papel A4" },
          { key: "tipo",        label: "Tipo",        required: true,  type: "string",  example: "TERMINADO", hint: "TERMINADO | SEMI_TERMINADO | MATERIA_PRIMA | INSUMO" },
          { key: "unit",        label: "Unidad",      required: true,  type: "string",  example: "kg" },
          { key: "price",       label: "Precio",      required: true,  type: "number",  example: "1500" },
          { key: "cost",        label: "Costo",       required: true,  type: "number",  example: "900" },
          { key: "minStock",    label: "Stock Mínimo", required: true,  type: "number",  example: "10" },
          { key: "description", label: "Descripción", required: false, type: "string",  example: "" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            createProducto.mutate(
              { ...rows[0], ...(importCategoriaId ? { categoriaId: importCategoriaId } : {}) } as unknown as Parameters<typeof createProducto.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
