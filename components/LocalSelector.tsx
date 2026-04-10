'use client';

import { useLocal } from '@/contexts/LocalContext';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCreateLocal } from '@/hooks/useLocales';
import { usePermissions } from '@/hooks/usePermissions';
import { useApiToast } from '@/hooks/useApiToast';
import Modal from '@/components/Modal';

export default function LocalSelector() {
  const { selectedLocal, setSelectedLocal, locales, isAllLocales } = useLocal();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = usePermissions();
  const { handleSuccess } = useApiToast();
  const crearLocal = useCreateLocal();

  // Modal nuevo local
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', city: '', state: '', address: '', phone: '', email: '', manager: '' });
  const [formError, setFormError] = useState('');

  const openNewLocal = () => {
    setIsOpen(false);
    setForm({ code: '', name: '', city: '', state: '', address: '', phone: '', email: '', manager: '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleCreate = () => {
    setFormError('');
    if (!form.code.trim()) { setFormError('El código es obligatorio.'); return; }
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    crearLocal.mutate(
      {
        code:    form.code.trim(),
        name:    form.name.trim(),
        city:    form.city.trim()    || undefined,
        state:   form.state.trim()   || undefined,
        address: form.address.trim() || undefined,
        phone:   form.phone.trim()   || undefined,
        email:   form.email.trim()   || undefined,
        manager: form.manager.trim() || undefined,
      },
      {
        onSuccess: () => { handleSuccess('Local creado correctamente'); setModalOpen(false); },
        onError: (err: unknown) => {
          setFormError((err as { message?: string })?.message ?? 'Error al crear el local');
        },
      },
    );
  };

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

          <div className="border-t border-slate-100 mt-1 pt-2 px-4 flex items-center justify-between">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Gestionar locales
            </button>
            {isAdmin && (
              <button
                onClick={openNewLocal}
                className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={12} /> Nuevo local
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal crear local */}
      <Modal open={modalOpen} title="Nuevo Local / Sucursal" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: LOC-002" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input className="input w-full" placeholder="Ej: Sucursal Norte" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input className="input w-full" placeholder="Ej: Buenos Aires" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
              <input className="input w-full" placeholder="Ej: Buenos Aires" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input className="input w-full" placeholder="Ej: Av. Rivadavia 1234" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input className="input w-full" placeholder="Ej: 1145678901" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="input w-full" type="email" placeholder="local@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
            <input className="input w-full" placeholder="Nombre del responsable" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
          </div>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={crearLocal.isPending}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={crearLocal.isPending}>
              {crearLocal.isPending ? 'Creando...' : 'Crear Local'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
