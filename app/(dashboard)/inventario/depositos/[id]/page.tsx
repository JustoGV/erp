"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Warehouse } from "lucide-react";
import { useDeposito, useUpdateDeposito } from "@/hooks/useInventario";
import { useLocales } from "@/hooks/useLocales";
import { useApiToast } from "@/hooks/useApiToast";

export default function EditarDepositoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();

  const { data: deposito, isLoading } = useDeposito(id);
  const { data: localesData } = useLocales({ limit: 100 });
  const locales = localesData?.data ?? [];
  const updateDeposito = useUpdateDeposito();

  const [form, setForm] = useState({
    localId: "",
    code: "",
    name: "",
    address: "",
    active: true,
  });

  useEffect(() => {
    if (deposito) {
      setForm({
        localId: deposito.localId,
        code: deposito.code,
        name: deposito.name,
        address: deposito.address ?? "",
        active: deposito.active,
      });
    }
  }, [deposito]);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeposito.mutate(
      {
        id,
        dto: {
          localId: form.localId,
          code: form.code,
          name: form.name,
          address: form.address || undefined,
          active: form.active,
        },
      },
      {
        onSuccess: () => {
          handleSuccess("Depósito actualizado exitosamente");
          router.push("/inventario/depositos");
        },
        onError: handleError,
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Cargando depósito...
      </div>
    );
  }

  if (!deposito) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Depósito no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/inventario/depositos"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Editar Depósito</h1>
          <p className="text-slate-600 mt-1">{deposito.code} — {deposito.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Warehouse size={20} />
              </div>
              <h3 className="card-title">Datos del Depósito</h3>
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
                maxLength={20}
                className="input"
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
              />
            </div>

            <div>
              <label className="label">Local *</label>
              <select
                value={form.localId}
                onChange={(e) => set("localId", e.target.value)}
                required
                className="input"
              >
                <option value="">Seleccionar local...</option>
                {locales.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Dirección</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                maxLength={300}
                className="input"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="label mb-0 cursor-pointer">
                Depósito activo
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateDeposito.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {updateDeposito.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
          <Link href="/inventario/depositos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
