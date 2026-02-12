'use client';

import Link from 'next/link';
import { DollarSign, BookOpen, FileText, TrendingUp, Receipt, CreditCard } from 'lucide-react';

export default function FinanzasResumenPage() {
  const menuItems = [
    {
      href: '/finanzas/plan-cuentas',
      icon: BookOpen,
      title: 'Plan de Cuentas',
      description: 'Estructura contable de la empresa',
      color: 'bg-blue-500',
      stats: '150 cuentas'
    },
    {
      href: '/finanzas/asientos',
      icon: FileText,
      title: 'Asientos Contables',
      description: 'Registro de operaciones contables',
      color: 'bg-purple-500',
      stats: '245 asientos'
    },
    {
      href: '/finanzas/balance',
      icon: TrendingUp,
      title: 'Balance General',
      description: 'Estado de situación patrimonial',
      color: 'bg-green-500',
      stats: 'Ver balance'
    },
    {
      href: '/finanzas/resultados',
      icon: Receipt,
      title: 'Estado de Resultados',
      description: 'Ganancias y pérdidas del período',
      color: 'bg-orange-500',
      stats: 'Ver resultados'
    },
    {
      href: '/finanzas/cuentas-cobrar',
      icon: DollarSign,
      title: 'Cuentas por Cobrar',
      description: 'Gestión de créditos a clientes',
      color: 'bg-emerald-500',
      stats: '$125,000'
    },
    {
      href: '/finanzas/cuentas-pagar',
      icon: CreditCard,
      title: 'Cuentas por Pagar',
      description: 'Gestión de deudas con proveedores',
      color: 'bg-red-500',
      stats: '$102,850'
    }
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.stats}</p>
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
            <h3 className="text-lg font-semibold text-green-900 mb-2">Contabilidad en Tiempo Real</h3>
            <p className="text-sm text-green-700">
              El módulo financiero registra automáticamente todas las operaciones del sistema,
              generando balances y estados financieros actualizados al instante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
