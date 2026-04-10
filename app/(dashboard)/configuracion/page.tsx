import Link from 'next/link';
import { Users, Shield, Building2, MapPin, Settings as SettingsIcon } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administración del sistema, usuarios y permisos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConfigCard
          icon={<Building2 size={32} />}
          title="Empresa"
          description="Datos de la empresa, CUIT y configuración general"
          href="/configuracion/empresa"
          color="blue"
        />
        <ConfigCard
          icon={<MapPin size={32} />}
          title="Locales / Sucursales"
          description="Gestión de sucursales y puntos de venta"
          href="/configuracion/locales"
          color="green"
        />
        <ConfigCard
          icon={<Users size={32} />}
          title="Usuarios"
          description="Gestión de usuarios y accesos del sistema"
          href="/configuracion/usuarios"
          color="indigo"
        />
        <ConfigCard
          icon={<Shield size={32} />}
          title="Roles y Permisos"
          description="Configurar permisos por rol de usuario"
          href="/configuracion/roles"
          color="purple"
        />
        <ConfigCard
          icon={<SettingsIcon size={32} />}
          title="Configuración General"
          description="Parámetros y preferencias del sistema"
          href="/configuracion/general"
          color="orange"
        />
        <ConfigCard
          icon={<SettingsIcon size={32} />}
          title="Numeración"
          description="Configurar numeradores de documentos"
          href="/configuracion/numeracion"
          color="pink"
        />
      </div>
    </div>
  );
}

function ConfigCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <Link href={href}>
      <div className="card card-interactive hover:shadow-lg transition-shadow cursor-pointer">
        <div className={`${colorClasses[color]} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}
