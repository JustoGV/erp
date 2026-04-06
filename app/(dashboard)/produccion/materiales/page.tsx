"use client";

import { useState } from "react";
import { Boxes, Plus, Ban, FileUp } from "lucide-react";
import {
  useMaterialesProduccion,
  useCrearMaterial,
  useActualizarMaterial,
} from "@/hooks/useProduccion";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";
import { usePermissions } from "@/hooks/usePermissions";
import Modal from "@/components/Modal";
import ImportExcelModal from "@/components/ImportExcelModal";
import type { TipoProducto } from "@/lib/api-types";

const TIPOS: TipoProducto[] = ["MATERIA_PRIMA", "INSUMO", "TERMINADO", "SEMI_TERMINADO"];
const TIPO_LABELS: Record<TipoProducto, string> = {
  MATERIA_PRIMA: "Materia Prima",
  INSUMO: "Insumo",
  TERMINADO: "Terminado",
  SEMI_TERMINADO: "Semi Terminado",
};

export default function MaterialesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const { isAdmin } = usePermissions();

  const { data, isLoading } = useMaterialesProduccion();
  const materiales = (data?.data ?? []).filter((m) => m.active !== false);

  const crear = useCrearMaterial();
  const actualizar = useActualizarMaterial();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmBajaItem, setConfirmBajaItem] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", nombre: "", tipo: "MATERIA_PRIMA" as TipoProducto,
    unidad: "", stockActual: "", stockMinimo: "", stockMaximo: "", costoUnitario: "",
  });
  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) { handleError(new Error("Seleccioná un local.")); return; }
    try {
      await crear.mutateAsync({
        localId,
        dto: {
          code: form.code,
          nombre: form.nombre,
          tipo: form.tipo,
          unidad: form.unidad,
          stockActual:   form.stockActual   ? Number(form.stockActual)   : undefined,
          stockMinimo:   form.stockMinimo   ? Number(form.stockMinimo)   : undefined,
          stockMaximo:   form.stockMaximo   ? Number(form.stockMaximo)   : undefined,
          costoUnitario: form.costoUnitario ? Number(form.costoUnitario) : undefined,
        },
      });
      handleSuccess("Material creado", "El material fue registrado.");
      setModalOpen(false);
      setForm({ code: "", nombre: "", tipo: "MATERIA_PRIMA", unidad: "", stockActual: "", stockMinimo: "", stockMaximo: "", costoUnitario: "" });
    } catch (err) {
      handleError(err);
    }
  };

  const fmt = (n?: number) =>
    n != null ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes size={24} /> Materiales de Producción
          </h1>
          <p className="text-slate-500">{materiales.length} materiales registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setImportOpen(true)} className="btn btn-sm flex items-center gap-1.5">
              <FileUp size={16} /> Importar
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Nuevo Material
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th className="text-right">Stock Actual</th>
                <th className="text-right">Stock Mín.</th>
                <th className="text-right">Stock Máx.</th>
                <th className="text-right">Costo Unit.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-10">Cargando...</td></tr>
              ) : materiales.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">No se encontraron materiales.</td></tr>
              ) : materiales.map((m) => {
                const bajo = (m.stockActual ?? 0) <= (m.stockMinimo ?? 0) && (m.stockMinimo ?? 0) > 0;
                return (
                  <tr key={m.id} className="table-row-hover">
                    <td className="font-mono text-xs">{m.code}</td>
                    <td className="font-medium">{m.nombre}</td>
                    <td><span className="badge badge-secondary">{TIPO_LABELS[m.tipo] ?? m.tipo}</span></td>
                    <td>{m.unidad}</td>
                    <td className={`text-right font-semibold ${bajo ? "text-red-600" : "text-slate-900"}`}>
                      {m.stockActual ?? 0}
                      {bajo && <span className="ml-1 text-xs text-red-400">▼</span>}
                    </td>
                    <td className="text-right">{m.stockMinimo ?? 0}</td>
                    <td className="text-right">{m.stockMaximo ?? 0}</td>
                    <td className="text-right">{fmt(m.costoUnitario)}</td>
                    <td>
                      {isAdmin && (
                        <button
                          onClick={() => setConfirmBajaItem({ id: m.id, name: m.nombre })}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Dar de baja"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Nuevo Material de Producción" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Código *</label>
              <input type="text" className="input" required placeholder="MAT-001"
                value={form.code} onChange={e => setField("code", e.target.value)} />
            </div>
            <div>
              <label className="label">Nombre *</label>
              <input type="text" className="input" required placeholder="Nombre del material"
                value={form.nombre} onChange={e => setField("nombre", e.target.value)} />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select className="input" required value={form.tipo} onChange={e => setField("tipo", e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unidad *</label>
              <input type="text" className="input" required placeholder="kg, UNI, L..."
                value={form.unidad} onChange={e => setField("unidad", e.target.value)} />
            </div>
            <div>
              <label className="label">Stock Inicial</label>
              <input type="number" className="input" placeholder="0" min="0" step="0.001"
                value={form.stockActual} onChange={e => setField("stockActual", e.target.value)} />
            </div>
            <div>
              <label className="label">Stock Mínimo</label>
              <input type="number" className="input" placeholder="0" min="0" step="0.001"
                value={form.stockMinimo} onChange={e => setField("stockMinimo", e.target.value)} />
            </div>
            <div>
              <label className="label">Stock Máximo</label>
              <input type="number" className="input" placeholder="0" min="0" step="0.001"
                value={form.stockMaximo} onChange={e => setField("stockMaximo", e.target.value)} />
            </div>
            <div>
              <label className="label">Costo Unitario</label>
              <input type="number" className="input" placeholder="0.00" min="0" step="0.01"
                value={form.costoUnitario} onChange={e => setField("costoUnitario", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={crear.isPending}>
              {crear.isPending ? "Guardando..." : "Crear Material"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dar de Baja */}
      <Modal open={!!confirmBajaItem} title="Dar de baja" onClose={() => setConfirmBajaItem(null)}>
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Dar de baja el material <strong>{confirmBajaItem?.name}</strong>? Dejará de aparecer en los listados.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmBajaItem(null)} disabled={actualizar.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actualizar.isPending}
              onClick={() => {
                if (!confirmBajaItem) return;
                actualizar.mutate(
                  { id: confirmBajaItem.id, dto: { active: false } },
                  {
                    onSuccess: () => { handleSuccess("Material dado de baja correctamente"); setConfirmBajaItem(null); },
                    onError: () => setConfirmBajaItem(null),
                  },
                );
              }}
            >
              {actualizar.isPending ? "Procesando..." : "Dar de baja"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Material"
        templateFileName="plantilla_materiales.xlsx"
        columns={[
          { key: "code",         label: "Código",      required: true,  type: "string", example: "MAT-001" },
          { key: "nombre",       label: "Nombre",      required: true,  type: "string", example: "Acero SAE 1020" },
          { key: "tipo",         label: "Tipo",        required: true,  type: "string", example: "MATERIA_PRIMA" },
          { key: "unidad",       label: "Unidad",      required: true,  type: "string", example: "kg" },
          { key: "stockActual",  label: "Stock Actual", required: false, type: "number", example: "100" },
          { key: "stockMinimo",  label: "Stock Mínimo", required: false, type: "number", example: "20" },
          { key: "costoUnitario", label: "Costo Unitario", required: false, type: "number", example: "500" },
        ]}
        onImport={async (rows) => {
          if (!localId) throw new Error("Seleccioná un local primero");
          await new Promise<void>((resolve, reject) => {
            crear.mutate(
              { dto: rows[0] as unknown as Parameters<typeof crear.mutate>[0]["dto"], localId },
              { onSuccess: () => resolve(), onError: reject },
            );
          });
        }}
      />
    </div>
  );
}
