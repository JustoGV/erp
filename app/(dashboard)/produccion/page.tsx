'use client';

import Link from 'next/link';
import { Factory, FileText, Package, Wrench, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function ProduccionResumenPage() {
  const menuItems = [
    {
      href: '/produccion/ordenes',
      icon: FileText,
      title: 'Órdenes de Producción',
      description: 'Gestión de órdenes de manufactura',
      color: 'bg-blue-500',
      stats: '8 órdenes activas'
    },
    {
      href: '/produccion/bom',
      icon: ClipboardCheck,
      title: 'Lista de Materiales (BOM)',
      description: 'Estructuras y fórmulas de productos',
      color: 'bg-green-500',
      stats: '15 BOMs definidas'
    },
    {
      href: '/produccion/materiales',
      icon: Package,
      title: 'Materiales',
      description: 'Insumos y materias primas',
      color: 'bg-purple-500',
      stats: '125 materiales'
    },
    {
      href: '/produccion/maquinas',
      icon: Wrench,
      title: 'Máquinas y Equipos',
      description: 'Recursos de producción',
      color: 'bg-orange-500',
      stats: '12 máquinas'
    },
    {
      href: '/produccion/planificacion',
      icon: TrendingUp,
      title: 'Planificación',
      description: 'Plan de producción y capacidad',
      color: 'bg-indigo-500',
      stats: 'Ver plan'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Producción</h1>
        <p className="text-gray-600 mt-1">Gestión de manufactura y procesos</p>
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
          <Factory className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Control de Manufactura</h3>
            <p className="text-sm text-blue-700">
              El módulo de producción permite planificar, ejecutar y controlar órdenes de manufactura, 
              consumo de materiales y tiempos de producción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
