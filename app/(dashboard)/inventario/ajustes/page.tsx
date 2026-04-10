"use client";

import { useRef, useState } from "react";
import {
  ArrowDownUp,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useProductos,
  useDepositos,
  useAjustarStock,
  useTransferirStock,
} from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import EntitySearchBar from "@/components/EntitySearchBar";

type Tab = "ajuste" | "transferencia";

export default function AjustesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const { handleError, handleSuccess } = useApiToast();
  const [tab, setTab] = useState<Tab>("ajuste");

  const localId = isAllLocales ? "" : (selectedLocal?.id ?? "");

  const [productoSearchInput, setProductoSearchInput] = useState("");
  const [productoSearch, setProductoSearch] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProductoSearchChange = (val: string) => {
    setProductoSearchInput(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setProductoSearch(val), 300);
  };

  const { data: productosData } = useProductos({
    limit: 100,
    search: productoSearch || undefined,
  });
  const productos = productosData?.data ?? [];
  const { data: depositosData } = useDepositos(
    localId ? { localId } : undefined,
  );
  const depositos = depositosData?.data ?? [];

  // ── Ajuste ───────────────────────────────────────────────────
  const ajustarStock = useAjustarStock();
  const [ajuste, setAjuste] = useState({
    productoId: "",
    tipo: "AJUSTE_POSITIVO" as "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO",
    cantidad: "",
    depositoId: "",
    observaciones: "",
  });

  const setAj = (f: string, v: string) =>
    setAjuste((prev) => ({ ...prev, [f]: v }));

  const handleAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) {
      handleError(new Error("Seleccioná un local antes de realizar un ajuste."));
      return;
    }
    ajustarStock.mutate(
      {
        dto: {
          productoId: ajuste.productoId,
          tipo: ajuste.tipo,
          cantidad: parseFloat(ajuste.cantidad),
          depositoId: ajuste.depositoId || undefined,
          observaciones: ajuste.observaciones,
        },
        localId,
      },
      {
        onSuccess: () => {
          const nombreProducto = productos.find((p) => p.id === ajuste.productoId)?.name ?? "Producto";
          const tipoLabel = ajuste.tipo === "AJUSTE_POSITIVO" ? "Entrada" : "Salida";
          handleSuccess(`${tipoLabel} de ${ajuste.cantidad} ${nombreProducto} registrada correctamente`);
          setAjuste({
            productoId: "",
            tipo: "AJUSTE_POSITIVO",
            cantidad: "",
            depositoId: "",
            observaciones: "",
          });
        },
        onError: handleError,
      },
    );
  };

  // ── Transferencia ─────────────────────────────────────────────
  const transferirStock = useTransferirStock();
  const [transferencia, setTransferencia] = useState({
    productoId: "",
    localDestinoId: "",
    cantidad: "",
    observaciones: "",
  });

  const setTr = (f: string, v: string) =>
    setTransferencia((prev) => ({ ...prev, [f]: v }));

  const handleTransferencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) {
      handleError(new Error("Seleccioná un local de origen."));
      return;
    }
    transferirStock.mutate(
      {
        dto: {
          productoId: transferencia.productoId,
          localDestinoId: transferencia.localDestinoId,
          cantidad: parseFloat(transferencia.cantidad),
          observaciones: transferencia.observaciones || undefined,
        },
        localOrigenId: localId,
      },
      {
        onSuccess: () => {
          const nombreProducto = productos.find((p) => p.id === transferencia.productoId)?.name ?? "Producto";
          handleSuccess(`Transferencia de ${transferencia.cantidad} ${nombreProducto} realizada correctamente`);
          setTransferencia({
            productoId: "",
            localDestinoId: "",
            cantidad: "",
            observaciones: "",
          });
        },
        onError: handleError,
      },
    );
  };

  if (isAllLocales) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Seleccioná un local para realizar ajustes o transferencias.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowDownUp size={24} /> Ajustes de Stock
        </h1>
        <p className="text-slate-500">
          Ajuste manual o transferencia entre locales
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("ajuste")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "ajuste"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp size={16} className="inline mr-1" />
          Ajuste de Inventario
        </button>
        <button
          onClick={() => setTab("transferencia")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "transferencia"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ArrowRightLeft size={16} className="inline mr-1" />
          Transferencia entre Locales
        </button>
      </div>

      {/* Ajuste Tab */}
      {tab === "ajuste" && (
        <form onSubmit={handleAjuste} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ajuste Manual de Stock</h3>
              <p className="text-sm text-slate-500">
                Local: <strong>{selectedLocal?.name}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Buscar Producto</label>
                <EntitySearchBar
                  fields={[
                    { key: "codigo", label: "Código", type: "text" },
                    { key: "nombre", label: "Nombre", type: "text" },
                  ]}
                  onSearch={(_key, value) => handleProductoSearchChange(value)}
                />
              </div>

              <div>
                <label className="label">Producto *</label>
                <select
                  value={ajuste.productoId}
                  onChange={(e) => setAj("productoId", e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Tipo de Ajuste *</label>
                <select
                  value={ajuste.tipo}
                  onChange={(e) =>
                    setAj(
                      "tipo",
                      e.target.value as "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO",
                    )
                  }
                  required
                  className="input"
                >
                  <option value="AJUSTE_POSITIVO">
                    Ajuste Positivo (Entrada)
                  </option>
                  <option value="AJUSTE_NEGATIVO">
                    Ajuste Negativo (Salida)
                  </option>
                </select>
              </div>

              <div>
                <label className="label">Cantidad *</label>
                <input
                  type="number"
                  value={ajuste.cantidad}
                  onChange={(e) => setAj("cantidad", e.target.value)}
                  required
                  min="0.001"
                  step="0.001"
                  className="input"
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="label">Depósito</label>
                <select
                  value={ajuste.depositoId}
                  onChange={(e) => setAj("depositoId", e.target.value)}
                  className="input"
                >
                  <option value="">Sin depósito específico</option>
                  {depositos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Observaciones *</label>
                <textarea
                  value={ajuste.observaciones}
                  onChange={(e) => setAj("observaciones", e.target.value)}
                  required
                  rows={3}
                  className="input"
                  placeholder="Motivo del ajuste (ej: Corrección de conteo físico)"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={ajustarStock.isPending}
              className={`btn ${ajuste.tipo === "AJUSTE_POSITIVO" ? "btn-primary" : "btn-danger"}`}
            >
              {ajuste.tipo === "AJUSTE_POSITIVO" ? (
                <TrendingUp size={18} />
              ) : (
                <TrendingDown size={18} />
              )}
              {ajustarStock.isPending ? "Procesando..." : "Confirmar Ajuste"}
            </button>
          </div>
        </form>
      )}

      {/* Transferencia Tab */}
      {tab === "transferencia" && (
        <form onSubmit={handleTransferencia} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Transferencia entre Locales</h3>
              <p className="text-sm text-slate-500">
                Local de origen: <strong>{selectedLocal?.name}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Buscar Producto</label>
                <EntitySearchBar
                  fields={[
                    { key: "codigo", label: "Código", type: "text" },
                    { key: "nombre", label: "Nombre", type: "text" },
                  ]}
                  onSearch={(_key, value) => handleProductoSearchChange(value)}
                />
              </div>

              <div>
                <label className="label">Producto *</label>
                <select
                  value={transferencia.productoId}
                  onChange={(e) => setTr("productoId", e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Local Destino *</label>
                <input
                  type="text"
                  value={transferencia.localDestinoId}
                  onChange={(e) => setTr("localDestinoId", e.target.value)}
                  required
                  className="input"
                  placeholder="UUID del local destino"
                />
              </div>

              <div>
                <label className="label">Cantidad *</label>
                <input
                  type="number"
                  value={transferencia.cantidad}
                  onChange={(e) => setTr("cantidad", e.target.value)}
                  required
                  min="0.001"
                  step="0.001"
                  className="input"
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="label">Observaciones</label>
                <input
                  type="text"
                  value={transferencia.observaciones}
                  onChange={(e) => setTr("observaciones", e.target.value)}
                  className="input"
                  placeholder="Motivo de la transferencia (opcional)"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={transferirStock.isPending}
              className="btn btn-primary"
            >
              <ArrowRightLeft size={18} />
              {transferirStock.isPending
                ? "Procesando..."
                : "Confirmar Transferencia"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
