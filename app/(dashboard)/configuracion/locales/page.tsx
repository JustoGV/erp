"use client";

import { useState } from "react";
import { MapPin, Ban, FileUp, Plus } from "lucide-react";
import { useLocales, useCreateLocal, useUpdateLocal } from "@/hooks/useLocales";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function LocalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const updateLocal = useUpdateLocal();
  const crearLocal = useCreateLocal();

  // Form crear local
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", city: "", state: "", address: "", phone: "", email: "", manager: "" });
  const [formError, setFormError] = useState("");

  const openModal = () => {
    setForm({ code: "", name: "", city: "", state: "", address: "", phone: "", email: "", manager: "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setFormError("");
    if (!form.code.trim()) { setFormError("El código es obligatorio."); return; }
    if (!form.name.trim()) { setFormError("El nombre es obligatorio."); return; }
    crearLocal.mutate(
      {
        code: form.code.trim(),
        name: form.name.trim(),
        city:    form.city.trim()    || undefined,
        state:   form.state.trim()   || undefined,
        address: form.address.trim() || undefined,
        phone:   form.phone.trim()   || undefined,
        email:   form.email.trim()   || undefined,
        manager: form.manager.trim() || undefined,
      },
      {
        onSuccess: () => { handleSuccess("Local creado correctamente"); setModalOpen(false); },
        onError: (err: unknown) => {
          setFormError((err as { message?: string })?.message ?? "Error al crear el local");
        },
      },
    );
  };

  const { data, isLoading } = useLocales({
    page,
    limit: 20,
    search: search || undefined,
  });
  const locales = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const displayLocales = activeFilter
    ? locales.filter((l) => l.active === (activeFilter === "true"))
    : locales;

  const handleSearch = (key: string, value: string) => {
    if (key === "estado") {
      setActiveFilter(value as "" | "true" | "false");
    } else {
      setSearch(value);
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={24} /> Locales / Sucursales
          </h1>
          <p className="text-slate-500">{total} locales registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          {isAdmin && (
            <button onClick={openModal} className="btn btn-primary flex items-center gap-1.5">
              <Plus size={16} /> Nuevo Local
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "nombre",      label: "Nombre",      type: "text" },
              { key: "ciudad",      label: "Ciudad",       type: "text" },
              { key: "codigo",      label: "Código",       type: "text" },
              { key: "responsable", label: "Responsable",  type: "text" },
              { key: "estado",      label: "Estado",       type: "boolean" },
            ]}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : locales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron locales.
                  </td>
                </tr>
              ) : (
                displayLocales.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td className="font-mono text-xs">{l.code}</td>
                    <td className="font-medium">{l.name}</td>
                    <td>{l.city ?? "—"}</td>
                    <td>{l.manager ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${l.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {l.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>                    <td>
                      {isAdmin && l.active && (
                        <button
                          onClick={() => setConfirmBajaItem({ id: l.id, name: l.name })}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Dar de baja"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                    </td>                  </tr>
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

      {/* Modal crear local */}
      <Modal open={modalOpen} title="Nuevo Local / Sucursal" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: LOC-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: Sucursal Norte" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input className="input w-full" placeholder="Ej: Buenos Aires" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
              <input className="input w-full" placeholder="Ej: Buenos Aires" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input className="input w-full" placeholder="Ej: Av. Rivadavia 1234" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input className="input w-full" placeholder="Ej: 1145678901" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="input w-full" type="email" placeholder="local@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
            <input className="input w-full" placeholder="Nombre del responsable" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
          </div>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={crearLocal.isPending}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={crearLocal.isPending}>
              {crearLocal.isPending ? "Creando..." : "Crear Local"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja el local <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={updateLocal.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateLocal.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateLocal.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Local dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateLocal.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Local"
        templateFileName="plantilla_locales.xlsx"
        columns={[
          { key: "code",    label: "Código",      required: true,  type: "string", example: "LOC-001" },
          { key: "name",    label: "Nombre",      required: true,  type: "string", example: "Sucursal Norte" },
          { key: "city",    label: "Ciudad",      required: false, type: "string", example: "Buenos Aires" },
          { key: "address", label: "Dirección",   required: false, type: "string", example: "Av. Rivadavia 1234" },
          { key: "phone",   label: "Teléfono",    required: false, type: "string", example: "1145678901" },
          { key: "email",   label: "Email",       required: false, type: "string", example: "local@empresa.com" },
          { key: "manager", label: "Responsable", required: false, type: "string", example: "Juan Pérez" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            crearLocal.mutate(
              rows[0] as unknown as Parameters<typeof crearLocal.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
