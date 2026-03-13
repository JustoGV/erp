const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "app", "(dashboard)");

const files = {
  // ── VENTAS / FACTURAS ──────────────────────────────────────
  "ventas/facturas/page.tsx": `"use client";

import { useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useFacturas } from "@/hooks/useVentas";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  PARCIAL: { class: "badge-info", label: "Parcial" },
  PAGADA: { class: "badge-success", label: "Pagada" },
  VENCIDA: { class: "badge-danger", label: "Vencida" },
  ANULADA: { class: "badge-secondary", label: "Anulada" },
};

export default function FacturasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFacturas({ localId, page, limit: 20, search: search || undefined });
  const facturas = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={24} /> Facturas
          </h1>
          <p className="text-slate-500">{total} facturas registradas</p>
        </div>
        <Link href="/ventas/facturas/nueva" className="btn btn-primary">
          <Plus size={18} /> Nueva Factura
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar facturas..."
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : facturas.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron facturas.</td></tr>
              ) : (
                facturas.map((f) => {
                  const est = ESTADO_CONFIG[f.estado] ?? { class: "badge-secondary", label: f.estado };
                  return (
                    <tr key={f.id} className="table-row-hover">
                      <td className="font-mono text-xs">{f.numero}</td>
                      <td className="font-medium">{f.cliente?.name ?? "—"}</td>
                      <td>{new Date(f.fecha).toLocaleDateString()}</td>
                      <td>{f.fechaVencimiento ? new Date(f.fechaVencimiento).toLocaleDateString() : "—"}</td>
                      <td className="text-right font-semibold">\${f.total?.toLocaleString()}</td>
                      <td><span className={\`badge \${est.class}\`}>{est.label}</span></td>
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

  // ── VENTAS / PEDIDOS ───────────────────────────────────────
  "ventas/pedidos/page.tsx": `"use client";

import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { usePedidos } from "@/hooks/useVentas";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  CONFIRMADO: { class: "badge-info", label: "Confirmado" },
  EN_PREPARACION: { class: "badge-info", label: "En preparación" },
  LISTO: { class: "badge-success", label: "Listo" },
  ENVIADO: { class: "badge-info", label: "Enviado" },
  ENTREGADO: { class: "badge-success", label: "Entregado" },
  CANCELADO: { class: "badge-danger", label: "Cancelado" },
};

