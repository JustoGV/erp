"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { useCrearPresupuesto } from "@/hooks/useVentas";
import { useClientes } from "@/hooks/useVentas";
import { useProductos } from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import { useLocal } from "@/contexts/LocalContext";

interface ItemRow {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

const emptyItem = (): ItemRow => ({
  productoId: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
});

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const { selectedLocal, isAllLocales } = useLocal();
  const { handleError, handleSuccess } = useApiToast();
  const crearPresupuesto = useCrearPresupuesto();

  const [clienteId, setClienteId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: clientesData } = useClientes({ localId, limit: 100 });
  const clientes = clientesData?.data ?? [];

  const { data: productosData } = useProductos({ localId, limit: 100, active: true });
  const productos = productosData?.data ?? [];

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === "productoId") {
        const prod = productos.find((p) => p.id === value);
        next[index] = {
          ...next[index],
          productoId: String(value),
          precioUnitario: prod?.price ?? next[index].precioUnitario,
        };
      } else {
        next[index] = { ...next[index], [field]: Number(value) };
      }
      return next;
    });
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, it) => {
    const base = it.cantidad * it.precioUnitario;
    return sum + base - (base * it.descuento) / 100;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocal || isAllLocales) {
      handleError(new Error("Selecciona un local antes de crear el presupuesto."));
      return;
    }
    if (!clienteId) {
      handleError(new Error("Selecciona un cliente."));
      return;
    }
    if (items.some((it) => !it.productoId)) {
      handleError(new Error("Todos los ítems deben tener un producto seleccionado."));
      return;
    }

    try {
      await crearPresupuesto.mutateAsync({
        dto: {
          clienteId,
          fechaVencimiento: fechaVencimiento || undefined,
          notas: notas || undefined,
          items: items.map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            precioUnitario: it.precioUnitario,
            descuento: it.descuento || undefined,
          })),
        },
        localId: selectedLocal.id,
      });
      handleSuccess("Presupuesto creado", "El presupuesto fue guardado correctamente.");
      router.push("/ventas/presupuestos");
    } catch (err) {
      handleError(err);
    }
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
        {/* Encabezado */}
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
              <label className="label">Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="input"
              >
                <option value="">— Seleccionar cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Fecha de Vencimiento</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="input resize-none"
                placeholder="Observaciones opcionales..."
              />
            </div>
          </div>
        </div>

        {/* Ítems */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title">Ítems</h3>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
              className="btn btn-secondary py-1.5 text-sm"
            >
              <Plus size={16} /> Agregar ítem
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th className="min-w-[220px]">Producto</th>
                  <th className="w-24">Cantidad</th>
                  <th className="w-32">Precio unit.</th>
                  <th className="w-24">Dto. %</th>
                  <th className="w-28 text-right">Subtotal</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const base = it.cantidad * it.precioUnitario;
                  const sub = base - (base * it.descuento) / 100;
                  return (
                    <tr key={i}>
                      <td>
                        <select
                          value={it.productoId}
                          onChange={(e) => updateItem(i, "productoId", e.target.value)}
                          required
                          className="input py-1.5 text-sm"
                        >
                          <option value="">— Producto —</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.cantidad}
                          onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                          min="1"
                          step="1"
                          required
                          className="input py-1.5 text-sm"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.precioUnitario}
                          onChange={(e) => updateItem(i, "precioUnitario", e.target.value)}
                          min="0"
                          step="0.01"
                          required
                          className="input py-1.5 text-sm"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.descuento}
                          onChange={(e) => updateItem(i, "descuento", e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="input py-1.5 text-sm"
                        />
                      </td>
                      <td className="text-right font-semibold">
                        ${sub.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          disabled={items.length === 1}
                          className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                          title="Eliminar ítem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-semibold py-3 text-slate-700">
                    Total estimado:
                  </td>
                  <td className="text-right font-bold text-slate-900">
                    ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={crearPresupuesto.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {crearPresupuesto.isPending ? "Guardando..." : "Guardar Presupuesto"}
          </button>
          <Link href="/ventas/presupuestos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
