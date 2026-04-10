"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Warehouse } from "lucide-react";
import { useCreateDeposito } from "@/hooks/useInventario";
import { useLocales } from "@/hooks/useLocales";
import { useApiToast } from "@/hooks/useApiToast";

export default function NuevoDepositoPage() {
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();
  const createDeposito = useCreateDeposito();
  const { data: localesData } = useLocales({ limit: 100 });
  const locales = localesData?.data ?? [];

  const [form, setForm] = useState({
    localId: "",
    code: "",
    name: "",
    address: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeposito.mutate(
      {
        localId: form.localId,
        code: form.code,
        name: form.name,
        address: form.address || undefined,
      },
      {
        onSuccess: () => {
          handleSuccess("Depósito creado exitosamente");
          router.push("/inventario/depositos");
        },
        onError: handleError,
      },
    );
  };

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
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Depósito</h1>
          <p className="text-slate-600 mt-1">Crear un nuevo depósito de inventario</p>
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
                placeholder="DEP-A"
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
                placeholder="Depósito Principal"
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
                placeholder="Sector A, Planta Baja"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={createDeposito.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {createDeposito.isPending ? "Guardando..." : "Guardar Depósito"}
          </button>
          <Link href="/inventario/depositos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
