"use client";

import { useMemo, useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { useCobranzas, useCrearCobranza, useFacturas } from "@/hooks/useVentas";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";

export default function CobranzasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const { handleError, handleSuccess } = useApiToast();
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const crearCobranza = useCrearCobranza();
  const [formState, setFormState] = useState({
    facturaId: "",
    fecha: "",
    monto: 0,
    metodoPago: "",
    referencia: "",
    notas: "",
  });

  const cobranzasQuery = useCobranzas({
    page,
    limit: pageSize,
    localId: isAllLocales ? undefined : selectedLocal?.id,
  });

  if (cobranzasQuery.isError) {
    handleError(cobranzasQuery.error);
  }

  const facturasQuery = useFacturas({
    page: 1,
    limit: 100,
    localId: isAllLocales ? undefined : selectedLocal?.id,
  });

  if (facturasQuery.isError) {
    handleError(facturasQuery.error);
  }

  const cobranzas = cobranzasQuery.data?.data ?? [];
  const totalPages = cobranzasQuery.data?.meta?.totalPages ?? 1;

  const facturas = facturasQuery.data?.data ?? [];
  const facturasById = useMemo(
    () => new Map(facturas.map((factura) => [factura.id, factura])),
    [facturas],
  );

  const openCreate = () => {
    setFormState({
      facturaId: "",
      fecha: "",
      monto: 0,
      metodoPago: "",
      referencia: "",
      notas: "",
    });
    setFormOpen(true);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.facturaId) {
      handleError(new Error("Selecciona una factura."));
      return;
    }

    try {
      await crearCobranza.mutateAsync({
        facturaId: formState.facturaId,
        monto: Number(formState.monto) || 0,
        metodoPago: formState.metodoPago,
        fecha: formState.fecha || undefined,
        referencia: formState.referencia || undefined,
        notas: formState.notas || undefined,
      });
      handleSuccess("Cobranza registrada", "La cobranza fue guardada.");
      setFormOpen(false);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cobranzas</h1>
          <p className="text-gray-600 mt-1">Gestión de cobros a clientes</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nueva cobranza
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cobranzasQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                  Cargando cobranzas...
                </td>
              </tr>
            ) : cobranzas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                  No hay cobranzas registradas.
                </td>
              </tr>
            ) : (
              cobranzas.map((cobranza) => {
                const factura = facturasById.get(cobranza.facturaId);
                return (
                  <tr key={cobranza.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {factura?.numero ?? cobranza.facturaId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {factura?.cliente?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cobranza.fecha}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cobranza.metodoPago}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ${formatCurrency(cobranza.monto)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={formOpen}
        title="Crear cobranza"
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Factura</label>
            <select
              value={formState.facturaId}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  facturaId: event.target.value,
                }))
              }
              className="input"
              required
              disabled={facturasQuery.isLoading}
            >
              <option value="">
                {facturasQuery.isLoading
                  ? "Cargando facturas..."
                  : "Seleccionar factura"}
              </option>
              {facturas.map((factura) => (
                <option key={factura.id} value={factura.id}>
                  {factura.numero} — {factura.cliente?.name ?? factura.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              value={formState.fecha}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, fecha: event.target.value }))
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Método</label>
            <input
              value={formState.metodoPago}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  metodoPago: event.target.value,
                }))
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Monto</label>
            <input
              type="number"
              value={formState.monto}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  monto: Number(event.target.value),
                }))
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Referencia</label>
            <input
              value={formState.referencia}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  referencia: event.target.value,
                }))
              }
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notas</label>
            <input
              value={formState.notas}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, notas: event.target.value }))
              }
              className="input"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={crearCobranza.isPending}>
              {crearCobranza.isPending ? "Guardando..." : "Crear cobranza"}
            </button>
          </div>
        </form>
      </Modal>
      {!formOpen && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">
                Panel de cobranzas
              </h3>
              <p className="text-sm text-emerald-700">
                Las cobranzas se registran sobre facturas emitidas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
