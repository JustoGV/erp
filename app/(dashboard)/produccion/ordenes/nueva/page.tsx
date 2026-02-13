'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Factory, Calendar, Box } from 'lucide-react';

export default function NuevaOrdenProduccionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    product: '',
    quantity: 0,
    startDate: '',
    endDate: '',
    status: 'Planificada',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Orden de producción guardada:', formData);
      alert('✅ Orden de producción creada');
      setLoading(false);
      router.push('/produccion/ordenes');
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
          href="/produccion/ordenes"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nueva Orden de Producción</h1>
          <p className="text-slate-600 mt-1">Configura los datos de producción</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Factory size={20} />
              </div>
              <h3 className="card-title">Detalles de la Orden</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="input"
                placeholder="OP-0001"
              />
            </div>

            <div>
              <label className="label">
                <Box size={16} className="inline mr-1" />
                Producto
              </label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="input"
                placeholder="Producto principal"
              />
            </div>

            <div>
              <label className="label">Cantidad</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="label">
                <Calendar size={16} className="inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Fecha Fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option>Planificada</option>
                <option>En curso</option>
                <option>Pausada</option>
                <option>Finalizada</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
          <Link href="/produccion/ordenes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
