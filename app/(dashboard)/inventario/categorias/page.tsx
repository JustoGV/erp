"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, Pencil, Save, X, Package, Ban, FileUp } from "lucide-react";
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
} from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import { parseApiError } from "@/lib/types/api";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";
import type { Categoria } from "@/lib/api-types";

const LIMIT = 20;

interface FormState {
  name: string;
  description: string;
  active: boolean;
}

const emptyForm = (): FormState => ({ name: "", description: "", active: true });

export default function CategoriasPage() {
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();

  // ── Filters ────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [productosFilter, setProductosFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const handleSearch = (key: string, value: string) => {
    if (key === "nombre" || key === "descripcion") {
      setSearch(value);
    } else if (key === "estado") {
      setActiveFilter(value as "" | "true" | "false");
    } else if (key === "productos") {
      setProductosFilter(value ? parseInt(value, 10) : null);
    }
    setPage(1);
  };

  const activeParam =
    activeFilter === "true" ? true : activeFilter === "false" ? false : undefined;

  const { data, isLoading } = useCategorias({
    page,
    limit: LIMIT,
    search: search || undefined,
    active: activeParam,
  });
  const categorias = data?.data ?? [];
  const meta = data?.meta;
  const displayCategorias = productosFilter !== null
    ? categorias.filter((c) => (c._count?.productos ?? 0) >= productosFilter!)
    : categorias;

  // ── Modal / Form ───────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [nameError, setNameError] = useState("");
  const [warnDeactivate, setWarnDeactivate] = useState(false);

  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const isPending = createCategoria.isPending || updateCategoria.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setNameError("");
    setWarnDeactivate(false);
    setModalOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", active: cat.active });
    setNameError("");
    setWarnDeactivate(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!isPending) setModalOpen(false);
  };

  const setField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name") setNameError("");
    if (field === "active" && !value && editing && (editing._count?.productos ?? 0) > 0) {
      setWarnDeactivate(true);
    } else if (field === "active") {
      setWarnDeactivate(false);
    }
  };

  // Client-side validation
  const validate = (): boolean => {
    if (!form.name.trim()) {
      setNameError("El nombre es obligatorio.");
      return false;
    }
    if (form.name.trim().length > 100) {
      setNameError("El nombre no puede superar los 100 caracteres.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editing) {
      updateCategoria.mutate(
        {
          id: editing.id,
          dto: {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            active: form.active,
          },
        },
        {
          onSuccess: () => {
            handleSuccess("Categoría actualizada correctamente");
            setModalOpen(false);
          },
          onError: (err) => {
            const parsed = parseApiError(err);
            if (parsed.code === "CONFLICT") {
              setNameError(parsed.message);
            } else {
              setNameError(parsed.message);
            }
          },
        },
      );
    } else {
      createCategoria.mutate(
        {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        },
        {
          onSuccess: () => {
            handleSuccess("Categoría creada correctamente");
            setModalOpen(false);
          },
          onError: (err) => {
            const parsed = parseApiError(err);
            if (parsed.code === "CONFLICT") {
              setNameError(parsed.message);
            } else {
              setNameError(parsed.message);
            }
          },
        },
      );
    }
  };

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tags size={24} /> Categorías
          </h1>
          <p className="text-slate-500">
            {meta ? `${meta.total} categoría${meta.total !== 1 ? "s" : ""}` : "Cargando..."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
            <button onClick={openCreate} className="btn btn-primary">
              <Plus size={18} /> Nueva Categoría
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <EntitySearchBar
        fields={[
          { key: "nombre",      label: "Nombre",       type: "text" },
          { key: "descripcion", label: "Descripción",  type: "text" },
          { key: "productos",   label: "Nº Productos",  type: "number" },
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { value: "true",  label: "Activa" },
              { value: "false", label: "Inactiva" },
            ],
          },
        ]}
        onSearch={handleSearch}
      />

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="text-center">Productos</th>
                <th>Estado</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-slate-400">
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                displayCategorias.map((cat) => {
                  const count = cat._count?.productos ?? 0;
                  return (
                    <tr key={cat.id} className="table-row-hover">
                      <td className="font-medium">{cat.name}</td>
                      <td className="text-slate-500 max-w-xs truncate">
                        {cat.description ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            count > 0
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Package size={11} />
                          {count}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${cat.active ? "badge-success" : "badge-secondary"}`}
                        >
                          {cat.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(cat)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Editar categoría"
                            >
                              <Pencil size={16} />
                            </button>
                            {cat.active && (
                              <button
                                onClick={() => setConfirmBajaItem({ id: cat.id, name: cat.name })}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Dar de baja"
                              >
                                <Ban size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja la categoría <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmBajaItem(null)}
              disabled={updateCategoria.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateCategoria.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateCategoria.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => {
                      handleSuccess("Categoría dada de baja correctamente");
                      setConfirmBajaItem(null);
                    },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateCategoria.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editing ? "Editar Categoría" : "Nueva Categoría"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="cat-name" className="label">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              maxLength={100}
              required
              autoFocus
              className={`input ${nameError ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="Ej: Materia Prima"
            />
            <div className="flex items-start justify-between mt-1">
              {nameError ? (
                <p className="text-sm text-red-600">{nameError}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-slate-400 ml-auto">
                {form.name.length}/100
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cat-desc" className="label">
              Descripción
            </label>
            <textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              maxLength={300}
              rows={3}
              className="input resize-none"
              placeholder="Descripción opcional de la categoría"
            />
            <p className="text-xs text-slate-400 text-right mt-1">
              {form.description.length}/300
            </p>
          </div>

          {/* Active toggle (edit only) */}
          {editing && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  id="cat-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setField("active", e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="cat-active" className="label mb-0 cursor-pointer">
                  Categoría activa
                </label>
              </div>
              {warnDeactivate && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Esta categoría tiene{" "}
                  <strong>{editing._count?.productos} producto(s)</strong> asociado(s).
                  Desactivarla los dejará sin categoría activa.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              <Save size={16} />
              {isPending
                ? "Guardando..."
                : editing
                  ? "Guardar Cambios"
                  : "Crear Categoría"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="btn btn-secondary"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Categoría"
        templateFileName="plantilla_categorias.xlsx"
        columns={[
          { key: "name", label: "Nombre", required: true, type: "string", example: "Materia Prima" },
          { key: "description", label: "Descripción", type: "string", example: "Descripción opcional" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            createCategoria.mutate(
              rows[0] as { name: string; description?: string },
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}

