"use client";

import { useMemo, useState } from "react";
import { UserCog, Ban, FileUp } from "lucide-react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "@/hooks/useUsuarios";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";

const ROL_LABEL: Record<string, string> = {
  Administrador: "Administrador",
  Gerente: "Gerente",
  Vendedor: "Vendedor",
  Inventario: "Inventario",
  Contador: "Contador",
  RRHH: "RRHH",
  Produccion: "Producción",
  SoloLectura: "Solo lectura",
};

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const updateUsuario = useUpdateUsuario();
  const crearUsuario = useCreateUsuario();

  const { data, isLoading } = useUsuarios({
    page,
    limit: 20,
    search: search || undefined,
  });
  const usuarios = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const displayUsuarios = useMemo(() => {
    let result = usuarios;
    if (rolFilter) result = result.filter((u) => u.rol === rolFilter);
    if (activeFilter) result = result.filter((u) => u.active === (activeFilter === "true"));
    return result;
  }, [usuarios, rolFilter, activeFilter]);

  const handleSearch = (key: string, value: string) => {
    if (key === "rol") { setRolFilter(value); }
    else if (key === "estado") { setActiveFilter(value as "" | "true" | "false"); }
    else { setSearch(value); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog size={24} /> Usuarios
          </h1>
          <p className="text-slate-500">{total} usuarios registrados</p>
        </div>
        {isAdmin && (
          <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
            <FileUp size={16} /> Importar
          </button>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "nombre", label: "Nombre", type: "text" },
              { key: "email",  label: "Email",  type: "text" },
              {
                key: "rol",
                label: "Rol",
                type: "select",
                options: Object.entries(ROL_LABEL).map(([v, l]) => ({ value: v, label: l })),
              },
              { key: "estado", label: "Estado", type: "boolean" },
            ]}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                displayUsuarios.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="font-medium">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-info">
                        {ROL_LABEL[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      {isAdmin && u.active && (
                        <button
                          onClick={() => setConfirmBajaItem({ id: u.id, name: u.nombre })}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Dar de baja"
                        >
                          <Ban size={15} />
                        </button>
                      )}
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
            ¿Dar de baja al usuario <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={updateUsuario.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateUsuario.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateUsuario.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Usuario dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateUsuario.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Usuario"
        templateFileName="plantilla_usuarios.xlsx"
        columns={[
          { key: "nombre",   label: "Nombre",   required: true,  type: "string", example: "Ana Gómez" },
          { key: "email",    label: "Email",    required: true,  type: "string", example: "ana@empresa.com" },
          { key: "password", label: "Contraseña", required: true, type: "string", example: "Pass1234!" },
          { key: "rol",      label: "Rol",      required: true,  type: "string", example: "VENDEDOR" },
          { key: "localId",  label: "LocalId",  required: false, type: "string", example: "uuid-del-local" },
        ]}
        onImport={async (rows) => {
          await new Promise<void>((resolve, reject) => {
            crearUsuario.mutate(
              rows[0] as unknown as Parameters<typeof crearUsuario.mutate>[0],
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
