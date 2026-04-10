"use client";

import Link from "next/link";
import {
  DollarSign,
  BookOpen,
  FileText,
  TrendingUp,
  Receipt,
  CreditCard,
  Landmark,
  Wallet,
  Stamp,
} from "lucide-react";
import {
  usePlanCuentas,
  useAsientos,
  useResumenCxC,
  useResumenCxP,
  useCuentasBancarias,
  useRetenciones,
} from "@/hooks/useFinanzas";

export default function FinanzasResumenPage() {
  const { data: planData } = usePlanCuentas();
  const { data: asientosData } = useAsientos({ limit: 1 });
  const { data: resumenCxC } = useResumenCxC();
  const { data: resumenCxP } = useResumenCxP();
  const { data: bancosData } = useCuentasBancarias();
  const { data: retencionesData } = useRetenciones({ limit: 1 });

  const totalCuentas = planData?.data?.length ?? "—";
  const totalAsientos = asientosData?.meta?.total ?? "—";
  const totalCobrar =
    resumenCxC?.data?.totalPendiente != null
      ? `$${resumenCxC.data.totalPendiente.toLocaleString()}`
      : "—";
  const totalPagar =
    resumenCxP?.data?.totalPendiente != null
      ? `$${resumenCxP.data.totalPendiente.toLocaleString()}`
      : "—";
  const totalCuentasBancarias = bancosData?.data?.length ?? "—";
  const totalRetenciones = retencionesData?.meta?.total ?? "—";

  const menuItems = [
    {
      href: "/finanzas/plan-cuentas",
      icon: BookOpen,
      title: "Plan de Cuentas",
      description: "Estructura contable de la empresa",
      color: "bg-blue-500",
      stats: `${totalCuentas} cuentas`,
    },
    {
      href: "/finanzas/asientos",
      icon: FileText,
      title: "Asientos Contables",
      description: "Registro de operaciones contables",
      color: "bg-purple-500",
      stats: `${totalAsientos} asientos`,
    },
    {
      href: "/finanzas/balance",
      icon: TrendingUp,
      title: "Balance General",
      description: "Estado de situación patrimonial",
      color: "bg-green-500",
      stats: "Ver balance",
    },
    {
      href: "/finanzas/resultados",
      icon: Receipt,
      title: "Estado de Resultados",
      description: "Ganancias y pérdidas del período",
      color: "bg-orange-500",
      stats: "Ver resultados",
    },
    {
      href: "/finanzas/cuentas-cobrar",
      icon: DollarSign,
      title: "Cuentas por Cobrar",
      description: "Gestión de créditos a clientes",
      color: "bg-emerald-500",
      stats: totalCobrar,
    },
    {
      href: "/finanzas/cuentas-pagar",
      icon: CreditCard,
      title: "Cuentas por Pagar",
      description: "Gestión de deudas con proveedores",
      color: "bg-red-500",
      stats: totalPagar,
    },
    {
      href: "/finanzas/bancos",
      icon: Landmark,
      title: "Bancos",
      description: "Cuentas bancarias y movimientos",
      color: "bg-indigo-500",
      stats: `${totalCuentasBancarias} cuentas`,
    },
    {
      href: "/finanzas/caja",
      icon: Wallet,
      title: "Caja",
      description: "Gestión de efectivo por local",
      color: "bg-teal-500",
      stats: "Ver caja",
    },
    {
      href: "/finanzas/retenciones",
      icon: Stamp,
      title: "Retenciones",
      description: "Impositivas: IVA, Ganancias, IIBB",
      color: "bg-amber-500",
      stats: `${totalRetenciones} registradas`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Finanzas</h1>
        <p className="text-gray-600 mt-1">Contabilidad y gestión financiera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-green-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${item.color} text-white rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.stats}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <DollarSign className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Contabilidad en Tiempo Real
            </h3>
            <p className="text-sm text-green-700">
              El módulo financiero registra automáticamente todas las
              operaciones del sistema, generando balances y estados financieros
              actualizados al instante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
