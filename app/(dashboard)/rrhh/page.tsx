'use client';

import Link from 'next/link';
import { mockEmpleados } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function RRHHPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState({
    empleados: 0,
    empleadosActivos: 0
  });

  useEffect(() => {
    const empleadosFiltrados = isAllLocales 
      ? mockEmpleados 
      : mockEmpleados.filter(e => e.localId === selectedLocal?.id);
    
    setStats({
      empleados: empleadosFiltrados.length,
      empleadosActivos: empleadosFiltrados.filter(e => e.active).length
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recursos Humanos</h1>
          <p className="text-gray-600 mt-1">Gestión de empleados, liquidaciones y asistencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard title="Empleados" value={stats.empleados.toString()} href="/rrhh/empleados" />
        <QuickStatCard title="Activos" value={stats.empleadosActivos.toString()} href="/rrhh/empleados" />
        <QuickStatCard title="Liquidaciones Mes" value="0" href="/rrhh/liquidaciones" />
        <QuickStatCard title="Ausencias Mes" value="0" href="/rrhh/asistencias" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Empleados"
          description="Base de datos de empleados"
          href="/rrhh/empleados"
          buttonText="Ver empleados"
        />
        <ModuleCard
          title="Liquidaciones"
          description="Liquidación de sueldos mensual"
          href="/rrhh/liquidaciones"
          buttonText="Ver liquidaciones"
        />
        <ModuleCard
          title="Asistencias"
          description="Control de asistencias y ausencias"
          href="/rrhh/asistencias"
          buttonText="Ver asistencias"
        />
        <ModuleCard
          title="Horas y Extras"
          description="Registro de horas trabajadas"
          href="/rrhh/horas"
          buttonText="Ver horas"
        />
        <ModuleCard
          title="Vacaciones"
          description="Gestión de vacaciones"
          href="/rrhh/vacaciones"
          buttonText="Ver vacaciones"
        />
        <ModuleCard
          title="Reportes"
          description="Análisis de RRHH y costos"
          href="/rrhh/reportes"
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
