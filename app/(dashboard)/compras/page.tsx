'use client';

import Link from 'next/link';
import { ShoppingCart, Users, FileText, Truck, CreditCard } from 'lucide-react';

export default function ComprasResumenPage() {
  const menuItems = [
    {
      href: '/compras/proveedores',
      icon: Users,
      title: 'Proveedores',
      description: 'Gestión de proveedores y cuentas',
      color: 'bg-purple-500',
      stats: '45 proveedores activos'
    },
    {
      href: '/compras/requerimientos',
      icon: FileText,
      title: 'Requerimientos',
      description: 'Solicitudes de compra',
      color: 'bg-yellow-500',
      stats: '2 requerimientos pendientes'
    },
    {
      href: '/compras/ordenes',
      icon: ShoppingCart,
      title: 'Órdenes de Compra',
      description: 'Órdenes a proveedores',
      color: 'bg-indigo-500',
      stats: '2 órdenes activas'
    },
    {
      href: '/compras/recepciones',
      icon: Truck,
      title: 'Recepciones',
      description: 'Avisos de recepción de mercadería',
      color: 'bg-green-500',
      stats: '1 recepción registrada'
    },
    {
      href: '/compras/pagos',
      icon: CreditCard,
      title: 'Pagos',
      description: 'Gestión de pagos a proveedores',
      color: 'bg-red-500',
      stats: '$102,850 por pagar'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Compras</h1>
        <p className="text-gray-600 mt-1">Gestión completa del área de adquisiciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-purple-300"
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

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ShoppingCart className="h-6 w-6 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Flujo de Compras</h3>
            <p className="text-sm text-purple-700">
              El módulo de compras gestiona el ciclo completo de adquisiciones.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-purple-800">
              <span className="font-medium">Flujo:</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Requerimiento</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Orden</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Recepción</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Pago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
