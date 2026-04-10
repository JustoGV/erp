"use client";

import { useState } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import {
  useBOMs,
  useCrearBOM,
  useMaterialesProduccion,
} from "@/hooks/useProduccion";
import { useProductos } from "@/hooks/useInventario";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";
import Modal from "@/components/Modal";
import type { BomItemDto } from "@/lib/types/produccion";

const BOM_ITEM_EMPTY: BomItemDto = { materialId: "", cantidad: 0, unidad: "" };

export default function BOMPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();

  const { data, isLoading } = useBOMs();
  const boms = data?.data ?? [];

  const { data: materialesData } = useMaterialesProduccion();
  const materiales = materialesData?.data ?? [];

  const { data: productosData } = useProductos({ limit: 100 });
  const productos = productosData?.data ?? [];

  const crear = useCrearBOM();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", productoId: "", cantidad: "", unidad: "UNI", version: "1" });
  const [items, setItems] = useState<BomItemDto[]>([{ ...BOM_ITEM_EMPTY }]);
  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const setItem = (i: number, f: keyof BomItemDto, v: string) =>
    setItems(p => p.map((item, idx) => idx !== i ? item : {
      ...item,
      [f]: f === "cantidad" ? Number(v) : v,
    }));
  const addItem = () => setItems(p => [...p, { ...BOM_ITEM_EMPTY }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) { handleError(new Error("Seleccioná un local.")); return; }
    if (items.some(it => !it.materialId || it.cantidad <= 0)) {
      handleError(new Error("Completá el material y cantidad de cada ítem."));
      return;
    }
    try {
      await crear.mutateAsync({
        localId,
        dto: {
          code: form.code,
          productoId: form.productoId,
          cantidad: Number(form.cantidad),
          unidad: form.unidad,
          version: form.version ? Number(form.version) : undefined,
          items,
        },
      });
      handleSuccess("BOM creado", "La lista de materiales fue registrada.");
      setModalOpen(false);
      setForm({ code: "", productoId: "", cantidad: "", unidad: "UNI", version: "1" });
      setItems([{ ...BOM_ITEM_EMPTY }]);
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
            <Layers size={24} /> Lista de Materiales (BOM)
          </h1>
          <p className="text-slate-500">{boms.length} BOMs registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nuevo BOM
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto Terminado</th>
                <th className="text-right">Cant./Lote</th>
                <th>Unidad</th>
                <th className="text-right">Costo</th>
                <th className="text-center"># Materiales</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : boms.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron BOMs.</td></tr>
              ) : boms.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="font-mono text-xs">{b.code}</td>
                  <td className="font-medium">{b.productoNombre ?? b.producto?.name ?? "—"}</td>
                  <td className="text-right">{b.cantidad}</td>
                  <td>{b.unidad}</td>
                  <td className="text-right">{fmt(b.costoTotal ?? b.costoEstimado)}</td>
                  <td className="text-center">{b._count?.materiales ?? b.materiales?.length ?? 0}</td>
                  <td>
                    <span className={`badge ${b.activo ? "badge-success" : "badge-secondary"}`}>
                      {b.activo ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Nuevo BOM" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Código *</label>
              <input type="text" className="input" required placeholder="BOM-PROD-001"
                value={form.code} onChange={e => setField("code", e.target.value)} />
            </div>
            <div>
              <label className="label">Versión</label>
              <input type="number" className="input" placeholder="1" min="1"
                value={form.version} onChange={e => setField("version", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Producto Terminado *</label>
              <select className="input" required value={form.productoId} onChange={e => setField("productoId", e.target.value)}>
                <option value="">— Seleccionar —</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cantidad por Lote *</label>
              <input type="number" className="input" required placeholder="1" min="0.001" step="0.001"
                value={form.cantidad} onChange={e => setField("cantidad", e.target.value)} />
            </div>
            <div>
              <label className="label">Unidad *</label>
              <input type="text" className="input" required placeholder="UNI"
                value={form.unidad} onChange={e => setField("unidad", e.target.value)} />
            </div>
          </div>

          {/* Materiales del BOM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Materiales *</span>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-900 flex items-center gap-1">
                <Plus size={14} /> Agregar material
              </button>
            </div>
            <div className="grid grid-cols-12 gap-2 mb-1 px-1 text-xs font-medium text-slate-500">
              <span className="col-span-6">Material *</span>
              <span className="col-span-3">Cantidad *</span>
              <span className="col-span-2">Unidad</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select className="input text-sm" required value={item.materialId}
                      onChange={e => setItem(i, "materialId", e.target.value)}>
                      <option value="">— Seleccionar —</option>
                      {materiales.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} ({m.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input type="number" className="input text-sm" placeholder="0" min="0.0001" step="0.0001"
                      value={item.cantidad || ""} onChange={e => setItem(i, "cantidad", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" className="input text-sm" placeholder="UNI"
                      value={item.unidad || ""} onChange={e => setItem(i, "unidad", e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={crear.isPending}>
              {crear.isPending ? "Guardando..." : "Crear BOM"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
