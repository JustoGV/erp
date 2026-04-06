"use client";

import { useState } from "react";
import { Building2, Plus, Ban, UserPlus, MapPin } from "lucide-react";
import { useEmpresas, useCreateEmpresa, useUpdateEmpresa } from "@/hooks/useEmpresas";
import { useCreateUsuario } from "@/hooks/useUsuarios";
import { useCreateLocal } from "@/hooks/useLocales";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import type { UserRole } from "@/lib/api-types";
import Modal from "@/components/Modal";

const ROL_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "Administrador", label: "Administrador" },
  { value: "Gerente",       label: "Gerente" },
  { value: "Vendedor",      label: "Vendedor" },
  { value: "Inventario",    label: "Inventario" },
  { value: "Contador",      label: "Contador" },
  { value: "RRHH",          label: "RRHH" },
  { value: "Produccion",    label: "Producción" },
  { value: "SoloLectura",   label: "Solo Lectura" },
];

export default function EmpresasPage() {
  const { data: empresas, isLoading } = useEmpresas();
  const items = empresas ?? [];
  const { handleSuccess } = useApiToast();
  const { isSuper } = usePermissions();
  const crearEmpresa = useCreateEmpresa();
  const updateEmpresa = useUpdateEmpresa();
  const crearUsuario = useCreateUsuario();
  const crearLocal = useCreateLocal();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", taxId: "", city: "", state: "", address: "", phone: "", email: "" });
  const [formError, setFormError] = useState("");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);

  // Local creation per empresa
  const [localModal, setLocalModal] = useState<{ id: string; name: string } | null>(null);
  const [localForm, setLocalForm] = useState({ code: "", name: "", city: "", state: "", address: "", phone: "", email: "", manager: "" });
  const [localFormError, setLocalFormError] = useState("");

  const openLocalModal = (empresa: { id: string; name: string }) => {
    setLocalForm({ code: "", name: "", city: "", state: "", address: "", phone: "", email: "", manager: "" });
    setLocalFormError("");
    setLocalModal(empresa);
  };

  const handleCreateLocal = () => {
    setLocalFormError("");
    if (!localForm.code.trim()) { setLocalFormError("El código es obligatorio."); return; }
    if (!localForm.name.trim()) { setLocalFormError("El nombre es obligatorio."); return; }
    if (!localModal) return;
    crearLocal.mutate(
      {
        code:     localForm.code.trim(),
        name:     localForm.name.trim(),
        city:     localForm.city.trim()    || undefined,
        state:    localForm.state.trim()   || undefined,
        address:  localForm.address.trim() || undefined,
        phone:    localForm.phone.trim()   || undefined,
        email:    localForm.email.trim()   || undefined,
        manager:  localForm.manager.trim() || undefined,
        empresaId: localModal.id,
      },
      {
        onSuccess: () => { handleSuccess("Local creado correctamente"); setLocalModal(null); },
        onError: (err: unknown) => setLocalFormError((err as { message?: string })?.message ?? "Error al crear el local"),
      },
    );
  };

  // User creation per empresa
  const [userModal, setUserModal] = useState<{ id: string; name: string } | null>(null);
  const [userForm, setUserForm] = useState({ nombre: "", email: "", password: "", confirm: "", rol: "Administrador" as UserRole });
  const [userFormError, setUserFormError] = useState("");

  const openUserModal = (empresa: { id: string; name: string }) => {
    setUserForm({ nombre: "", email: "", password: "", confirm: "", rol: "Administrador" });
    setUserFormError("");
    setUserModal(empresa);
  };

  const handleCreateUser = () => {
    setUserFormError("");
    if (!userForm.nombre.trim()) { setUserFormError("El nombre es obligatorio."); return; }
    if (!userForm.email.trim())  { setUserFormError("El email es obligatorio."); return; }
    if (!userForm.password)      { setUserFormError("La contraseña es obligatoria."); return; }
    if (userForm.password !== userForm.confirm) { setUserFormError("Las contraseñas no coinciden."); return; }
    if (!userModal) return;
    crearUsuario.mutate(
      { nombre: userForm.nombre.trim(), email: userForm.email.trim(), password: userForm.password, rol: userForm.rol, empresaId: userModal.id },
      {
        onSuccess: () => { handleSuccess("Usuario creado correctamente"); setUserModal(null); },
        onError: (err: unknown) => setUserFormError((err as { message?: string })?.message ?? "Error al crear usuario"),
      },
    );
  };

  const openModal = () => {
    setForm({ code: "", name: "", taxId: "", city: "", state: "", address: "", phone: "", email: "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setFormError("");
    if (!form.code.trim()) { setFormError("El código es obligatorio."); return; }
    if (!form.name.trim()) { setFormError("El nombre es obligatorio."); return; }
    if (!form.taxId.trim()) { setFormError("El CUIT / RUT es obligatorio."); return; }
    crearEmpresa.mutate(
      {
        code:    form.code.trim(),
        name:    form.name.trim(),
        taxId:   form.taxId.trim(),
        city:    form.city.trim()    || undefined,
        state:   form.state.trim()   || undefined,
        address: form.address.trim() || undefined,
        phone:   form.phone.trim()   || undefined,
        email:   form.email.trim()   || undefined,
      },
      {
        onSuccess: () => { handleSuccess("Empresa creada correctamente"); setModalOpen(false); },
        onError: (err: unknown) => {
          setFormError((err as { message?: string })?.message ?? "Error al crear la empresa");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={24} /> Empresas
          </h1>
          <p className="text-slate-500">{items.length} empresas registradas</p>
        </div>
        {isSuper && (
          <button onClick={openModal} className="btn btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Nueva Empresa
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>CUIT / RUT</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No se encontraron empresas.</td></tr>
              ) : (
                items.map((e) => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="font-mono text-xs">{e.code}</td>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.taxId ?? "—"}</td>
                    <td>{e.city ?? "—"}</td>
                    <td>{e.phone ?? "—"}</td>
                    <td>{e.email ?? "—"}</td>
                    <td>
                      <span className={`badge ${e.active ? "badge-success" : "badge-secondary"}`}>
                        {e.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      {isSuper && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openLocalModal({ id: e.id, name: e.name })}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Crear local para esta empresa"
                          >
                            <MapPin size={15} />
                          </button>
                          <button
                            onClick={() => openUserModal({ id: e.id, name: e.name })}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Crear usuario para esta empresa"
                          >
                            <UserPlus size={15} />
                          </button>
                          {e.active && (
                            <button
                              onClick={() => setConfirmBajaItem({ id: e.id, name: e.name })}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Dar de baja"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear empresa */}
      <Modal open={modalOpen} title="Nueva Empresa" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: EMP-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Razón social" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CUIT / RUT <span className="text-red-500">*</span></label>
            <input className="input w-full" placeholder="Ej: 30-12345678-9" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
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
            <input className="input w-full" placeholder="Ej: Av. Corrientes 1234" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input className="input w-full" placeholder="Ej: 1145678901" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="input w-full" type="email" placeholder="empresa@mail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={crearEmpresa.isPending}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={crearEmpresa.isPending}>
              {crearEmpresa.isPending ? "Creando..." : "Crear Empresa"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal crear local para empresa */}
      <Modal open={!!localModal} title={`Nuevo Local — ${localModal?.name ?? ""}`} onClose={() => setLocalModal(null)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: SUC-001" value={localForm.code} onChange={(e) => setLocalForm({ ...localForm, code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: Sucursal Centro" value={localForm.name} onChange={(e) => setLocalForm({ ...localForm, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input className="input w-full" placeholder="Ej: Rosario" value={localForm.city} onChange={(e) => setLocalForm({ ...localForm, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
              <input className="input w-full" placeholder="Ej: Santa Fe" value={localForm.state} onChange={(e) => setLocalForm({ ...localForm, state: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input className="input w-full" placeholder="Ej: San Martín 456" value={localForm.address} onChange={(e) => setLocalForm({ ...localForm, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input className="input w-full" placeholder="Ej: 3415678901" value={localForm.phone} onChange={(e) => setLocalForm({ ...localForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="input w-full" type="email" placeholder="local@empresa.com" value={localForm.email} onChange={(e) => setLocalForm({ ...localForm, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
            <input className="input w-full" placeholder="Nombre del encargado" value={localForm.manager} onChange={(e) => setLocalForm({ ...localForm, manager: e.target.value })} />
          </div>
          {localFormError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{localFormError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setLocalModal(null)} disabled={crearLocal.isPending}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleCreateLocal} disabled={crearLocal.isPending}>
              {crearLocal.isPending ? "Creando..." : "Crear Local"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal crear usuario para empresa */}
      <Modal open={!!userModal} title={`Nuevo Usuario — ${userModal?.name ?? ""}`} onClose={() => setUserModal(null)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo <span className="text-red-500">*</span></label>
            <input className="input w-full" placeholder="Ej: Juan Pérez" value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input className="input w-full" type="email" placeholder="usuario@empresa.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol <span className="text-red-500">*</span></label>
            <select className="input w-full" value={userForm.rol} onChange={(e) => setUserForm({ ...userForm, rol: e.target.value as UserRole })}>
              {ROL_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
              <input className="input w-full" type="password" placeholder="Contraseña" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar <span className="text-red-500">*</span></label>
              <input className="input w-full" type="password" placeholder="Repetir contraseña" value={userForm.confirm} onChange={(e) => setUserForm({ ...userForm, confirm: e.target.value })} />
            </div>
          </div>
          {userFormError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{userFormError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setUserModal(null)} disabled={crearUsuario.isPending}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleCreateUser} disabled={crearUsuario.isPending}>
              {crearUsuario.isPending ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja la empresa <strong>{confirmBajaItem?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={updateEmpresa.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={updateEmpresa.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                updateEmpresa.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Empresa dada de baja"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {updateEmpresa.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
