const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "app", "(dashboard)");

const files = {
  // ── DASHBOARD ──────────────────────────────────────────────
  "dashboard/page.tsx": `"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useDashboardKPIs } from "@/hooks/useReportes";
import { useFacturas } from "@/hooks/useVentas";
import { useAlertasStock } from "@/hooks/useInventario";

export default function DashboardPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: kpisData, isLoading: loadingKpis } = useDashboardKPIs();
  const { data: facturasData, isLoading: loadingFacturas } = useFacturas({ localId, limit: 4 });
  const { data: alertas, isLoading: loadingAlertas } = useAlertasStock(localId);

  const kpis = kpisData?.data;
  const facturas = facturasData?.data ?? [];
  const alertasList = alertas ?? [];
  const isLoading = loadingKpis;

  const localName = isAllLocales ? "Todos los locales" : selectedLocal?.name || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={16} />
              <span className="font-medium">{localName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ventas del Mes"
            value={\`$\${(kpis?.ventasMes?.total ?? 0).toLocaleString()}\`}
            subtitle={\`\${kpis?.ventasMes?.cantidad ?? 0} facturas\`}
            icon={<DollarSign size={24} />}
            gradient="from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Compras del Mes"
            value={\`$\${(kpis?.comprasMes?.total ?? 0).toLocaleString()}\`}
            subtitle={\`\${kpis?.comprasMes?.cantidad ?? 0} órdenes\`}
            icon={<ShoppingCart size={24} />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Alertas de Stock"
            value={(kpis?.stockAlertas ?? 0).toString()}
            subtitle={\`\${kpis?.ordenesProdPendientes ?? 0} órdenes prod. pendientes\`}
            icon={<Package size={24} />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Empleados Activos"
            value={(kpis?.empleadosActivos ?? 0).toString()}
            subtitle={\`\${kpis?.cxcVencidas ?? 0} CxC vencidas\`}
            icon={<Users size={24} />}
            gradient="from-orange-500 to-orange-600"
          />
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Facturas Recientes</h3>
            <a href="/ventas/facturas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todas <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loadingFacturas ? (
                  <tr><td colSpan={4} className="text-center py-10">Cargando...</td></tr>
                ) : facturas.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">Sin facturas recientes.</td></tr>
                ) : (
                  facturas.slice(0, 4).map((f) => (
                    <tr key={f.id} className="table-row-hover">
                      <td className="font-mono text-xs">{f.numero}</td>
                      <td className="font-medium">{f.cliente?.name ?? "—"}</td>
                      <td className="font-semibold">\${f.total?.toLocaleString()}</td>
                      <td><FacturaEstado estado={f.estado} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alertas de Stock</h3>
            {alertasList.length > 0 && <span className="badge badge-danger">{alertasList.length}</span>}
          </div>
          <div className="space-y-3">
            {loadingAlertas ? (
              <p className="text-center py-10 text-slate-400">Cargando...</p>
            ) : alertasList.length === 0 ? (
              <p className="text-center py-10 text-slate-400">Sin alertas de stock.</p>
            ) : (
              alertasList.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <AlertTriangle size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">{a.productoNombre}</p>
                    <p className="text-xs text-amber-600">{a.localNombre} — Stock: {a.stockActual} / Mín: {a.stockMinimo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, gradient }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className={\`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br \${gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300\`} />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={\`stat-icon bg-gradient-to-br \${gradient} text-white shadow-lg\`}>{icon}</div>
      </div>
    </div>
  );
}

function FacturaEstado({ estado }: { estado: string }) {
  const config: Record<string, { class: string; label: string }> = {
    PENDIENTE: { class: "badge-warning", label: "Pendiente" },
    PARCIAL: { class: "badge-info", label: "Parcial" },
    PAGADA: { class: "badge-success", label: "Pagada" },
    VENCIDA: { class: "badge-danger", label: "Vencida" },
    ANULADA: { class: "badge-secondary", label: "Anulada" },
  };
  const c = config[estado] ?? { class: "badge-secondary", label: estado };
  return <span className={\`badge \${c.class}\`}>{c.label}</span>;
}
`,

  // ── INVENTARIO / PRODUCTOS ─────────────────────────────────
  "inventario/productos/page.tsx": `"use client";

import { useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProductos, useCategorias } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

export default function ProductosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProductos({ localId, page, limit: 20, search: search || undefined });
  const { data: categorias } = useCategorias();

  const productos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">{total} productos registrados</p>
        </div>
        <Link href="/inventario/productos/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Producto
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Costo</th>
                <th>Stock</th>
                <th>Mín.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No se encontraron productos.</td></tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.categoria?.name ?? "—"}</td>
                    <td className="text-right">\${p.price?.toLocaleString()}</td>
                    <td className="text-right">\${p.cost?.toLocaleString()}</td>
                    <td className={\`text-right font-semibold \${(p.stockTotal ?? 0) <= (p.minStock ?? 0) ? "text-red-600" : "text-slate-900"}\`}>
                      {p.stockTotal ?? 0}
                    </td>
                    <td className="text-right">{p.minStock ?? 0}</td>
                    <td>
                      <span className={\`badge \${p.active ? "badge-success" : "badge-secondary"}\`}>
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
`,

  // ── INVENTARIO / MOVIMIENTOS ───────────────────────────────
  "inventario/movimientos/page.tsx": `"use client";

import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useMovimientosStock } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

const TIPO_LABEL: Record<string, { label: string; class: string }> = {
  ENTRADA: { label: "Entrada", class: "badge-success" },
  SALIDA: { label: "Salida", class: "badge-danger" },
  AJUSTE: { label: "Ajuste", class: "badge-warning" },
  TRANSFERENCIA: { label: "Transferencia", class: "badge-info" },
};

export default function MovimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMovimientosStock({ localId, page, limit: 20 });
  const movimientos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowDownUp size={24} /> Movimientos de Stock
        </h1>
        <p className="text-slate-500">{total} movimientos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron movimientos.</td></tr>
              ) : (
                movimientos.map((m) => {
                  const tipo = TIPO_LABEL[m.tipo] ?? { label: m.tipo, class: "badge-secondary" };
                  return (
                    <tr key={m.id} className="table-row-hover">
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td><span className={\`badge \${tipo.class}\`}>{tipo.label}</span></td>
                      <td className="font-medium">{m.producto?.name ?? m.productoId}</td>
                      <td className="text-right font-semibold">{m.cantidad}</td>
                      <td>{m.local?.name ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
`,

  // ── INVENTARIO / DEPOSITOS ─────────────────────────────────
  "inventario/depositos/page.tsx": `"use client";

import { useState } from "react";
import { Warehouse, Search } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useDepositos } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

export default function DepositosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useDepositos({ localId, page, limit: 20, search: search || undefined });
  const depositos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Warehouse size={24} /> Depósitos
        </h1>
        <p className="text-slate-500">{total} depósitos registrados</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar depósitos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Cargando...</td></tr>
              ) : depositos.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">No se encontraron depósitos.</td></tr>
              ) : (
                depositos.map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="font-mono text-xs">{d.code}</td>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.address ?? "—"}</td>
                    <td>
                      <span className={\`badge \${d.active ? "badge-success" : "badge-secondary"}\`}>
                        {d.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
`,

  // ── INVENTARIO / ALERTAS ───────────────────────────────────
  "inventario/alertas/page.tsx": `"use client";

import { AlertTriangle } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAlertasStock } from "@/hooks/useInventario";

export default function AlertasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: alertas, isLoading } = useAlertasStock(localId);
  const items = alertas ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={24} /> Alertas de Stock
        </h1>
        <p className="text-slate-500">{items.length} productos bajo stock mínimo</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Local</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No hay alertas de stock.</td></tr>
              ) : (
                items.map((a, i) => (
                  <tr key={i} className="table-row-hover">
                    <td>
                      <div>
                        <p className="font-medium">{a.productoNombre}</p>
                        <p className="text-xs text-slate-500">{a.productoCodigo}</p>
                      </div>
                    </td>
                    <td>{a.localNombre}</td>
                    <td className="text-right font-semibold text-red-600">{a.stockActual}</td>
                    <td className="text-right">{a.stockMinimo}</td>
                    <td className="text-right font-semibold text-red-600">-{a.diferencia}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
};

for (const [rel, content] of Object.entries(files)) {
  const filePath = path.join(base, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Wrote:", rel);
}
console.log("Batch 1 done (Dashboard + Inventario)");
