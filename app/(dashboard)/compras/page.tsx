'use client';

import Link from 'next/link';
import { mockProveedores, mockOrdenesCompra } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function ComprasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState({
    proveedores: 0,
    ordenes: 0
  });

  useEffect(() => {
    const proveedoresFiltrados = isAllLocales 
      ? mockProveedores 
      : mockProveedores.filter(p => p.localId === selectedLocal?.id);
    
    const ordenesFiltradas = isAllLocales 
      ? mockOrdenesCompra 
      : mockOrdenesCompra.filter(o => o.localId === selectedLocal?.id);

    setStats({
      proveedores: proveedoresFiltrados.length,
      ordenes: ordenesFiltradas.length
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-600 mt-1">Gestión de proveedores, órdenes de compra y pagos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard title="Proveedores" value={stats.proveedores.toString()} href="/compras/proveedores" />
        <QuickStatCard title="Órdenes de Compra" value={stats.ordenes.toString()} href="/compras/ordenes" />
        <QuickStatCard title="Recepciones" value="0" href="/compras/recepciones" />
        <QuickStatCard title="Pagos" value="0" href="/compras/pagos" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Proveedores"
          description="Administra tu base de proveedores"
          href="/compras/proveedores"
          buttonText="Ver proveedores"
        />
        <ModuleCard
          title="Órdenes de Compra"
          description="Crea y gestiona órdenes de compra"
          href="/compras/ordenes"
          buttonText="Ver órdenes"
        />
        <ModuleCard
          title="Recepciones"
          description="Registra la recepción de mercadería"
          href="/compras/recepciones"
          buttonText="Ver recepciones"
        />
        <ModuleCard
          title="Pagos a Proveedores"
          description="Registra pagos a proveedores"
          href="/compras/pagos"
          buttonText="Ver pagos"
        />
        <ModuleCard
          title="Cuentas por Pagar"
          description="Controla las deudas con proveedores"
          href="/compras/cuentas-por-pagar"
          buttonText="Ver cuentas"
        />
        <ModuleCard
          title="Reportes"
          description="Analiza compras y proveedores"
          href="/compras/reportes"
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
