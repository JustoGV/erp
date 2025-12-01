import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Users,
  BarChart3,
  Settings,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      <div className="relative container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 fade-in">
          <div className="inline-block mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl">
              <LayoutDashboard size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Sistema ERP Completo
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Gestión integral de tu empresa en una plataforma moderna, potente y fácil de usar
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" />}
            title="Rápido y Eficiente"
            description="Optimizado para máxima velocidad y rendimiento"
          />
          <FeatureCard 
            icon={<Shield className="text-emerald-400" />}
            title="Seguro y Confiable"
            description="Protección de datos y accesos controlados"
          />
          <FeatureCard 
            icon={<TrendingUp className="text-blue-400" />}
            title="Escalable"
            description="Crece con tu empresa sin límites"
          />
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          <ModuleCard
            href="/dashboard"
            icon={<LayoutDashboard />}
            title="Dashboard"
            description="Resumen y reportes generales"
            gradient="from-blue-500 to-blue-600"
          />
          
          <ModuleCard
            href="/ventas"
            icon={<ShoppingCart />}
            title="Ventas"
            description="Clientes, presupuestos y facturas"
            gradient="from-emerald-500 to-emerald-600"
          />
          
          <ModuleCard
            href="/compras"
            icon={<ShoppingBag />}
            title="Compras"
            description="Proveedores, órdenes y pagos"
            gradient="from-purple-500 to-purple-600"
          />
          
          <ModuleCard
            href="/inventario"
            icon={<Package />}
            title="Inventario"
            description="Stock, productos y movimientos"
            gradient="from-orange-500 to-orange-600"
          />
          
          <ModuleCard
            href="/finanzas"
            icon={<DollarSign />}
            title="Finanzas"
            description="Contabilidad, caja y bancos"
            gradient="from-cyan-500 to-cyan-600"
          />
          
          <ModuleCard
            href="/rrhh"
            icon={<Users />}
            title="RRHH"
            description="Empleados y liquidaciones"
            gradient="from-pink-500 to-pink-600"
          />
          
          <ModuleCard
            href="/reportes"
            icon={<BarChart3 />}
            title="Reportes"
            description="Análisis y estadísticas"
            gradient="from-indigo-500 to-indigo-600"
          />
          
          <ModuleCard
            href="/configuracion"
            icon={<Settings />}
            title="Configuración"
            description="Usuarios y permisos"
            gradient="from-slate-500 to-slate-600"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white 
                     px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/50
                     hover:shadow-blue-500/70 hover:scale-105 transition-all duration-200"
          >
            Acceder al Sistema
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <p className="text-slate-400 text-sm mt-4">Sistema demo con datos de ejemplo</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function ModuleCard({ 
  href, 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 
                    hover:bg-white/20 hover:border-white/30 hover:scale-105 
                    transition-all duration-300 cursor-pointer h-full">
        <div className={`bg-gradient-to-br ${gradient} text-white w-14 h-14 rounded-xl 
                       flex items-center justify-center mb-4 shadow-lg
                       group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 text-sm">{description}</p>
      </div>
    </Link>
  );
}
