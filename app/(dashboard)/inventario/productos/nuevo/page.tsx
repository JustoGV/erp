'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, Tags, DollarSign, Ruler } from 'lucide-react';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    unit: 'Unidad',
    price: 0,
    stockMin: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Producto guardado:', formData);
      alert('✅ Producto creado exitosamente');
      setLoading(false);
      router.push('/inventario/productos');
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
          href="/inventario/productos"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Producto</h1>
          <p className="text-slate-600 mt-1">Define los datos principales del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Package size={20} />
              </div>
              <h3 className="card-title">Datos del Producto</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="input"
                placeholder="SKU-001"
              />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Producto ABC"
              />
            </div>

            <div>
              <label className="label">
                <Tags size={16} className="inline mr-1" />
                Categoría
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                placeholder="Insumos"
              />
            </div>

            <div>
              <label className="label">
                <Ruler size={16} className="inline mr-1" />
                Unidad de Medida
              </label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="input">
                <option>Unidad</option>
                <option>Caja</option>
                <option>Kg</option>
                <option>Litro</option>
              </select>
            </div>

            <div>
              <label className="label">
                <DollarSign size={16} className="inline mr-1" />
                Precio de Venta
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label">Stock Mínimo</label>
              <input
                type="number"
                name="stockMin"
                value={formData.stockMin}
                onChange={handleChange}
                className="input"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
          <Link href="/inventario/productos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
