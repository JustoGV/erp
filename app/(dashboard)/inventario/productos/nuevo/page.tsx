'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, Tags, DollarSign, Ruler } from 'lucide-react';
import { useCreateProducto, useCategorias } from '@/hooks/useInventario';
import { useApiToast } from '@/hooks/useApiToast';
import type { CreateProductoDto, TipoProducto } from '@/lib/api-types';

const UNIDADES = ['Unidad', 'Caja', 'Kg', 'Litro', 'Metro', 'Par', 'Docena'];

const TIPOS: { value: TipoProducto; label: string }[] = [
  { value: 'TERMINADO', label: 'Producto terminado' },
  { value: 'SEMI_TERMINADO', label: 'Semi terminado' },
  { value: 'MATERIA_PRIMA', label: 'Materia prima' },
  { value: 'INSUMO', label: 'Insumo' },
];

export default function NuevoProductoPage() {
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();
  const crear = useCreateProducto();
  const { data: categorias } = useCategorias();

  const [form, setForm] = useState<CreateProductoDto>({
    code: '',
    name: '',
    description: '',
    tipo: 'TERMINADO',
    unit: 'Unidad',
    cost: 0,
    price: 0,
    minStock: 0,
    categoriaId: '',
  });

  const set = (field: keyof CreateProductoDto, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateProductoDto = {
      ...form,
      cost: Number(form.cost),
      price: Number(form.price),
      minStock: Number(form.minStock),
      categoriaId: form.categoriaId || undefined,
      description: form.description || undefined,
    };
    crear.mutate(dto, {
      onSuccess: () => {
        handleSuccess('Producto creado', form.name);
        router.push('/inventario/productos');
      },
      onError: (err) => handleError(err),
    });
  };

  const margin =
    form.cost > 0 && form.price > 0
      ? (((Number(form.price) - Number(form.cost)) / Number(form.cost)) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventario/productos" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Producto</h1>
          <p className="text-slate-600 mt-1">Define los datos principales del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificación */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Package size={20} />
              </div>
              <h3 className="card-title">Identificación</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="label">Código *</label>
              <input
                id="code"
                type="text"
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                required
                className="input"
                placeholder="PROD-001"
              />
            </div>
            <div>
              <label htmlFor="name" className="label">Nombre *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className="input"
                placeholder="Nombre del producto"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="label">Descripción</label>
              <input
                id="description"
                type="text"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input"
                placeholder="Descripción opcional"
              />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Tags size={20} />
              </div>
              <h3 className="card-title">Clasificación</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="tipo" className="label">Tipo *</label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => set('tipo', e.target.value as TipoProducto)}
                className="input"
                required
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="categoriaId" className="label">
                Categoría
              </label>
              <select
                id="categoriaId"
                value={form.categoriaId}
                onChange={(e) => set('categoriaId', e.target.value)}
                className="input"
              >
                <option value="">Sin categoría</option>
                {(categorias as any)?.data?.map
                  ? (categorias as any).data.map((c: { id: string; name: string }) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  : Array.isArray(categorias)
                  ? (categorias as { id: string; name: string }[]).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  : null}
              </select>
            </div>
            <div>
              <label htmlFor="unit" className="label">
                <Ruler size={16} className="inline mr-1" />
                Unidad *
              </label>
              <select
                id="unit"
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
                className="input"
                required
              >
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <h3 className="card-title">Precios y Stock</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cost" className="label">Precio de Costo *</label>
              <input
                id="cost"
                type="number"
                value={form.cost || ''}
                onChange={(e) => set('cost', parseFloat(e.target.value) || 0)}
                required
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="price" className="label">Precio de Venta *</label>
              <input
                id="price"
                type="number"
                value={form.price || ''}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                required
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="minStock" className="label">Stock Mínimo</label>
              <input
                id="minStock"
                type="number"
                value={form.minStock || ''}
                onChange={(e) => set('minStock', parseInt(e.target.value) || 0)}
                className="input"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>
          {margin !== null && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              Margen estimado: <span className="font-bold">{margin}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={crear.isPending} className="btn btn-primary">
            <Save size={18} />
            {crear.isPending ? 'Guardando...' : 'Guardar Producto'}
          </button>
          <Link href="/inventario/productos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
