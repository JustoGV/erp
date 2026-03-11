"use client";

import Link from "next/link";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  Factory,
} from "lucide-react";
import { useDashboardKPIs } from "@/hooks/useReportes";

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-5 ${color} text-white`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-1">{sub}</p>}
    </div>
  );
}

const REPORTES = [
  {
    href: "/reportes/ventas",
    icon: BarChart3,
    title: "Ventas",
    description:
      "Facturas por período, cliente o local. Con exportación a Excel.",
    color: "bg-blue-500",
  },
  {
    href: "/reportes/compras",
    icon: ShoppingCart,
    title: "Compras",
    description: "Órdenes de compra por período y proveedor.",
    color: "bg-orange-500",
  },
  {
    href: "/reportes/inventario",
    icon: Package,
    title: "Inventario",
    description:
      "Stock valorizado con alertas de stock mínimo. Con exportación a Excel.",
    color: "bg-purple-500",
  },
  {
    href: "/reportes/rrhh",
    icon: Users,
    title: "Recursos Humanos",
    description: "Nómina y liquidaciones de sueldos. Con exportación a Excel.",
    color: "bg-green-500",
  },
  {
    href: "/reportes/resultados",
    icon: TrendingUp,
    title: "Estado de Resultados",
    description: "Ingresos, egresos y resultado neto por período.",
    color: "bg-indigo-500",
  },
];

export default function ReportesPage() {
  const { data: kpisData, isLoading } = useDashboardKPIs();
  const kpis = kpisData?.data;

  const fmt = (n?: number) =>
    n != null
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reportes y Analítica</h1>
        <p className="text-gray-600 mt-1">
          Panel ejecutivo y reportes detallados por módulo
        </p>
      </div>

      {/* KPIs del mes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">KPIs del mes en curso</h2>
        {isLoading ? (
          <div className="text-gray-400">Cargando KPIs...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
              label="Ventas del mes"
              value={fmt(kpis?.ventasMes.total)}
              sub={`${kpis?.ventasMes.cantidad ?? "—"} facturas`}
              color="bg-blue-600"
            />
            <KpiCard
              label="Compras del mes"
              value={fmt(kpis?.comprasMes.total)}
              sub={`${kpis?.comprasMes.cantidad ?? "—"} órdenes`}
              color="bg-orange-500"
            />
            <KpiCard
              label="Stock en alerta"
              value={kpis?.stockAlertas ?? "—"}
              sub="productos"
              color={kpis?.stockAlertas ? "bg-red-500" : "bg-gray-500"}
            />
            <KpiCard
              label="Órdenes producción"
              value={kpis?.ordenesProdPendientes ?? "—"}
              sub="pendientes"
              color="bg-indigo-500"
            />
            <KpiCard
              label="Empleados activos"
              value={kpis?.empleadosActivos ?? "—"}
              color="bg-green-600"
            />
            <KpiCard
              label="CxC vencidas"
              value={kpis?.cxcVencidas ?? "—"}
              sub="cuentas"
              color={kpis?.cxcVencidas ? "bg-rose-600" : "bg-gray-500"}
            />
          </div>
        )}
      </section>

      {/* Reportes disponibles */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Reportes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORTES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${r.color} text-white rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-600">{r.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
