"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useCrearFacturaDesdePedido, usePedidos } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import { useLocal } from "@/contexts/LocalContext";

export default function NuevaFacturaPage() {
  const router = useRouter();
  const { selectedLocal, isAllLocales } = useLocal();
  const { handleError, handleSuccess } = useApiToast();
  const crearFactura = useCrearFacturaDesdePedido();

  const [pedidoId, setPedidoId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [notas, setNotas] = useState("");

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  // Cargar pedidos CONFIRMADOS y LISTO (listos para facturar)
  const { data: pedidosData } = usePedidos({ localId, limit: 100 });
  const pedidosFaturables = (pedidosData?.data ?? []).filter(
    (p) => p.estado === "CONFIRMADO" || p.estado === "LISTO" || p.estado === "EN_PREPARACION",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pedidoId) {
      handleError(new Error("Selecciona un pedido."));
      return;
    }

    try {
      await crearFactura.mutateAsync({
        pedidoId,
        fechaVencimiento: fechaVencimiento || undefined,
        notas: notas || undefined,
      });
      handleSuccess("Factura generada", "La factura fue creada desde el pedido.");
      router.push("/ventas/facturas");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/ventas/facturas"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nueva Factura</h1>
          <p className="text-slate-600 mt-1">Genera una factura desde un pedido aprobado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h3 className="card-title">Datos de la Factura</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">Pedido *</label>
              <select
                value={pedidoId}
                onChange={(e) => setPedidoId(e.target.value)}
                required
                className="input"
              >
                <option value="">— Seleccionar pedido —</option>
                {pedidosFaturables.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numero} — {p.cliente?.name ?? "Sin cliente"} — $
                    {p.total?.toLocaleString()} ({p.estado})
                  </option>
                ))}
              </select>
              {pedidosFaturables.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  No hay pedidos aprobados disponibles para facturar.
                </p>
              )}
            </div>

            <div>
              <label className="label">Fecha de Vencimiento</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Notas</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="input"
                placeholder="Observaciones opcionales..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={crearFactura.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {crearFactura.isPending ? "Generando..." : "Generar Factura"}
          </button>
          <Link href="/ventas/facturas" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
