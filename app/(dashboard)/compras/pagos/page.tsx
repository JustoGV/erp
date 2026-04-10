"use client";

import { useMemo, useState } from "react";
import { Banknote, Plus } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  usePagosProveedor,
  useRegistrarPagoProveedor,
  useProveedores,
} from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import { useApiToast } from "@/hooks/useApiToast";

const METODOS = ["TRANSFERENCIA", "CHEQUE", "EFECTIVO", "DEPOSITO", "OTRO"];

export default function PagosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = usePagosProveedor({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // Proveedores para mostrar nombres y para el formulario
  const { data: proveedoresData } = useProveedores({ localId, limit: 100 });
  const proveedores = proveedoresData?.data ?? [];
  const proveedorMap = useMemo(
    () => Object.fromEntries(proveedores.map(p => [p.id, p.name])),
    [proveedores],
  );

  const registrar = useRegistrarPagoProveedor();
  const defaultForm = { proveedorId: "", monto: "", metodoPago: "TRANSFERENCIA", fecha: "", referencia: "", notas: "" };
  const [form, setForm] = useState(defaultForm);
  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.proveedorId) { handleError(new Error("Seleccioná un proveedor.")); return; }
    if (!form.monto || Number(form.monto) <= 0) { handleError(new Error("El monto debe ser mayor a 0.")); return; }
    try {
      await registrar.mutateAsync({
        proveedorId: form.proveedorId,
        monto: Number(form.monto),
        metodoPago: form.metodoPago,
        fecha: form.fecha || undefined,
        referencia: form.referencia || undefined,
        notas: form.notas || undefined,
      });
      handleSuccess("Pago registrado", "El pago al proveedor fue guardado.");
      setModalOpen(false);
      setForm(defaultForm);
    } catch (err) {
      handleError(err);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote size={24} /> Pagos a Proveedores
          </h1>
          <p className="text-slate-500">{total} pagos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nuevo Pago
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th className="text-right">Monto</th>
                <th>Método</th>
                <th>Referencia</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron pagos.</td></tr>
              ) : items.map((p) => (
                <tr key={p.id} className="table-row-hover">
                  <td className="font-medium">{proveedorMap[p.proveedorId] ?? p.proveedorId.slice(0, 8) + "…"}</td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="text-right font-semibold">{fmt(p.monto)}</td>
                  <td><span className="badge badge-secondary">{p.metodoPago}</span></td>
                  <td>{p.referencia ?? "—"}</td>
                  <td className="text-slate-500 text-sm">{p.notas ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Registrar Pago a Proveedor" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Proveedor *</label>
            <select className="input" required value={form.proveedorId} onChange={e => setField("proveedorId", e.target.value)}>
              <option value="">— Seleccionar —</option>
              {proveedores.filter(p => p.active).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monto *</label>
            <input type="number" className="input" required placeholder="45000.00" min="0.01" step="0.01"
              value={form.monto} onChange={e => setField("monto", e.target.value)} />
          </div>
          <div>
            <label className="label">Método de Pago *</label>
            <select className="input" required value={form.metodoPago} onChange={e => setField("metodoPago", e.target.value)}>
              {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fecha</label>
            <input type="date" className="input"
              value={form.fecha} onChange={e => setField("fecha", e.target.value)} />
          </div>
          <div>
            <label className="label">Referencia</label>
            <input type="text" className="input" placeholder="CBU, Nº cheque, etc."
              value={form.referencia} onChange={e => setField("referencia", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notas</label>
            <input type="text" className="input" placeholder="Ej: Pago factura OC-000001"
              value={form.notas} onChange={e => setField("notas", e.target.value)} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={registrar.isPending}>
              {registrar.isPending ? "Guardando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

