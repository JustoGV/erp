'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { mockEmpresas } from '@/lib/mock-data';
import Modal from '@/components/Modal';

export default function EmpresaPage() {
  const empresaInicial = mockEmpresas[0];
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: empresaInicial?.name || '',
    taxId: empresaInicial?.taxId || '',
    address: empresaInicial?.address || '',
    city: empresaInicial?.city || '',
    state: empresaInicial?.state || '',
    phone: empresaInicial?.phone || '',
    email: empresaInicial?.email || ''
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Cambios guardados (demo).');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración de Empresa</h1>
          <p className="text-slate-600 mt-1">Datos generales de la compañía</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn btn-primary">
          Editar empresa
        </button>
      </div>

      <div className="card">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <dt className="font-semibold text-slate-900">Nombre</dt>
            <dd>{formState.name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">CUIT</dt>
            <dd>{formState.taxId}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="font-semibold text-slate-900">Dirección</dt>
            <dd>{formState.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Ciudad</dt>
            <dd>{formState.city}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Provincia</dt>
            <dd>{formState.state}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Teléfono</dt>
            <dd>{formState.phone || '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Email</dt>
            <dd>{formState.email || '—'}</dd>
          </div>
        </dl>
      </div>

      <Modal open={formOpen} title="Editar empresa" onClose={() => setFormOpen(false)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input
              value={formState.name}
              onChange={(event) => setFormState(prev => ({ ...prev, name: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">CUIT</label>
            <input
              value={formState.taxId}
              onChange={(event) => setFormState(prev => ({ ...prev, taxId: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección</label>
            <input
              value={formState.address}
              onChange={(event) => setFormState(prev => ({ ...prev, address: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Ciudad</label>
            <input
              value={formState.city}
              onChange={(event) => setFormState(prev => ({ ...prev, city: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Provincia</label>
            <input
              value={formState.state}
              onChange={(event) => setFormState(prev => ({ ...prev, state: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              value={formState.phone}
              onChange={(event) => setFormState(prev => ({ ...prev, phone: event.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState(prev => ({ ...prev, email: event.target.value }))}
              className="input"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Panel de demo</h3>
            <p className="text-sm text-blue-700">Los cambios se guardan solo en pantalla.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
