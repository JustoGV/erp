import { apiClient, tokenStore } from "@/lib/api-client";
import type {
  DashboardKPIs,
  ReporteFiltros,
  ReporteVentas,
  ReporteCompras,
  ReporteInventario,
  ReporteRRHH,
  ReporteResultados,
} from "@/lib/types/reportes";

/** Remove keys whose value is empty string, null or undefined so they don't reach the backend as `&key=` */
function cleanParams<T extends Record<string, unknown>>(
  p?: T,
): Partial<T> | undefined {
  if (!p) return undefined;
  const out = {} as Partial<T>;
  for (const [k, v] of Object.entries(p)) {
    if (v !== "" && v != null) (out as Record<string, unknown>)[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export const reportesService = {
  getDashboard: (params?: { localId?: string }) =>
    apiClient.get<{ data: DashboardKPIs }>("/reportes/dashboard", {
      params: cleanParams(params as Record<string, unknown>),
    }),

  getVentas: (filtros?: Omit<ReporteFiltros, "proveedorId" | "empleadoId">) =>
    apiClient.get<{ data: ReporteVentas }>("/reportes/ventas", {
      params: cleanParams(filtros),
    }),

  getCompras: (
    filtros?: Omit<ReporteFiltros, "clienteId" | "empleadoId" | "localId">,
  ) =>
    apiClient.get<{ data: ReporteCompras }>("/reportes/compras", {
      params: cleanParams(filtros),
    }),

  getInventario: (filtros?: Pick<ReporteFiltros, "localId" | "formato">) =>
    apiClient.get<{ data: ReporteInventario }>("/reportes/inventario", {
      params: cleanParams(filtros),
    }),

  getRRHH: (
    filtros?: Omit<ReporteFiltros, "clienteId" | "proveedorId" | "localId">,
  ) =>
    apiClient.get<{ data: ReporteRRHH }>("/reportes/rrhh", {
      params: cleanParams(filtros),
    }),

  getResultados: (filtros?: Pick<ReporteFiltros, "desde" | "hasta">) =>
    apiClient.get<{ data: ReporteResultados }>("/reportes/resultados", {
      params: cleanParams(filtros),
    }),
};

// ─── Descarga XLSX ───────────────────────────────────────────────────────────
// ventas, inventario y rrhh soportan formato=xlsx.
// La respuesta es binaria — NO usar apiClient.get normal.

export async function downloadReporteXLSX(
  tipo: "ventas" | "inventario" | "rrhh",
  filtros: Omit<ReporteFiltros, "formato"> = {},
  nombreArchivo?: string,
): Promise<void> {
  const token = tokenStore.get();

  const params = new URLSearchParams();
  Object.entries({ ...filtros, formato: "xlsx" }).forEach(([k, v]) => {
    if (v != null && v !== "") params.set(k, String(v));
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const response = await fetch(
    `${baseUrl}/reportes/${tipo}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string })?.message ?? `Error ${response.status}`,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    nombreArchivo ??
    `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
