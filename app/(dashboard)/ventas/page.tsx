'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { mockClientes, mockFacturas } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function VentasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState({
    clientes: 0,
    presupuestos: 0,
    facturas: 0
  });

  useEffect(() => {
    const clientesFiltrados = isAllLocales 
      ? mockClientes 
      : mockClientes.filter(c => c.localId === selectedLocal?.id);
    
    const facturasFiltradas = isAllLocales 
      ? mockFacturas 
      : mockFacturas.filter(f => f.localId === selectedLocal?.id);

    // Presupuestos mock por local
    const presupuestosPorLocal: Record<string, number> = {
      '1': 10, // Santa Fe
      '2': 8,  // Paraná
      '3': 10  // Rosario
    };
    const presupuestos = isAllLocales 
      ? 28 
      : (presupuestosPorLocal[selectedLocal?.id || '1'] || 0);

    setStats({
      clientes: clientesFiltrados.length,
      presupuestos,
      facturas: facturasFiltradas.length
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Gestión de clientes, presupuestos, pedidos y facturas</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard title="Clientes" value={stats.clientes.toString()} href="/ventas/clientes" />
        <QuickStatCard title="Presupuestos" value={stats.presupuestos.toString()} href="/ventas/presupuestos" />
        <QuickStatCard title="Pedidos" value="0" href="/ventas/pedidos" />
        <QuickStatCard title="Facturas" value={stats.facturas.toString()} href="/ventas/facturas" />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Clientes"
          description="Gestiona tu base de clientes y su información de contacto"
          href="/ventas/clientes"
          buttonText="Ver clientes"
        />
        <ModuleCard
          title="Presupuestos"
          description="Crea y gestiona presupuestos para tus clientes"
          href="/ventas/presupuestos"
          buttonText="Ver presupuestos"
        />
        <ModuleCard
          title="Pedidos"
          description="Administra los pedidos de tus clientes"
          href="/ventas/pedidos"
          buttonText="Ver pedidos"
        />
        <ModuleCard
          title="Facturas"
          description="Emite y controla facturas de venta"
          href="/ventas/facturas"
          buttonText="Ver facturas"
        />
        <ModuleCard
          title="Cobranzas"
          description="Registra los pagos de tus clientes"
          href="/ventas/cobranzas"
          buttonText="Ver cobranzas"
        />
        <ModuleCard
          title="Reportes"
          description="Analiza las ventas y el desempeño comercial"
          href="/ventas/reportes"
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
