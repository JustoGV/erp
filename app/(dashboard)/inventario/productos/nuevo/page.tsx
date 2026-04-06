"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Package } from "lucide-react";
import { useCreateProducto, useCategorias } from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import type { TipoProducto } from "@/lib/api-types";

const TIPOS: { value: TipoProducto; label: string }[] = [
  { value: "TERMINADO", label: "Producto Terminado" },
  { value: "SEMI_TERMINADO", label: "Semi Terminado" },
  { value: "MATERIA_PRIMA", label: "Materia Prima" },
  { value: "INSUMO", label: "Insumo" },
];

const UNIDADES = ["UNI", "KG", "LT", "MT", "CM", "M2", "DOC", "CJA", "PKT"];

export default function NuevoProductoPage() {
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();
  const createProducto = useCreateProducto();
  const { data: categoriasData } = useCategorias({ limit: 100 });
  const categorias = categoriasData?.data ?? [];

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    tipo: "TERMINADO" as TipoProducto,
    unit: "UNI",
    cost: "",
    price: "",
    minStock: "0",
    categoriaId: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProducto.mutate(
      {
        code: form.code,
        name: form.name,
        description: form.description || undefined,
        tipo: form.tipo,
        unit: form.unit,
        cost: parseFloat(form.cost),
        price: parseFloat(form.price),
        minStock: parseInt(form.minStock, 10),
        categoriaId: form.categoriaId || undefined,
      },
      {
        onSuccess: () => {
          handleSuccess("Producto creado exitosamente");
          router.push("/inventario/productos");
        },
        onError: handleError,
      },
    );
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
          <p className="text-slate-600 mt-1">Define los datos del producto</p>
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
              <label className="label">Código *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                required
                maxLength={30}
                className="input"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                maxLength={150}
                className="input"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="label">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value)}
                required
                className="input"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Categoría</label>
              <select
                value={form.categoriaId}
                onChange={(e) => set("categoriaId", e.target.value)}
                className="input"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Unidad de Medida *</label>
              <select
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                required
                className="input"
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Stock Mínimo *</label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => set("minStock", e.target.value)}
                required
                min="0"
                className="input"
              />
            </div>

            <div>
              <label className="label">Costo *</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => set("cost", e.target.value)}
                required
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label">Precio de Venta *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={500}
                rows={3}
                className="input"
                placeholder="Descripción opcional del producto"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={createProducto.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {createProducto.isPending ? "Guardando..." : "Guardar Producto"}
          </button>
          <Link href="/inventario/productos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
