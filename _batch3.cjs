const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "app", "(dashboard)");

const files = {
  // ── RRHH / EMPLEADOS ───────────────────────────────────────
  "rrhh/empleados/page.tsx": `"use client";

import { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useEmpleados } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function EmpleadosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useEmpleados({ localId, page, limit: 20, search: search || undefined });
  const empleados = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} /> Empleados
          </h1>
          <p className="text-slate-500">{total} empleados registrados</p>
        </div>
        <Link href="/rrhh/empleados/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Empleado
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar empleados..."
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
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Email</th>
                <th>Ingreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : empleados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron empleados.</td></tr>
              ) : (
                empleados.map((e) => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="font-mono text-xs">{e.code}</td>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.position}</td>
                    <td>{e.department}</td>
                    <td>{e.email ?? "—"}</td>
                    <td>{new Date(e.hireDate).toLocaleDateString()}</td>
                    <td>
                      <span className={\`badge \${e.active ? "badge-success" : "badge-secondary"}\`}>
                        {e.active ? "Activo" : "Inactivo"}
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

  // ── RRHH / ASISTENCIAS ─────────────────────────────────────
  "rrhh/asistencias/page.tsx": `"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAsistencias } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function AsistenciasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAsistencias({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck size={24} /> Asistencias
        </h1>
        <p className="text-slate-500">{total} registros</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado ID</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Ausente</th>
                <th>Justificado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron registros.</td></tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td>{new Date(a.fecha).toLocaleDateString()}</td>
                    <td className="font-mono text-xs">{a.empleadoId}</td>
                    <td>{a.entrada ?? "—"}</td>
                    <td>{a.salida ?? "—"}</td>
                    <td>
                      {a.ausente ? (
                        <span className="badge badge-danger">Sí</span>
                      ) : (
                        <span className="badge badge-success">No</span>
                      )}
                    </td>
                    <td>
                      {a.justificado ? (
                        <span className="badge badge-info">Sí</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
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

  // ── RRHH / HORAS ───────────────────────────────────────────
  "rrhh/horas/page.tsx": `"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useHoras } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function HorasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useHoras({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock size={24} /> Registro de Horas
        </h1>
        <p className="text-slate-500">{total} registros</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado ID</th>
                <th>Horas Normales</th>
                <th>Horas Extra</th>
                <th>Total</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron registros.</td></tr>
              ) : (
                items.map((h) => (
                  <tr key={h.id} className="table-row-hover">
                    <td>{new Date(h.fecha).toLocaleDateString()}</td>
                    <td className="font-mono text-xs">{h.empleadoId}</td>
                    <td className="text-right">{h.horasNormales}</td>
                    <td className="text-right font-semibold text-blue-600">{h.horasExtra}</td>
                    <td className="text-right font-bold">{h.horasNormales + h.horasExtra}</td>
                    <td className="truncate max-w-[200px]">{h.descripcion ?? "—"}</td>
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

  // ── RRHH / LIQUIDACIONES ───────────────────────────────────
  "rrhh/liquidaciones/page.tsx": `"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useLiquidaciones } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function LiquidacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLiquidaciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt size={24} /> Liquidaciones de Sueldo
        </h1>
        <p className="text-slate-500">{total} liquidaciones</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Período</th>
                <th>Sueldo Bruto</th>
                <th>Deducciones</th>
                <th>Neto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron liquidaciones.</td></tr>
              ) : (
                items.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td className="font-medium">{l.empleado?.name ?? l.empleadoId}</td>
                    <td>{l.periodo}</td>
                    <td className="text-right">\${l.sueldoBruto?.toLocaleString()}</td>
                    <td className="text-right text-red-600">\${l.deducciones?.toLocaleString()}</td>
                    <td className="text-right font-semibold">\${l.sueldoNeto?.toLocaleString()}</td>
                    <td>
                      <span className={\`badge \${l.estado === "APROBADA" ? "badge-success" : "badge-warning"}\`}>
                        {l.estado === "APROBADA" ? "Aprobada" : "Borrador"}
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

  // ── PRODUCCION / ORDENES ───────────────────────────────────
  "produccion/ordenes/page.tsx": `"use client";

import { useState } from "react";
import { Factory, Plus } from "lucide-react";
import Link from "next/link";
import { useOrdenesProduccion } from "@/hooks/useProduccion";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PLANIFICADA: { class: "badge-secondary", label: "Planificada" },
  EN_PROCESO: { class: "badge-info", label: "En proceso" },
  COMPLETADA: { class: "badge-success", label: "Completada" },
  CANCELADA: { class: "badge-danger", label: "Cancelada" },
};

export default function OrdenesProduccionPage() {
  const { data, isLoading } = useOrdenesProduccion();
  const ordenes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Factory size={24} /> Órdenes de Producción
          </h1>
          <p className="text-slate-500">{ordenes.length} órdenes</p>
        </div>
        <Link href="/produccion/ordenes/nueva" className="btn btn-primary">
          <Plus size={18} /> Nueva Orden
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Producto</th>
                <th>Cant. Plan.</th>
                <th>Cant. Real.</th>
                <th>Operador</th>
                <th>F. Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : ordenes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron órdenes.</td></tr>
              ) : (
                ordenes.map((o) => {
                  const est = ESTADO_CONFIG[o.estado] ?? { class: "badge-secondary", label: o.estado };
                  return (
                    <tr key={o.id} className="table-row-hover">
                      <td className="font-mono text-xs">{o.numero}</td>
                      <td className="font-medium">{o.bom?.producto?.name ?? "—"}</td>
                      <td className="text-right">{o.cantidadPlanificada}</td>
                      <td className="text-right">{o.cantidadRealizada ?? 0}</td>
                      <td>{o.operador ?? "—"}</td>
                      <td>{o.fechaInicio ? new Date(o.fechaInicio).toLocaleDateString() : "—"}</td>
                      <td><span className={\`badge \${est.class}\`}>{est.label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,

  // ── PRODUCCION / BOM ───────────────────────────────────────
  "produccion/bom/page.tsx": `"use client";

import { Layers } from "lucide-react";
import { useBOMs } from "@/hooks/useProduccion";

export default function BOMPage() {
  const { data, isLoading } = useBOMs();
  const boms = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers size={24} /> Lista de Materiales (BOM)
        </h1>
        <p className="text-slate-500">{boms.length} BOMs registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto Terminado</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Costo Estimado</th>
                <th>Materiales</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : boms.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron BOMs.</td></tr>
              ) : (
                boms.map((b) => (
                  <tr key={b.id} className="table-row-hover">
                    <td className="font-mono text-xs">{b.code}</td>
                    <td className="font-medium">{b.producto?.name ?? "—"}</td>
                    <td className="text-right">{b.cantidad}</td>
                    <td>{b.unidad}</td>
                    <td className="text-right">\${b.costoEstimado?.toLocaleString() ?? "—"}</td>
                    <td className="text-center">{b.materiales?.length ?? 0}</td>
                    <td>
                      <span className={\`badge \${b.activo ? "badge-success" : "badge-secondary"}\`}>
                        {b.activo ? "Sí" : "No"}
                      </span>
                    </td>
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

  // ── PRODUCCION / MATERIALES ────────────────────────────────
  "produccion/materiales/page.tsx": `"use client";

import { Boxes } from "lucide-react";
import { useMaterialesProduccion } from "@/hooks/useProduccion";

export default function MaterialesPage() {
  const { data, isLoading } = useMaterialesProduccion();
  const materiales = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Boxes size={24} /> Materiales de Producción
        </h1>
        <p className="text-slate-500">{materiales.length} materiales registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Stock Mín.</th>
                <th>Stock Máx.</th>
                <th>Costo Unit.</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
              ) : materiales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No se encontraron materiales.</td></tr>
              ) : (
                materiales.map((m) => (
                  <tr key={m.id} className="table-row-hover">
                    <td className="font-mono text-xs">{m.code}</td>
                    <td className="font-medium">{m.nombre}</td>
                    <td>{m.tipo}</td>
                    <td>{m.unidad}</td>
                    <td className={\`text-right font-semibold \${(m.stockActual ?? 0) <= (m.stockMinimo ?? 0) ? "text-red-600" : "text-slate-900"}\`}>
                      {m.stockActual ?? 0}
                    </td>
                    <td className="text-right">{m.stockMinimo ?? 0}</td>
                    <td className="text-right">{m.stockMaximo ?? 0}</td>
                    <td className="text-right">\${m.costoUnitario?.toLocaleString() ?? "—"}</td>
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

  // ── CONFIGURACION / LOCALES ────────────────────────────────
  "configuracion/locales/page.tsx": `"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useLocales } from "@/hooks/useLocales";
import Pagination from "@/components/Pagination";

export default function LocalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLocales({ page, limit: 20, search: search || undefined });
  const locales = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={24} /> Locales / Sucursales
        </h1>
        <p className="text-slate-500">{total} locales registrados</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar locales..."
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
                <th>Ciudad</th>
                <th>Responsable</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : locales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron locales.</td></tr>
              ) : (
                locales.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td className="font-mono text-xs">{l.code}</td>
                    <td className="font-medium">{l.name}</td>
                    <td>{l.city ?? "—"}</td>
                    <td>{l.manager ?? "—"}</td>
                    <td>
                      <span className={\`badge \${l.active ? "badge-success" : "badge-secondary"}\`}>
                        {l.active ? "Activo" : "Inactivo"}
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

  // ── CONFIGURACION / USUARIOS ───────────────────────────────
  "configuracion/usuarios/page.tsx": `"use client";

import { useState } from "react";
import { UserCog, Search } from "lucide-react";
import { useUsuarios } from "@/hooks/useUsuarios";
import Pagination from "@/components/Pagination";

const ROL_LABEL: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
  INVENTARIO: "Inventario",
  CONTADOR: "Contador",
  RRHH: "RRHH",
  PRODUCCION: "Producción",
  VIEWER: "Solo lectura",
};

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useUsuarios({ page, limit: 20, search: search || undefined });
  const usuarios = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog size={24} /> Usuarios
        </h1>
        <p className="text-slate-500">{total} usuarios registrados</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
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
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Cargando...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">No se encontraron usuarios.</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="font-medium">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-info">{ROL_LABEL[u.rol] ?? u.rol}</span></td>
                    <td>
                      <span className={\`badge \${u.active ? "badge-success" : "badge-secondary"}\`}>
                        {u.active ? "Activo" : "Inactivo"}
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

  // ── CONFIGURACION / EMPRESA ────────────────────────────────
  "configuracion/empresa/page.tsx": `"use client";

import { Building } from "lucide-react";
import { useEmpresas } from "@/hooks/useEmpresas";

export default function EmpresaPage() {
  const { data: empresas, isLoading } = useEmpresas();
  const items = empresas ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building size={24} /> Empresas
        </h1>
        <p className="text-slate-500">{items.length} empresas registradas</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>CUIT / RUT</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron empresas.</td></tr>
              ) : (
                items.map((e) => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="font-mono text-xs">{e.code}</td>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.taxId ?? "—"}</td>
                    <td>{e.city ?? "—"}</td>
                    <td>{e.phone ?? "—"}</td>
                    <td>{e.email ?? "—"}</td>
                    <td>
                      <span className={\`badge \${e.active ? "badge-success" : "badge-secondary"}\`}>
                        {e.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
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
console.log("Batch 3 done (RRHH + Produccion + Configuracion)");
