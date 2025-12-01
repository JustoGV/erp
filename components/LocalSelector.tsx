'use client';

import { useLocal } from '@/contexts/LocalContext';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LocalSelector() {
  const { selectedLocal, setSelectedLocal, locales, isAllLocales } = useLocal();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = isAllLocales 
    ? 'Todos los locales' 
    : `${selectedLocal?.name || 'Seleccionar local'}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg 
                 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 min-w-[200px]"
      >
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md">
          <Building2 size={16} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs text-slate-500 font-medium">Local activo</p>
          <p className="text-sm font-semibold text-slate-900">{displayText}</p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white rounded-xl shadow-lg 
                      border border-slate-200 py-2 z-50 fade-in">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Seleccionar Local
            </p>
          </div>

          {/* Opción: Todos los locales */}
          <button
            onClick={() => {
              setSelectedLocal(null);
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group
                      ${isAllLocales ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAllLocales ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                <Building2 size={18} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isAllLocales ? 'text-blue-900' : 'text-slate-900'}`}>
                  Todos los locales
                </p>
                <p className="text-xs text-slate-500">Vista consolidada</p>
              </div>
            </div>
            {isAllLocales && (
              <Check size={18} className="text-blue-600" />
            )}
          </button>

          <div className="border-t border-slate-100 my-1" />

          {/* Lista de locales */}
          {locales.map((local) => {
            const isSelected = selectedLocal?.id === local.id;
            return (
              <button
                key={local.id}
                onClick={() => {
                  setSelectedLocal(local);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group
                          ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {local.name}
                      </p>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {local.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{local.city}, {local.state}</p>
                  </div>
                </div>
                {isSelected && (
                  <Check size={18} className="text-blue-600" />
                )}
              </button>
            );
          })}

          <div className="border-t border-slate-100 mt-1 pt-2 px-4">
            <button 
              onClick={() => {
                setIsOpen(false);
                alert('Funcionalidad de gestión de locales - Próximamente');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Gestionar locales
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
