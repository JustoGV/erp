import Link from 'next/link';
import { Users, Shield, History, Settings as SettingsIcon } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Administración del sistema, usuarios y permisos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConfigCard
          icon={<Users size={32} />}
          title="Usuarios"
          description="Gestión de usuarios del sistema"
          href="/configuracion/usuarios"
          color="blue"
        />
        <ConfigCard
          icon={<Shield size={32} />}
          title="Roles y Permisos"
          description="Configurar permisos por rol"
          href="/configuracion/roles"
          color="green"
        />
        <ConfigCard
          icon={<History size={32} />}
          title="Auditoría"
          description="Historial de cambios y acciones"
          href="/configuracion/auditoria"
          color="purple"
        />
        <ConfigCard
          icon={<SettingsIcon size={32} />}
          title="Configuración General"
          description="Parámetros del sistema"
          href="/configuracion/general"
          color="orange"
        />
        <ConfigCard
          icon={<SettingsIcon size={32} />}
          title="Facturación Electrónica"
          description="Configurar AFIP y facturación"
          href="/configuracion/facturacion"
          color="indigo"
        />
        <ConfigCard
          icon={<SettingsIcon size={32} />}
          title="Numeración"
          description="Configurar numeradores de documentos"
          href="/configuracion/numeracion"
          color="pink"
        />
      </div>

      {/* Sistema de Usuarios */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Roles Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RoleCard
            name="Administrador"
            description="Acceso total al sistema"
            count={2}
          />
          <RoleCard
            name="Gerente"
            description="Gestión y reportes"
            count={3}
          />
          <RoleCard
            name="Ventas"
            description="Módulo de ventas"
            count={5}
          />
          <RoleCard
            name="Compras"
            description="Módulo de compras"
            count={2}
          />
          <RoleCard
            name="Depósito"
            description="Gestión de stock"
            count={4}
          />
          <RoleCard
            name="Contabilidad"
            description="Módulo financiero"
            count={2}
          />
          <RoleCard
            name="RRHH"
            description="Recursos humanos"
            count={1}
          />
          <RoleCard
            name="Usuario"
            description="Acceso limitado"
            count={8}
          />
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          <ActivityItem
            user="Admin"
            action="Creó un nuevo cliente"
            time="Hace 5 minutos"
            module="Ventas"
          />
          <ActivityItem
            user="Juan Pérez"
            action="Generó una factura"
            time="Hace 15 minutos"
            module="Ventas"
          />
          <ActivityItem
            user="María García"
            action="Registró una orden de compra"
            time="Hace 1 hora"
            module="Compras"
          />
          <ActivityItem
            user="Carlos López"
            action="Ajustó inventario"
            time="Hace 2 horas"
            module="Inventario"
          />
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ 
  icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
  }[color];

  return (
    <Link href={href}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className={`${colorClasses} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}

function RoleCard({ name, description, count }: { name: string; description: string; count: number }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-900">{name}</h4>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <p className="text-xs text-gray-500 mt-2">{count} usuarios</p>
    </div>
  );
}

function ActivityItem({ 
  user, 
  action, 
  time, 
  module 
}: { 
  user: string; 
  action: string; 
  time: string; 
  module: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{user}</span> {action}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time} • {module}</p>
      </div>
    </div>
  );
}
