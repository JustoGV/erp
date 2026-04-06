"use client";

import { useState, useMemo } from "react";
import { UserCog, Plus, Ban } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEmpleados, useEmpleado } from "@/hooks/useRRHH";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "@/hooks/useUsuarios";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";
import type { UserRole } from "@/lib/api-types";

const ROL_OPTIONS: { value: string; label: string }[] = [
  { value: "Administrador", label: "Administrador" },
  { value: "Gerente",       label: "Gerente" },
  { value: "Vendedor",      label: "Vendedor" },
  { value: "Inventario",    label: "Inventario" },
  { value: "Contador",      label: "Contador" },
  { value: "RRHH",          label: "RRHH" },
  { value: "Produccion",    label: "Producción" },
  { value: "SoloLectura",   label: "Solo lectura" },
];

const ROL_LABEL: Record<string, string> = Object.fromEntries(
  ROL_OPTIONS.map((r) => [r.value, r.label])
);

export default function RRHHUsuariosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const { user: authUser } = useAuth();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();

  // List
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");

  const { data, isLoading } = useUsuarios({ page, limit: 20, search: search || undefined });
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

  // Baja
  const updateUsuario = useUpdateUsuario();
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);

  // Crear usuario desde empleado
  const crearUsuario = useCreateUsuario();
  const [modalOpen, setModalOpen] = useState(false);

  const [empleadoSearch, setEmpleadoSearch] = useState("");
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<string | null>(null);
  const [selectedEmpleadoName, setSelectedEmpleadoName] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { data: empleadosData } = useEmpleados({
    localId,
    search: empleadoSearch || undefined,
    limit: 20,
  });
  const empleados = empleadosData?.data ?? [];

  // Fetch detalle del empleado seleccionado para obtener email
  const { data: empleadoDetalle } = useEmpleado(selectedEmpleadoId ?? "");
  const selectedEmpleado = empleadoDetalle?.data ?? null;

  const openModal = () => {
    setSelectedEmpleadoId(null);
    setSelectedEmpleadoName("");
    setEmpleadoSearch("");
    setRol("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setFormError("");
    if (!selectedEmpleadoId) { setFormError("Seleccioná un empleado."); return; }
    if (!selectedEmpleado?.email) { setFormError("El empleado no tiene email registrado."); return; }
    if (!rol) { setFormError("Seleccioná un rol."); return; }
    if (!password) { setFormError("Ingresá una contraseña."); return; }
    if (password.length < 8) { setFormError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setFormError("Las contraseñas no coinciden."); return; }

    crearUsuario.mutate(
      {
        nombre: selectedEmpleado.name,
        email: selectedEmpleado.email,
        password,
        rol: rol as UserRole,
        localId: localId ?? undefined,
      },
      {
        onSuccess: () => {
          handleSuccess("Usuario creado correctamente");
          setModalOpen(false);
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? "Error al crear el usuario";
          setFormError(msg);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog size={24} /> Usuarios RRHH
          </h1>
          <p className="text-slate-500">{total} usuarios registrados</p>
        </div>
        {isAdmin && (
          <button onClick={openModal} className="btn btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Nuevo Usuario
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
                options: ROL_OPTIONS,
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
                  <td colSpan={5} className="text-center py-10">Cargando...</td>
                </tr>
              ) : displayUsuarios.length === 0 ? (
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
                      <span className={`badge ${u.active ? "badge-success" : "badge-secondary"}`}>
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
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal crear usuario */}
      <Modal open={modalOpen} title="Crear Usuario desde Empleado" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          {/* Selección de empleado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar empleado
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Escribí el nombre del empleado..."
              value={empleadoSearch}
              onChange={(e) => { setEmpleadoSearch(e.target.value); setSelectedEmpleadoId(null); setSelectedEmpleadoName(""); }}
            />
            {empleadoSearch && !selectedEmpleadoId && empleados.length > 0 && (
              <ul className="border border-slate-200 rounded-lg mt-1 max-h-48 overflow-y-auto bg-white shadow-sm">
                {empleados.map((emp) => (
                  <li
                    key={emp.id}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-50 text-sm"
                    onClick={() => {
                      setSelectedEmpleadoId(emp.id);
                      setSelectedEmpleadoName(emp.name);
                      setEmpleadoSearch(emp.name);
                    }}
                  >
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-slate-400 ml-2 text-xs">{emp.position}</span>
                  </li>
                ))}
              </ul>
            )}
            {empleadoSearch && !selectedEmpleadoId && empleados.length === 0 && (
              <p className="text-sm text-slate-400 mt-1">Sin resultados.</p>
            )}
          </div>

          {/* Info del empleado seleccionado */}
          {selectedEmpleadoId && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
              {!selectedEmpleado ? (
                <p className="text-slate-400">Cargando datos del empleado...</p>
              ) : (
                <>
                  <p><span className="text-slate-500">Nombre:</span> <strong>{selectedEmpleado.name}</strong></p>
                  <p><span className="text-slate-500">Email:</span> {selectedEmpleado.email ? selectedEmpleado.email : <span className="text-red-500">Sin email registrado</span>}</p>
                  <p><span className="text-slate-500">Cargo:</span> {selectedEmpleado.position}</p>
                  {localId && <p><span className="text-slate-500">Local:</span> {selectedLocal?.name}</p>}
                </>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select
              className="input w-full"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="">Seleccionar rol...</option>
              {ROL_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="input w-full"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirmar password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              className="input w-full"
              placeholder="Repetí la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={crearUsuario.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={crearUsuario.isPending}
            >
              {crearUsuario.isPending ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja al usuario <strong>{confirmBajaItem?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmBajaItem(null)}
              disabled={updateUsuario.isPending}
            >
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
                    onSuccess: () => {
                      handleSuccess("Usuario dado de baja correctamente");
                      setConfirmBajaItem(null);
                    },
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
    </div>
  );
}
