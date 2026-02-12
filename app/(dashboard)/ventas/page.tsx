'use client';

import Link from 'next/link';
import { ShoppingBag, Users, UserCheck, FileText, ClipboardList, Receipt, DollarSign } from 'lucide-react';

export default function VentasResumenPage() {
  const menuItems = [
    {
      href: '/ventas/clientes',
      icon: Users,
      title: 'Clientes',
      description: 'Gestión de clientes y cuentas',
      color: 'bg-blue-500',
      stats: '125 clientes activos'
    },
    {
      href: '/ventas/seguimiento',
      icon: UserCheck,
      title: 'Seguimiento',
      description: 'Seguimiento de clientes e interacciones',
      color: 'bg-cyan-500',
      stats: '18 interacciones'
    },
    {
      href: '/ventas/presupuestos',
      icon: FileText,
      title: 'Presupuestos',
      description: 'Cotizaciones y presupuestos',
      color: 'bg-purple-500',
      stats: '4 presupuestos activos'
    },
    {
      href: '/ventas/pedidos',
      icon: ClipboardList,
      title: 'Pedidos',
      description: 'Órdenes de venta y pedidos',
      color: 'bg-indigo-500',
      stats: '3 pedidos pendientes'
    },
    {
      href: '/ventas/facturas',
      icon: Receipt,
      title: 'Facturas',
      description: 'Facturación y comprobantes',
      color: 'bg-green-500',
      stats: '45 facturas este mes'
    },
    {
      href: '/ventas/cobranzas',
      icon: DollarSign,
      title: 'Cobranzas',
      description: 'Gestión de cobros y pagos',
      color: 'bg-emerald-500',
      stats: '$125,000 por cobrar'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Ventas</h1>
        <p className="text-gray-600 mt-1">Gestión completa del área de comercialización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-blue-300"
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ShoppingBag className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Flujo de Ventas</h3>
            <p className="text-sm text-blue-700">
              El módulo de ventas administra el ciclo completo de comercialización.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
              <span className="font-medium">Flujo:</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Seguimiento</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Presupuesto</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Pedido</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Factura</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Cobranza</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
