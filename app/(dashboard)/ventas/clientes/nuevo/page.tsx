'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from 'lucide-react';
import { useCrearCliente } from '@/hooks/useVentas';
import { useLocal } from '@/contexts/LocalContext';
import { useApiToast } from '@/hooks/useApiToast';
import type { CreateClienteDto } from '@/lib/api-types';

export default function NuevoClientePage() {
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();
  const { selectedLocal } = useLocal();
  const crear = useCrearCliente();

  const [form, setForm] = useState<Omit<CreateClienteDto, 'localId'>>({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    creditLimit: 0,
  });

  const set = (field: keyof typeof form, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocal) {
      handleError(new Error('Seleccioná un local antes de crear un cliente'));
      return;
    }
    const dto: CreateClienteDto = {
      ...form,
      localId: selectedLocal.id,
      creditLimit: Number(form.creditLimit),
      taxId: form.taxId || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
    };
    crear.mutate(dto, {
      onSuccess: () => {
        handleSuccess('Cliente creado', form.name);
        router.push('/ventas/clientes');
      },
      onError: (err) => handleError(err),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ventas/clientes" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Cliente</h1>
          <p className="text-slate-600 mt-1">
            {selectedLocal ? `Local: ${selectedLocal.name}` : 'Seleccioná un local en el selector superior'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="card-title">Información Básica</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="label">Nombre / Razón Social *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className="input"
                placeholder="Empresa ABC S.A."
              />
            </div>
            <div>
              <label htmlFor="taxId" className="label">CUIT / DNI</label>
              <input
                id="taxId"
                type="text"
                value={form.taxId}
                onChange={(e) => set('taxId', e.target.value)}
                className="input"
                placeholder="20-12345678-9"
              />
            </div>
            <div>
              <label htmlFor="creditLimit" className="label">Límite de Crédito</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  id="creditLimit"
                  type="number"
                  value={form.creditLimit || ''}
                  onChange={(e) => set('creditLimit', parseFloat(e.target.value) || 0)}
                  className="input pl-8"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Mail size={20} />
              </div>
              <h3 className="card-title">Contacto</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="input"
                placeholder="contacto@empresa.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">
                <Phone size={16} className="inline mr-1" />
                Teléfono
              </label>
              <input
                id="phone"
                type="text"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="input"
                placeholder="11-4444-5555"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="card-title">Dirección</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="label">Dirección</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="input"
                placeholder="Av. Corrientes 1234"
              />
            </div>
            <div>
              <label htmlFor="city" className="label">Ciudad</label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="input"
                placeholder="Buenos Aires"
              />
            </div>
            <div>
              <label htmlFor="state" className="label">Provincia</label>
              <input
                id="state"
                type="text"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                className="input"
                placeholder="Buenos Aires"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={crear.isPending || !selectedLocal}
            className="btn btn-primary"
          >
            <Save size={18} />
            {crear.isPending ? 'Guardando...' : 'Guardar Cliente'}
          </button>
          <Link href="/ventas/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
