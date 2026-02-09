'use client';

import { Bell, Search, User, ChevronDown, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LocalSelector from './LocalSelector';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Local Selector */}
        <div className="flex items-center gap-4">
          <LocalSelector />
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar clientes, productos, facturas..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl 
                       text-slate-900 placeholder:text-slate-400 text-sm
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       focus:bg-white hover:bg-white"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Help */}
          <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <HelpCircle size={20} />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <User size={18} className="text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.nombre}</p>
                <p className="text-xs text-slate-500">{user?.rol}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{user?.nombre}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <User size={16} />
                  Mi Perfil
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <Settings size={16} />
                  Configuración
                </button>
                <div className="border-t border-slate-100 my-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
