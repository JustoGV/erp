'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileSpreadsheet, Calendar, DollarSign, User } from 'lucide-react';

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    customer: '',
    date: '',
    total: 0,
    status: 'Borrador',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Presupuesto guardado:', formData);
      alert('✅ Presupuesto creado exitosamente');
      setLoading(false);
      router.push('/ventas/presupuestos');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/ventas/presupuestos"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Presupuesto</h1>
          <p className="text-slate-600 mt-1">Crea una propuesta comercial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FileSpreadsheet size={20} />
              </div>
              <h3 className="card-title">Datos del Presupuesto</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Número *</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
                className="input"
                placeholder="P-00045"
              />
            </div>

            <div>
              <label className="label">
                <User size={16} className="inline mr-1" />
                Cliente
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="input"
                placeholder="Cliente principal"
              />
            </div>

            <div>
              <label className="label">
                <Calendar size={16} className="inline mr-1" />
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">
                <DollarSign size={16} className="inline mr-1" />
                Total
              </label>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option>Borrador</option>
                <option>Enviado</option>
                <option>Aprobado</option>
                <option>Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Presupuesto'}
          </button>
          <Link href="/ventas/presupuestos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
