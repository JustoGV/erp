"use client";

import { useMemo, useState } from "react";
import { Users, Plus, Eye, Ban, FileUp } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useEmpleados, useCrearEmpleado, useActualizarEmpleado } from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import Pagination from "@/components/Pagination";
import EntitySearchBar from "@/components/EntitySearchBar";

export default function EmpleadosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [ingresoFilter, setIngresoFilter] = useState("");
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const actualizarEmpleado = useActualizarEmpleado();
  const crearEmpleado = useCrearEmpleado();

  const { data, isLoading } = useEmpleados({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const empleados = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const displayEmpleados = useMemo(() => {
    let result = empleados;
    if (activeFilter) result = result.filter((e) => e.active === (activeFilter === "true"));
    if (ingresoFilter) result = result.filter((e) => new Date(e.hireDate).toISOString().slice(0, 10) === ingresoFilter);
    return result;
  }, [empleados, activeFilter, ingresoFilter]);

  const handleSearch = (key: string, value: string) => {
    if (key === "estado") { setActiveFilter(value as "" | "true" | "false"); }
    else if (key === "ingreso") { setIngresoFilter(value); }
    else { setSearch(value); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} /> Empleados
          </h1>
          <p className="text-slate-500">{total} empleados registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          <Link href="/rrhh/empleados/nuevo" className="btn btn-primary">
            <Plus size={18} /> Nuevo Empleado
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "nombre",       label: "Nombre",       type: "text" },
              { key: "codigo",       label: "Código",       type: "text" },
              { key: "cargo",        label: "Cargo",        type: "text" },
              { key: "departamento", label: "Departamento", type: "text" },
              { key: "ingreso",      label: "Ingreso",      type: "date" },
              { key: "estado",       label: "Estado",       type: "boolean" },
            ]}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-20 !text-left">Código</th>
                <th className="!text-left">Nombre</th>
                <th className="w-36 !text-left">Cargo</th>
                <th className="w-36 !text-left">Departamento</th>
                <th className="w-28">Ingreso</th>
                <th className="w-20">Estado</th>
                <th className="w-14">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                displayEmpleados.map((e) => (
                  <tr key={e.id} className="table-row-hover text-xs">
                    <td className="font-mono !text-left">{e.code}</td>
                    <td className="!text-left"><div className="font-medium max-w-[200px] truncate">{e.name}</div></td>
                    <td className="!text-left"><div className="max-w-[130px] truncate text-slate-600">{e.position}</div></td>
                    <td className="!text-left"><div className="max-w-[130px] truncate text-slate-600">{e.department}</div></td>
                    <td className="text-slate-600">{new Date(e.hireDate).toLocaleDateString("es-AR")}</td>
                    <td>
                      <span
                        className={`badge ${e.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {e.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/rrhh/empleados/${e.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={13} /> Ver
                        </Link>
                        {isAdmin && e.active && (
                          <button
                            onClick={() => setConfirmBajaItem({ id: e.id, name: e.name })}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Dar de baja"
                          >
                            <Ban size={13} />
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
            ¿Dar de baja al empleado <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={actualizarEmpleado.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actualizarEmpleado.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                actualizarEmpleado.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Empleado dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {actualizarEmpleado.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Empleado"
        templateFileName="plantilla_empleados.xlsx"
        columns={[
          { key: "code",       label: "Código",      required: true,  type: "string", example: "EMP-001" },
          { key: "name",       label: "Nombre",      required: true,  type: "string", example: "María López" },
          { key: "position",   label: "Cargo",       required: true,  type: "string", example: "Vendedor" },
          { key: "department", label: "Departamento", required: true,  type: "string", example: "Ventas" },
          { key: "salary",     label: "Salario",     required: true,  type: "number", example: "150000" },
          { key: "hireDate",   label: "Fecha Ingreso", required: true, type: "date",   example: "2024-01-15" },
          { key: "email",      label: "Email",       required: false, type: "string", example: "maria@empresa.com" },
          { key: "phone",      label: "Teléfono",    required: false, type: "string", example: "1156789012" },
        ]}
        onImport={async (rows) => {
          if (!localId) throw new Error("Seleccioná un local primero");
          await new Promise<void>((resolve, reject) => {
            crearEmpleado.mutate(
              { dto: rows[0] as unknown as Parameters<typeof crearEmpleado.mutate>[0]["dto"], localId },
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
