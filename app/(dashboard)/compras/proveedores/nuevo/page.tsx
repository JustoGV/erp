'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { useCrearProveedor } from '@/hooks/useCompras';
import { useLocal } from '@/contexts/LocalContext';
import { useApiToast } from '@/hooks/useApiToast';

export default function NuevoProveedorPage() {
  const router = useRouter();
  const { selectedLocal } = useLocal();
  const { handleError, handleSuccess } = useApiToast();
  const crear = useCrearProveedor();

  const [form, setForm] = useState({
    code: '',
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentTerms: '',
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocal?.id) {
      handleError(new Error('Selecciona un local antes de crear un proveedor.'));
      return;
    }
    try {
      await crear.mutateAsync({
        code: form.code,
        name: form.name,
        localId: selectedLocal.id,
        taxId: form.taxId || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        paymentTerms: form.paymentTerms ? Number(form.paymentTerms) : undefined,
      });
      handleSuccess('Proveedor creado', 'El proveedor fue registrado correctamente.');
      router.push('/compras/proveedores');
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/compras/proveedores"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Proveedor</h1>
          <p className="text-slate-500">Completa los datos del nuevo proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Building2 size={20} />
              </div>
              <h3 className="card-title">Información del Proveedor</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código *</label>
              <input type="text" className="input" required placeholder="PROV-001"
                value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="label">Nombre / Razón Social *</label>
              <input type="text" className="input" required placeholder="Distribuidora S.A."
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">CUIT</label>
              <input type="text" className="input" placeholder="30-12345678-9"
                value={form.taxId} onChange={e => set('taxId', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="compras@proveedor.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="text" className="input" placeholder="011-4444-5555"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Días de Plazo de Pago</label>
              <input type="number" className="input" placeholder="30" min="0"
                value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Dirección</label>
              <input type="text" className="input" placeholder="Av. Industrial 1234"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input type="text" className="input" placeholder="Buenos Aires"
                value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">Provincia</label>
              <input type="text" className="input" placeholder="CABA"
                value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={crear.isPending} className="btn btn-primary">
            <Save size={18} />
            {crear.isPending ? 'Guardando...' : 'Guardar Proveedor'}
          </button>
          <Link href="/compras/proveedores" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

