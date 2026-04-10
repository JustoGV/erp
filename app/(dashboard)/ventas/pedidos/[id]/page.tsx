"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, CheckCircle, FileText } from "lucide-react";
import { usePedido, useAprobarPedido } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE:      { class: "badge-warning",   label: "Pendiente" },
  CONFIRMADO:     { class: "badge-info",      label: "Confirmado" },
  EN_PREPARACION: { class: "badge-info",      label: "En preparación" },
  LISTO:          { class: "badge-success",   label: "Listo" },
  ENVIADO:        { class: "badge-info",      label: "Enviado" },
  ENTREGADO:      { class: "badge-success",   label: "Entregado" },
  CANCELADO:      { class: "badge-danger",    label: "Cancelado" },
};

export default function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePedido(id);
  const aprobar = useAprobarPedido();
  const { handleError, handleSuccess } = useApiToast();

  const handleAprobar = async () => {
    try {
      await aprobar.mutateAsync(id);
      handleSuccess("Pedido aprobado", "El pedido pasó a estado CONFIRMADO.");
    } catch (err) {
      handleError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando pedido...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">No se pudo cargar el pedido.</p>
        <Link href="/ventas/pedidos" className="btn btn-secondary">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const p = data.data;
  const est = ESTADO_CONFIG[p.estado] ?? { class: "badge-secondary", label: p.estado };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/ventas/pedidos"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={28} /> {p.numero}
            </h1>
            <span className={`badge text-sm ${est.class}`}>{est.label}</span>
          </div>
          <p className="text-slate-500 mt-1">
            {new Date(p.fecha).toLocaleDateString("es-AR", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {p.estado === "PENDIENTE" && (
            <button
              onClick={handleAprobar}
              disabled={aprobar.isPending}
              className="btn btn-primary"
            >
              <CheckCircle size={16} />
              {aprobar.isPending ? "Aprobando..." : "Aprobar pedido"}
            </button>
          )}
          {p.factura && (
            <Link
              href={`/ventas/facturas/${p.factura.id}`}
              className="btn btn-secondary"
            >
              <FileText size={16} /> Ver factura
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ítems */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ítems del pedido</h3>
            </div>
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="w-20">Cant.</th>
                    <th className="w-20">Entregado</th>
                    <th className="w-28">Precio unit.</th>
                    <th className="w-20">Dto. %</th>
                    <th className="w-28 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(p.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-medium">{item.productoNombre}</div>
                        {item.producto && (
                          <div className="text-xs text-slate-400">
                            {item.producto.code} · {item.producto.unit}
                          </div>
                        )}
                      </td>
                      <td className="text-center">{item.cantidad}</td>
                      <td className="text-center">
                        <span className={item.cantidadEntregada >= item.cantidad ? "text-emerald-600 font-medium" : "text-slate-500"}>
                          {item.cantidadEntregada}
                        </span>
                      </td>
                      <td>${item.precioUnitario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">{item.descuento > 0 ? `${item.descuento}%` : "—"}</td>
                      <td className="text-right font-semibold">
                        ${item.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  {p.descuento > 0 && (
                    <tr>
                      <td colSpan={5} className="text-right text-slate-600 py-2 px-6">Descuento:</td>
                      <td className="text-right text-red-600 font-medium px-6">
                        -${p.descuento.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {p.impuestos > 0 && (
                    <tr>
                      <td colSpan={5} className="text-right text-slate-600 py-2 px-6">Impuestos:</td>
                      <td className="text-right text-slate-700 font-medium px-6">
                        ${p.impuestos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={5} className="text-right font-bold text-slate-800 py-3 px-6">Total:</td>
                    <td className="text-right font-bold text-slate-900 text-base px-6">
                      ${p.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notas */}
          {p.notas && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Notas</h3>
              </div>
              <p className="text-slate-600 text-sm">{p.notas}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cliente */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cliente</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">{p.cliente?.name ?? "—"}</p>
              <p className="text-slate-500">{p.cliente?.code}</p>
            </div>
          </div>

          {/* Fechas */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Fechas</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Emisión</span>
                <span className="font-medium">{new Date(p.fecha).toLocaleDateString("es-AR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entrega est.</span>
                <span className="font-medium">
                  {p.fechaEntregaEstimada
                    ? new Date(p.fechaEntregaEstimada).toLocaleDateString("es-AR")
                    : "—"}
                </span>
              </div>
              {p.fechaEntregaReal && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrega real</span>
                  <span className="font-medium text-emerald-600">
                    {new Date(p.fechaEntregaReal).toLocaleDateString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vendedor */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Vendedor</h3>
            </div>
            <p className="text-sm font-medium text-slate-900">{p.vendedor ?? "—"}</p>
          </div>

          {/* Origen */}
          {p.presupuesto && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Presupuesto origen</h3>
              </div>
              <Link
                href={`/ventas/presupuestos`}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                {p.presupuesto.numero}
              </Link>
            </div>
          )}

          {/* Factura */}
          {p.factura && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Factura asociada</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{p.factura.numero}</span>
                <Link
                  href={`/ventas/facturas/${p.factura.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver factura →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
