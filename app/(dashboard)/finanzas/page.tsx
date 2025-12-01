'use client';

import Link from 'next/link';
import { mockFacturas, mockStatsByLocal, mockStats } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function FinanzasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState({
    ventasMes: 0,
    comprasMes: 0
  });

  useEffect(() => {
    const currentStats = isAllLocales ? mockStats : mockStatsByLocal[selectedLocal?.id || '1'];
    
    setStats({
      ventasMes: currentStats.ventasMes,
      comprasMes: currentStats.comprasMes
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-600 mt-1">Contabilidad, caja, bancos y reportes financieros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard title="Ventas del Mes" value={`$${stats.ventasMes.toLocaleString()}`} href="/finanzas/caja" />
        <QuickStatCard title="Compras del Mes" value={`$${stats.comprasMes.toLocaleString()}`} href="/finanzas/caja" />
        <QuickStatCard title="Resultado" value={`$${(stats.ventasMes - stats.comprasMes).toLocaleString()}`} href="/finanzas/caja" />
        <QuickStatCard title="Margen" value={`${Math.round(((stats.ventasMes - stats.comprasMes) / stats.ventasMes) * 100)}%`} href="/finanzas/caja" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Plan de Cuentas"
          description="Gestiona el plan de cuentas contable"
          href="/finanzas/plan-cuentas"
          buttonText="Ver plan"
        />
        <ModuleCard
          title="Asientos Contables"
          description="Registros contables y asientos"
          href="/finanzas/asientos"
          buttonText="Ver asientos"
        />
        <ModuleCard
          title="Caja"
          description="Movimientos de caja diarios"
          href="/finanzas/caja"
          buttonText="Ver caja"
        />
        <ModuleCard
          title="Bancos"
          description="Cuentas bancarias y movimientos"
          href="/finanzas/bancos"
          buttonText="Ver bancos"
        />
        <ModuleCard
          title="Cuentas por Cobrar"
          description="Deudas de clientes pendientes"
          href="/finanzas/cuentas-cobrar"
          buttonText="Ver cuentas"
        />
        <ModuleCard
          title="Cuentas por Pagar"
          description="Deudas con proveedores"
          href="/finanzas/cuentas-pagar"
          buttonText="Ver cuentas"
        />
        <ModuleCard
          title="Balance"
          description="Balance general y estado patrimonial"
          href="/finanzas/balance"
          buttonText="Ver balance"
        />
        <ModuleCard
          title="Estado de Resultados"
          description="Ingresos, gastos y resultado"
          href="/finanzas/resultados"
          buttonText="Ver resultados"
        />
        <ModuleCard
          title="Reportes Financieros"
          description="Análisis financiero completo"
          href="/finanzas/reportes"
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
