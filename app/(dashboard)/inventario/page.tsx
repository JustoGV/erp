'use client';

import Link from 'next/link';
import { Package, Box, ArrowRightLeft, BarChart3, AlertTriangle, Boxes } from 'lucide-react';

export default function InventarioResumenPage() {
  const menuItems = [
    {
      href: '/inventario/productos',
      icon: Package,
      title: 'Productos',
      description: 'Catálogo de productos y artículos',
      color: 'bg-orange-500',
      stats: '521 productos'
    },
    {
      href: '/inventario/depositos',
      icon: Box,
      title: 'Depósitos',
      description: 'Gestión de depósitos y ubicaciones',
      color: 'bg-amber-500',
      stats: '3 depósitos'
    },
    {
      href: '/inventario/movimientos',
      icon: ArrowRightLeft,
      title: 'Movimientos',
      description: 'Ingresos, egresos y transferencias',
      color: 'bg-blue-500',
      stats: '245 movimientos'
    },
    {
      href: '/inventario/stock',
      icon: Boxes,
      title: 'Stock',
      description: 'Consulta de existencias por depósito',
      color: 'bg-green-500',
      stats: 'Ver stock actual'
    },
    {
      href: '/inventario/alertas',
      icon: AlertTriangle,
      title: 'Alertas',
      description: 'Stock bajo y punto de pedido',
      color: 'bg-red-500',
      stats: '12 alertas activas'
    },
    {
      href: '/inventario/valorización',
      icon: BarChart3,
      title: 'Valorización',
      description: 'Valorización de existencias',
      color: 'bg-purple-500',
      stats: 'Costo y precio'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Inventario</h1>
        <p className="text-gray-600 mt-1">Control y gestión de stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-orange-300"
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

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Package className="h-6 w-6 text-orange-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Control de Stock</h3>
            <p className="text-sm text-orange-700">
              El módulo de inventario permite control total del stock con ubicaciones físicas,
              movimientos automáticos desde ventas y compras, y alertas de stock mínimo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
