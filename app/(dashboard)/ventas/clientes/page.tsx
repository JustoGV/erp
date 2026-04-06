"use client";

import Link from "next/link";
import { Plus, Edit, Users, Ban, FileUp } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useEffect, useState } from "react";
import { useClientes, useCrearCliente, useActualizarCliente } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function ClientesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [textFilter, setTextFilter] = useState({ key: "nombre", value: "" });
  const [activeFilter, setActiveFilter] = useState("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { handleError, handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const actualizarCliente = useActualizarCliente();
  const crearCliente = useCrearCliente();

  const { data, isLoading, isError, error } = useClientes({
    localId: isAllLocales ? undefined : selectedLocal?.id,
    active: activeFilter === "" ? undefined : activeFilter === "true",
    limit: 100,
  });

  useEffect(() => {
    if (isError) handleError(error);
  }, [isError, error, handleError]);

  const allClientes = data?.data ?? [];
  const clientes = textFilter.value
    ? allClientes.filter((c) => {
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "codigo":   return c.code?.toLowerCase().includes(q);
          case "taxId":    return c.taxId?.toLowerCase().includes(q);
          case "email":    return c.email?.toLowerCase().includes(q);
          case "telefono": return c.phone?.toLowerCase().includes(q);
          default:         return c.name?.toLowerCase().includes(q);
        }
      })
    : allClientes;
  const total = allClientes.length;
  const activeClients = clientes.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Users size={16} />
            {total} clientes registrados • {activeClients} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          <Link href="/ventas/clientes/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <EntitySearchBar
          fields={[
            { key: "codigo",   label: "Código",    type: "text" },
            { key: "nombre",   label: "Nombre",    type: "text" },
            { key: "taxId",    label: "CUIT/DNI",  type: "text" },
            { key: "email",    label: "Email",     type: "text" },
            { key: "telefono", label: "Teléfono",  type: "text" },
            { key: "active",   label: "Estado",    type: "boolean" },
          ]}
          onSearch={(key, value) => {
            if (key === "active") { setActiveFilter(value); setTextFilter({ key: "nombre", value: "" }); }
            else { setTextFilter({ key, value }); setActiveFilter(""); }
          }}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>CUIT/DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  Cargando clientes...
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="table-row-hover">
                  <td>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {cliente.code}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                        {cliente.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {cliente.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cliente.address ?? cliente.city ?? ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{cliente.taxId ?? "-"}</td>
                  <td className="text-slate-700">{cliente.email ?? "-"}</td>
                  <td className="text-slate-700">{cliente.phone ?? "-"}</td>
                  <td>
                    <span
                      className={`badge ${cliente.active ? "badge-success" : "badge-neutral"}`}
                    >
                      {cliente.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                    <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/ventas/clientes/${cliente.id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                      {isAdmin && cliente.active && (
                        <button
                          onClick={() => setConfirmBajaItem({ id: cliente.id, name: cliente.name })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Dar de baja"
                        >
                          <Ban size={16} />
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">{clientes.length}</span> de{" "}
          <span className="font-semibold">{total}</span> clientes
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>
            Anterior
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            1
          </button>
          <button className="btn btn-secondary" disabled>
            Siguiente
          </button>
        </div>
      </div>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja al cliente <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={actualizarCliente.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actualizarCliente.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                actualizarCliente.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Cliente dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {actualizarCliente.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Cliente"
        templateFileName="plantilla_clientes.xlsx"
        columns={[
          { key: "name",        label: "Nombre",      required: true,  type: "string", example: "Empresa SA" },
          { key: "taxId",       label: "CUIT/DNI",    required: false, type: "string", example: "20-12345678-9" },
          { key: "email",       label: "Email",       required: false, type: "string", example: "info@empresa.com" },
          { key: "phone",       label: "Teléfono",    required: false, type: "string", example: "1112345678" },
          { key: "address",     label: "Dirección",   required: false, type: "string", example: "Av. Corrientes 123" },
          { key: "creditLimit", label: "Límite Crédito", required: false, type: "number", example: "50000" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            crearCliente.mutate(
              { ...rows[0], localId: selectedLocal?.id } as unknown as Parameters<typeof crearCliente.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