export default function PedidosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePedidos({ localId, page, limit: 20, search: search || undefined });
  const pedidos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList size={24} /> Pedidos de Venta
        </h1>
        <p className="text-slate-500">{total} pedidos registrados</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Vendedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : pedidos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron pedidos.</td></tr>
              ) : (
                pedidos.map((p) => {
                  const est = ESTADO_CONFIG[p.estado] ?? { class: "badge-secondary", label: p.estado };
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="font-mono text-xs">{p.numero}</td>
                      <td className="font-medium">{p.cliente?.name ?? "—"}</td>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td className="text-right font-semibold">\${p.total?.toLocaleString()}</td>
                      <td>{p.vendedor ?? "—"}</td>
                      <td><span className={\`badge \${est.class}\`}>{est.label}</span></td>
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

  // ── VENTAS / PRESUPUESTOS ──────────────────────────────────
  "ventas/presupuestos/page.tsx": `"use client";

import { useState } from "react";
import { FileSpreadsheet, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { usePresupuestos } from "@/hooks/useVentas";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  BORRADOR: { class: "badge-secondary", label: "Borrador" },
  ENVIADO: { class: "badge-info", label: "Enviado" },
  APROBADO: { class: "badge-success", label: "Aprobado" },
  RECHAZADO: { class: "badge-danger", label: "Rechazado" },
  VENCIDO: { class: "badge-warning", label: "Vencido" },
};

export default function PresupuestosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePresupuestos({ localId, page, limit: 20, search: search || undefined });
  const presupuestos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={24} /> Presupuestos
          </h1>
          <p className="text-slate-500">{total} presupuestos registrados</p>
        </div>
        <Link href="/ventas/presupuestos/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Presupuesto
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar presupuestos..."
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Vendedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : presupuestos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron presupuestos.</td></tr>
              ) : (
                presupuestos.map((p) => {
                  const est = ESTADO_CONFIG[p.estado] ?? { class: "badge-secondary", label: p.estado };
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="font-mono text-xs">{p.numero}</td>
                      <td className="font-medium">{p.cliente?.name ?? "—"}</td>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td>{p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString() : "—"}</td>
                      <td className="text-right font-semibold">\${p.total?.toLocaleString()}</td>
                      <td>{p.vendedor ?? "—"}</td>
                      <td><span className={\`badge \${est.class}\`}>{est.label}</span></td>
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

  // ── COMPRAS / PROVEEDORES ──────────────────────────────────
  "compras/proveedores/page.tsx": `"use client";

import { useState } from "react";
import { Truck, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProveedores } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function ProveedoresPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProveedores({ localId, page, limit: 20, search: search || undefined });
  const proveedores = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck size={24} /> Proveedores
          </h1>
          <p className="text-slate-500">{total} proveedores registrados</p>
        </div>
        <Link href="/compras/proveedores/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Proveedor
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar proveedores..."
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
                <th>CUIT / RUT</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Cond. Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : proveedores.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron proveedores.</td></tr>
              ) : (
                proveedores.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.taxId ?? "—"}</td>
                    <td>{p.email ?? "—"}</td>
                    <td>{p.phone ?? "—"}</td>
                    <td>{p.paymentTerms ?? "—"}</td>
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

  // ── COMPRAS / REQUERIMIENTOS ────────────────────────────────
  "compras/requerimientos/page.tsx": `"use client";

import { useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useRequerimientos } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  AUTORIZADO: { class: "badge-success", label: "Autorizado" },
  RECHAZADO: { class: "badge-danger", label: "Rechazado" },
  COMPLETADO: { class: "badge-info", label: "Completado" },
  CANCELADO: { class: "badge-secondary", label: "Cancelado" },
};

export default function RequerimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRequerimientos({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck size={24} /> Requerimientos de Compra
        </h1>
        <p className="text-slate-500">{total} requerimientos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Solicitante</th>
                <th>Departamento</th>
                <th>Fecha Necesidad</th>
                <th>Ítems</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron requerimientos.</td></tr>
              ) : (
                items.map((r) => {
                  const est = ESTADO_CONFIG[r.estado] ?? { class: "badge-secondary", label: r.estado };
                  return (
                    <tr key={r.id} className="table-row-hover">
                      <td className="font-mono text-xs">{r.numero}</td>
                      <td className="font-medium">{r.solicitante}</td>
                      <td>{r.departamento}</td>
                      <td>{new Date(r.fechaNecesidad).toLocaleDateString()}</td>
                      <td className="text-center">{r._count?.items ?? "—"}</td>
                      <td><span className={\`badge \${est.class}\`}>{est.label}</span></td>
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

  // ── COMPRAS / RECEPCIONES ──────────────────────────────────
  "compras/recepciones/page.tsx": `"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useRecepciones } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function RecepcionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecepciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PackageCheck size={24} /> Recepciones de Compra
        </h1>
        <p className="text-slate-500">{total} recepciones registradas</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>OC Nº</th>
                <th>Proveedor</th>
                <th>Nº Remito</th>
                <th>Fecha</th>
                <th>Creado por</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron recepciones.</td></tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="table-row-hover">
                    <td className="font-mono text-xs">{r.ordenCompra?.numero ?? "—"}</td>
                    <td className="font-medium">{r.ordenCompra?.proveedor?.name ?? "—"}</td>
                    <td>{r.nroRemito ?? "—"}</td>
                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td>{r.creadoPor}</td>
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

  // ── COMPRAS / PAGOS ────────────────────────────────────────
  "compras/pagos/page.tsx": `"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { usePagosProveedor } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function PagosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePagosProveedor({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Banknote size={24} /> Pagos a Proveedores
        </h1>
        <p className="text-slate-500">{total} pagos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>OC Nº</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron pagos.</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-medium">{p.ordenCompra?.proveedor?.name ?? "—"}</td>
                    <td className="font-mono text-xs">{p.ordenCompra?.numero ?? "—"}</td>
                    <td>{new Date(p.fecha).toLocaleDateString()}</td>
                    <td className="text-right font-semibold">\${p.monto?.toLocaleString()}</td>
                    <td>{p.metodoPago}</td>
                    <td>{p.referencia ?? "—"}</td>
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
};

for (const [rel, content] of Object.entries(files)) {
  const filePath = path.join(base, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Wrote:", rel);
}
console.log("Batch 2 done (Ventas + Compras)");
