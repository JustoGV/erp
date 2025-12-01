'use client';

import Link from 'next/link';
import { mockProductos, mockMovimientosStock, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function InventarioPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState({
    productos: 0,
    locales: 0,
    stockTotal: 0,
    movimientos: 0
  });

  useEffect(() => {
    const productosFiltrados = isAllLocales 
      ? mockProductos 
      : mockProductos.filter(p => p.localId === selectedLocal?.id);
    
    const movimientosFiltrados = isAllLocales 
      ? mockMovimientosStock 
      : mockMovimientosStock.filter(m => m.localId === selectedLocal?.id);

    const stockTotal = productosFiltrados.reduce((sum, p) => sum + p.stock, 0);

    setStats({
      productos: productosFiltrados.length,
      locales: isAllLocales ? mockLocales.length : 1,
      stockTotal,
      movimientos: movimientosFiltrados.length
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Control de stock, productos y movimientos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard title="Productos" value={stats.productos.toString()} href="/inventario/productos" />
        <QuickStatCard title="Locales" value={stats.locales.toString()} href="/configuracion/locales" />
        <QuickStatCard title="Stock Total" value={stats.stockTotal.toString()} href="/inventario/productos" />
        <QuickStatCard title="Movimientos" value={stats.movimientos.toString()} href="/inventario/movimientos" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Productos"
          description="Catálogo de productos y servicios"
          href="/inventario/productos"
          buttonText="Ver productos"
        />
        <ModuleCard
          title="Stock"
          description="Consulta stock disponible por depósito"
          href="/inventario/stock"
          buttonText="Ver stock"
        />
        <ModuleCard
          title="Movimientos"
          description="Historial de entradas y salidas"
          href="/inventario/movimientos"
          buttonText="Ver movimientos"
        />
        <ModuleCard
          title="Depósitos"
          description="Gestión de depósitos y ubicaciones"
          href="/inventario/depositos"
          buttonText="Ver depósitos"
        />
        <ModuleCard
          title="Ajustes de Stock"
          description="Ajusta inventario físico"
          href="/inventario/ajustes"
          buttonText="Hacer ajuste"
        />
        <ModuleCard
          title="Reportes"
          description="Análisis de inventario y rotación"
          href="/inventario/reportes"
          buttonText="Ver reportes"
        />
      </div>
    </div>
  );
}

function QuickStatCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
    </Link>
  );
}

function ModuleCard({ 
  title, 
  description, 
  href, 
  buttonText 
}: { 
  title: string; 
  description: string; 
  href: string; 
  buttonText: string;
}) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link href={href} className="btn btn-primary w-full text-center">
        {buttonText}
      </Link>
    </div>
  );
}
