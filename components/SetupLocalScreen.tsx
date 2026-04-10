"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useCreateLocal } from "@/hooks/useLocales";
import { useUpdateUsuario } from "@/hooks/useUsuarios";
import { useAuth } from "@/contexts/AuthContext";
import type { Local } from "@/lib/api-types";

export default function SetupLocalScreen() {
  const { user } = useAuth();
  const crearLocal = useCreateLocal();
  const updateUsuario = useUpdateUsuario();

  const [form, setForm] = useState({ code: "", name: "", city: "", state: "", address: "", phone: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "saving">("form");

  const handleSubmit = async () => {
    setError("");
    if (!form.code.trim()) { setError("El código es obligatorio."); return; }
    if (!form.name.trim()) { setError("El nombre es obligatorio."); return; }
    if (!user) return;

    setStep("saving");

    crearLocal.mutate(
      {
        code:    form.code.trim(),
        name:    form.name.trim(),
        city:    form.city.trim()    || undefined,
        state:   form.state.trim()   || undefined,
        address: form.address.trim() || undefined,
        phone:   form.phone.trim()   || undefined,
      },
      {
        onSuccess: (newLocal: Local) => {
          updateUsuario.mutate(
            { id: user.id, dto: { localId: newLocal.id } },
            {
              onSuccess: () => {
                // Actualizar el usuario en localStorage con el nuevo localId
                const stored = localStorage.getItem("erp_user");
                if (stored) {
                  try {
                    const parsed = JSON.parse(stored);
                    parsed.localId = newLocal.id;
                    localStorage.setItem("erp_user", JSON.stringify(parsed));
                    // Limpiar el local seleccionado para que tome el nuevo
                    localStorage.removeItem("selectedLocalId");
                  } catch { /* ignorar */ }
                }
                window.location.reload();
              },
              onError: (err: unknown) => {
                setError((err as { message?: string })?.message ?? "Error al asignar el local al usuario.");
                setStep("form");
              },
            },
          );
        },
        onError: (err: unknown) => {
          setError((err as { message?: string })?.message ?? "Error al crear el local.");
          setStep("form");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <MapPin size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Configura tu primer local</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Antes de comenzar, crea el local o sucursal principal de tu empresa.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                placeholder="Ej: SUC-001"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                disabled={step === "saving"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                placeholder="Ej: Casa Central"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={step === "saving"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input
                className="input w-full"
                placeholder="Ej: Rosario"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={step === "saving"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
              <input
                className="input w-full"
                placeholder="Ej: Santa Fe"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                disabled={step === "saving"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              className="input w-full"
              placeholder="Ej: San Martín 456"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={step === "saving"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              className="input w-full"
              placeholder="Ej: 3415678901"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={step === "saving"}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="button"
            className="btn btn-primary w-full py-3 text-base"
            onClick={handleSubmit}
            disabled={step === "saving"}
          >
            {step === "saving" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Configurando...
              </span>
            ) : (
              "Crear local y comenzar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
