"use client";

import { useState } from "react";
import { Warehouse, Plus, Pencil, Ban, FileUp } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useDepositos, useCreateDeposito, useUpdateDeposito } from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function DepositosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const updateDeposito = useUpdateDeposito();
  const createDeposito = useCreateDeposito();

  const { data, isLoading } = useDepositos({
    localId,
    search: search || undefined,
  });
  const depositos = data?.data ?? [];
  const displayDepositos = activeFilter
    ? depositos.filter((d) => d.active === (activeFilter === "true"))
    : depositos;

  const handleSearch = (key: string, value: string) => {
    if (key === "estado") {
      setActiveFilter(value as "" | "true" | "false");
    } else {
      setSearch(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Warehouse size={24} /> Depósitos
            </h1>
            <p className="text-slate-500">
              {depositos.length} depósitos registrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
                <FileUp size={16} /> Importar
              </button>
            )}
            <Link href="/inventario/depositos/nuevo" className="btn btn-primary">
              <Plus size={18} /> Nuevo Depósito
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "nombre",    label: "Nombre",    type: "text" },
              { key: "codigo",    label: "Código",    type: "text" },
              { key: "local",     label: "Local",     type: "text" },
              { key: "direccion", label: "Dirección", type: "text" },
              { key: "estado",    label: "Estado",    type: "boolean" },
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
                <th>Local</th>
                <th>Dirección</th>
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
              ) : depositos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron depósitos.
                  </td>
                </tr>
              ) : (
                displayDepositos.map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="font-mono text-xs">{d.code}</td>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.local?.name ?? "—"}</td>
                    <td>{d.address ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${d.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {d.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/inventario/depositos/${d.id}`}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Link>
                        {isAdmin && d.active && (
                          <button
                            onClick={() => setConfirmBajaItem({ id: d.id, name: d.name })}
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
      </div>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja el depósito <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={updateDeposito.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateDeposito.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateDeposito.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Depósito dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateDeposito.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Depósito"
        templateFileName="plantilla_depositos.xlsx"
        columns={[
          { key: "code",    label: "Código",   required: true,  type: "string", example: "DEP-001" },
          { key: "name",    label: "Nombre",   required: true,  type: "string", example: "Depósito Central" },
          { key: "address", label: "Dirección", required: false, type: "string", example: "Calle 123" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            createDeposito.mutate(
              { ...rows[0], localId: selectedLocal?.id } as unknown as Parameters<typeof createDeposito.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
