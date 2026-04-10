"use client";

import { useState } from "react";
import { Truck, Plus, Ban, FileUp } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProveedores, useCrearProveedor, useActualizarProveedor } from "@/hooks/useCompras";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function ProveedoresPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const actualizarProveedor = useActualizarProveedor();
  const crearProveedor = useCrearProveedor();

  const { data, isLoading } = useProveedores({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const proveedores = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const displayProveedores = activeFilter
    ? proveedores.filter((p) => p.active === (activeFilter === "true"))
    : proveedores;

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
            <Truck size={24} /> Proveedores
          </h1>
          <p className="text-slate-500">{total} proveedores registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          <Link href="/compras/proveedores/nuevo" className="btn btn-primary">
            <Plus size={18} /> Nuevo Proveedor
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "nombre",   label: "Nombre",    type: "text" },
              { key: "codigo",   label: "Código",    type: "text" },
              { key: "taxId",    label: "CUIT / RUT", type: "text" },
              { key: "email",    label: "Email",     type: "text" },
              { key: "telefono", label: "Teléfono",  type: "text" },
              { key: "condPago", label: "Cond. Pago", type: "text" },
              { key: "estado",   label: "Estado",    type: "boolean" },
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
                <th>CUIT / RUT</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Cond. Pago</th>
                <th>Estado</th>                <th></th>              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                displayProveedores.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.taxId ?? "—"}</td>
                    <td>{p.email ?? "—"}</td>
                    <td>{p.phone ?? "—"}</td>
                    <td>{p.paymentTerms ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${p.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>                    <td>
                      {isAdmin && p.active && (
                        <button
                          onClick={() => setConfirmBajaItem({ id: p.id, name: p.name })}
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

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja al proveedor <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={actualizarProveedor.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actualizarProveedor.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                actualizarProveedor.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Proveedor dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {actualizarProveedor.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Proveedor"
        templateFileName="plantilla_proveedores.xlsx"
        columns={[
          { key: "code",         label: "Código",       required: true,  type: "string", example: "PRV-001" },
          { key: "name",         label: "Nombre",       required: true,  type: "string", example: "Proveedor SA" },
          { key: "taxId",        label: "CUIT/RUT",     required: false, type: "string", example: "20-12345678-9" },
          { key: "email",        label: "Email",        required: false, type: "string", example: "prv@ejemplo.com" },
          { key: "phone",        label: "Teléfono",     required: false, type: "string", example: "1198765432" },
          { key: "address",      label: "Dirección",    required: false, type: "string", example: "" },
          { key: "paymentTerms", label: "Días de Pago", required: false, type: "number", example: "30" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            crearProveedor.mutate(
              { ...rows[0], localId: selectedLocal?.id } as unknown as Parameters<typeof crearProveedor.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
