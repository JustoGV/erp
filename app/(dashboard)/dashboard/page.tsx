"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useDashboardKPIs } from "@/hooks/useReportes";
import { useFacturas } from "@/hooks/useVentas";
import { useAlertasStock } from "@/hooks/useInventario";
import { useOrdenesCompra } from "@/hooks/useCompras";

export default function DashboardPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: kpisData, isLoading: loadingKpis } = useDashboardKPIs(localId);
  const { data: facturasData, isLoading: loadingFacturas } = useFacturas({ localId, limit: 4 });
  const { data: alertas, isLoading: loadingAlertas } = useAlertasStock(localId);
  const { data: ordenesData } = useOrdenesCompra({ localId, limit: 100 });

  const kpis = kpisData?.data;
  const facturas = facturasData?.data ?? [];
  const alertasList = alertas ?? [];
  const isLoading = loadingKpis;

  // Calcular compras del mes actual (mes calendario) desde las órdenes reales
  const now = new Date();
  const mesActual = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const ordenesMes = (ordenesData?.data ?? []).filter(
    (o) => (o.createdAt ?? "").startsWith(mesActual) && o.estado !== "CANCELADA"
  );
  const comprasMesTotal = ordenesMes.reduce((acc, o) => acc + (parseFloat(String(o.total ?? 0))), 0);
  const comprasMesCantidad = ordenesMes.length;

  const localName = isAllLocales ? "Todos los locales" : selectedLocal?.name || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={16} />
              <span className="font-medium">{localName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ventas del Mes"
            value={`$${(kpis?.ventasMes?.total ?? 0).toLocaleString()}`}
            subtitle={`${kpis?.ventasMes?.cantidad ?? 0} facturas`}
            icon={<DollarSign size={24} />}
            gradient="from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Compras del Mes"
            value={`$${comprasMesTotal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${comprasMesCantidad} órdenes`}
            icon={<ShoppingCart size={24} />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Alertas de Stock"
            value={(kpis?.stockAlertas ?? 0).toString()}
            subtitle={`${kpis?.ordenesProdPendientes ?? 0} órdenes prod. pendientes`}
            icon={<Package size={24} />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Empleados Activos"
            value={(kpis?.empleadosActivos ?? 0).toString()}
            subtitle={`${kpis?.cxcVencidas ?? 0} CxC vencidas`}
            icon={<Users size={24} />}
            gradient="from-orange-500 to-orange-600"
          />
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Facturas Recientes</h3>
            <a href="/ventas/facturas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todas <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th className="text-right">Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loadingFacturas ? (
                  <tr><td colSpan={4} className="text-center py-10">Cargando...</td></tr>
                ) : facturas.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">Sin facturas recientes.</td></tr>
                ) : (
                  facturas.slice(0, 4).map((f) => (
                    <tr key={f.id} className="table-row-hover">
                      <td className="font-mono text-xs">{f.numero}</td>
                      <td className="font-medium">{f.cliente?.name ?? "—"}</td>
                      <td className="text-right font-semibold">${f.total?.toLocaleString()}</td>
                      <td><FacturaEstado estado={f.estado} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alertas de Stock</h3>
            {alertasList.length > 0 && <span className="badge badge-danger">{alertasList.length}</span>}
          </div>
          <div className="space-y-3">
            {loadingAlertas ? (
              <p className="text-center py-10 text-slate-400">Cargando...</p>
            ) : alertasList.length === 0 ? (
              <p className="text-center py-10 text-slate-400">Sin alertas de stock.</p>
            ) : (
              alertasList.slice(0, 5).map((a, i) => {
                const esCritico = a.criticidad === "CRITICO";
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${esCritico ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className={`p-2 rounded-lg ${esCritico ? "bg-red-100" : "bg-amber-100"}`}>
                      <AlertTriangle size={18} className={esCritico ? "text-red-500" : "text-amber-500"} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${esCritico ? "text-red-800" : "text-amber-800"}`}>
                        {a.productoNombre ?? "—"}
                        <span className={`ml-2 text-xs font-normal px-1.5 py-0.5 rounded ${esCritico ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                          {a.criticidad}
                        </span>
                      </p>
                      <p className={`text-xs ${esCritico ? "text-red-600" : "text-amber-600"}`}>
                        {a.localNombre ?? "—"} — Stock: {a.stockActual} {a.unidad} / Mín: {a.stockMinimo}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, gradient }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300`} />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`stat-icon bg-gradient-to-br ${gradient} text-white shadow-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function FacturaEstado({ estado }: { estado: string }) {
  const config: Record<string, { class: string; label: string }> = {
    PENDIENTE: { class: "badge-warning", label: "Pendiente" },
    PARCIAL: { class: "badge-info", label: "Parcial" },
    PAGADA: { class: "badge-success", label: "Pagada" },
    VENCIDA: { class: "badge-danger", label: "Vencida" },
    ANULADA: { class: "badge-secondary", label: "Anulada" },
  };
  const c = config[estado] ?? { class: "badge-secondary", label: estado };
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}
