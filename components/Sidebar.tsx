'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Building2,
  Factory,
  FileText,
  UserCircle,
  Receipt,
  TrendingUp,
  ClipboardList,
  Boxes,
  Scale,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface SubMenuItem {
  href: string;
  label: string;
}

interface MenuItem {
  href?: string;
  icon: any;
  label: string;
  color: string;
  module: string;
  subItems?: SubMenuItem[];
}

const allMenuItems: MenuItem[] = [
  { 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    color: 'text-blue-500', 
    module: 'dashboard' 
  },
  { 
    icon: ShoppingCart, 
    label: 'Ventas', 
    color: 'text-emerald-500', 
    module: 'ventas',
    subItems: [
      { href: '/ventas', label: 'Resumen' },
      { href: '/ventas/clientes', label: 'Clientes' },
      { href: '/ventas/seguimiento', label: 'Seguimiento' },
      { href: '/ventas/presupuestos', label: 'Presupuestos' },
      { href: '/ventas/pedidos', label: 'Pedidos' },
      { href: '/ventas/facturas', label: 'Facturas' },
      { href: '/ventas/cobranzas', label: 'Cobranzas' },
    ]
  },
  { 
    icon: ShoppingBag, 
    label: 'Compras', 
    color: 'text-purple-500', 
    module: 'compras',
    subItems: [
      { href: '/compras', label: 'Resumen' },
      { href: '/compras/proveedores', label: 'Proveedores' },
      { href: '/compras/requerimientos', label: 'Requerimientos' },
      { href: '/compras/ordenes', label: 'Órdenes de Compra' },
      { href: '/compras/recepciones', label: 'Recepciones' },
      { href: '/compras/pagos', label: 'Pagos' },
    ]
  },
  { 
    icon: Package, 
    label: 'Inventario', 
    color: 'text-orange-500', 
    module: 'inventario',
    subItems: [
      { href: '/inventario', label: 'Resumen' },
      { href: '/inventario/productos', label: 'Productos' },
      { href: '/inventario/depositos', label: 'Depósitos' },
      { href: '/inventario/stock', label: 'Control de Stock' },
      { href: '/inventario/ajustes', label: 'Ajustes' },
    ]
  },
  { 
    icon: Factory, 
    label: 'Producción', 
    color: 'text-yellow-500', 
    module: 'produccion',
    subItems: [
      { href: '/produccion', label: 'Resumen' },
      { href: '/produccion/ordenes', label: 'Órdenes de Producción' },
      { href: '/produccion/bom', label: 'Lista de Materiales (BOM)' },
      { href: '/produccion/materiales', label: 'Materiales e Insumos' },
    ]
  },
  { 
    icon: DollarSign, 
    label: 'Finanzas', 
    color: 'text-cyan-500', 
    module: 'finanzas',
    subItems: [
      { href: '/finanzas', label: 'Resumen' },
      { href: '/finanzas/plan-cuentas', label: 'Plan de Cuentas' },
      { href: '/finanzas/asientos', label: 'Asientos Contables' },
      { href: '/finanzas/cuentas-cobrar', label: 'Cuentas por Cobrar' },
      { href: '/finanzas/cuentas-pagar', label: 'Cuentas por Pagar' },
      { href: '/finanzas/balance', label: 'Balance General' },
      { href: '/finanzas/resultados', label: 'Estado de Resultados' },
      { href: '/finanzas/bancos', label: 'Bancos' },
      { href: '/finanzas/caja', label: 'Caja' },
    ]
  },
  { 
    icon: Users, 
    label: 'RRHH', 
    color: 'text-pink-500', 
    module: 'rrhh',
    subItems: [
      { href: '/rrhh', label: 'Resumen' },
      { href: '/rrhh/empleados', label: 'Empleados' },
      { href: '/rrhh/liquidaciones', label: 'Liquidaciones' },
      { href: '/rrhh/asistencias', label: 'Asistencias' },
      { href: '/rrhh/horas', label: 'Registro de Horas' },
      { href: '/rrhh/vacaciones', label: 'Vacaciones' },
    ]
  },
  { 
    href: '/reportes', 
    icon: BarChart3, 
    label: 'Reportes', 
    color: 'text-indigo-500', 
    module: 'reportes' 
  },
  { 
    icon: Settings, 
    label: 'Configuración', 
    color: 'text-slate-500', 
    module: 'configuracion',
    subItems: [
      { href: '/configuracion', label: 'General' },
      { href: '/configuracion/usuarios', label: 'Usuarios' },
      { href: '/configuracion/empresa', label: 'Empresa' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const { hasAccess } = usePermissions();

  // Filtrar menú según permisos del usuario
  const menuItems = allMenuItems.filter(item => hasAccess(item.module));

  const toggleMenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.subItems) {
      return item.subItems.some(sub => pathname?.startsWith(sub.href));
    }
    return false;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white
          transform transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-16 px-4 bg-slate-800/50 border-b border-slate-700/50">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <Link href="/dashboard" className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ERP System
              </Link>
              <p className="text-[10px] text-slate-400">Panel de Control</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isMenuActive(item);
                const isExpanded = expandedMenus.has(item.label);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                
                return (
                  <div key={item.label}>
                    {/* Menú principal */}
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`
                          group flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm
                          transition-all duration-200 relative overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse" />
                        )}
                        <div className={`relative z-10 ${isActive ? 'text-white' : item.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="relative z-10 font-medium flex-1 text-left">{item.label}</span>
                        <ChevronDown 
                          size={14} 
                          className={`relative z-10 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          } ${isActive ? 'text-white/70' : 'text-slate-400'}`} 
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => setIsOpen(false)}
                        className={`
                          group flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition-all duration-200 relative overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse" />
                        )}
                        <div className={`relative z-10 ${isActive ? 'text-white' : item.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="relative z-10 font-medium flex-1">{item.label}</span>
                      </Link>
                    )}

                    {/* Submenús */}
                    {hasSubItems && isExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                                transition-all duration-200
                                ${isSubActive
                                  ? 'bg-blue-600/20 text-blue-300 font-medium border-l-2 border-blue-400'
                                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border-l-2 border-slate-700'
                                }
                              `}
                            >
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-medium text-slate-300">Sistema Activo</p>
                <p className="text-xs text-slate-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
