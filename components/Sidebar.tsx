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
  ChevronRight,
  Building2
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
  { href: '/ventas', icon: ShoppingCart, label: 'Ventas', color: 'text-emerald-500' },
  { href: '/compras', icon: ShoppingBag, label: 'Compras', color: 'text-purple-500' },
  { href: '/inventario', icon: Package, label: 'Inventario', color: 'text-orange-500' },
  { href: '/finanzas', icon: DollarSign, label: 'Finanzas', color: 'text-cyan-500' },
  { href: '/rrhh', icon: Users, label: 'RRHH', color: 'text-pink-500' },
  { href: '/reportes', icon: BarChart3, label: 'Reportes', color: 'text-indigo-500' },
  { href: '/configuracion', icon: Settings, label: 'Configuración', color: 'text-slate-500' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white"
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
          w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white
          transform transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-20 px-6 bg-slate-800/50 border-b border-slate-700/50">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ERP System
              </Link>
              <p className="text-xs text-slate-400">Panel de Control</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl
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
                      <Icon size={20} />
                    </div>
                    <span className="relative z-10 font-medium flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={16} className="relative z-10 text-white/70" />
                    )}
                  </Link>
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
