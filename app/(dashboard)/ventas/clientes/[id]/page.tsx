"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useCliente, useActualizarCliente } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

export default function EditarClientePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { handleError, handleSuccess } = useApiToast();
  const { data, isLoading, isError, error } = useCliente(id);
  const actualizarCliente = useActualizarCliente();

  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    creditLimit: 0,
    active: true,
  });

  useEffect(() => {
    if (isError) handleError(error);
  }, [isError, error, handleError]);

  useEffect(() => {
    const cliente = data?.data;
    if (!cliente) return;
    setFormData({
      name: cliente.name,
      taxId: cliente.taxId ?? "",
      email: cliente.email ?? "",
      phone: cliente.phone ?? "",
      address: cliente.address ?? "",
      city: cliente.city ?? "",
      state: cliente.state ?? "",
      creditLimit: cliente.creditLimit ?? 0,
      active: cliente.active,
    });
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actualizarCliente.mutateAsync({
        id,
        dto: {
          name: formData.name,
          taxId: formData.taxId || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          creditLimit: Number(formData.creditLimit) || 0,
          active: formData.active,
        },
      });
      handleSuccess("Cliente actualizado", "Los cambios fueron guardados.");
      router.push("/ventas/clientes");
    } catch (err) {
      handleError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Cargando cliente...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/ventas/clientes"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Editar Cliente</h1>
          {data?.data.code && (
            <p className="text-slate-500 mt-1 text-sm">
              Código: <span className="font-mono font-semibold text-slate-700">{data.data.code}</span>
              <span className="ml-2 text-xs text-slate-400">(generado automáticamente)</span>
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="card-title">Información Básica</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">Código (solo lectura)</label>
              <input
                type="text"
                value={data?.data.code ?? ""}
                readOnly
                className="input bg-slate-50 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="label">Nombre / Razón Social *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">CUIT / DNI</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="input"
                placeholder="20-12345678-9"
              />
            </div>

            <div>
              <label className="label">
                <CreditCard size={16} className="inline mr-1" />
                Límite de Crédito
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  className="input pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="active" className="label mb-0 cursor-pointer">
                Cliente activo
              </label>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Mail size={20} />
              </div>
              <h3 className="card-title">Contacto</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <Mail size={16} className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="contacto@empresa.com"
              />
            </div>

            <div>
              <label className="label">
                <Phone size={16} className="inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="card-title">Dirección</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="label">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Av. Corrientes 1234"
              />
            </div>

            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                placeholder="Buenos Aires"
              />
            </div>

            <div>
              <label className="label">Provincia</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input"
                placeholder="CABA"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={actualizarCliente.isPending}
            className="btn btn-primary"
          >
            <Save size={18} />
            {actualizarCliente.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
          <Link href="/ventas/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
