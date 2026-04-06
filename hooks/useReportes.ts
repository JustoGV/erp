import { useQuery } from "@tanstack/react-query";
import { reportesService } from "@/lib/services/reportes.service";
import type { ReporteFiltros } from "@/lib/types/reportes";

export const reportesKeys = {
  dashboard: (localId?: string) => ["reportes", "dashboard", localId] as const,
  ventas: (f?: Partial<ReporteFiltros>) => ["reportes", "ventas", f] as const,
  compras: (f?: Partial<ReporteFiltros>) => ["reportes", "compras", f] as const,
  inventario: (f?: Partial<ReporteFiltros>) =>
    ["reportes", "inventario", f] as const,
  rrhh: (f?: Partial<ReporteFiltros>) => ["reportes", "rrhh", f] as const,
  resultados: (f?: Partial<ReporteFiltros>) =>
    ["reportes", "resultados", f] as const,
};

export function useDashboardKPIs(localId?: string) {
  return useQuery({
    queryKey: reportesKeys.dashboard(localId),
    queryFn: () => reportesService.getDashboard({ localId }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useReporteVentas(
  filtros?: Parameters<typeof reportesService.getVentas>[0],
) {
  return useQuery({
    queryKey: reportesKeys.ventas(filtros),
    queryFn: () => reportesService.getVentas(filtros).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useReporteCompras(
  filtros?: Parameters<typeof reportesService.getCompras>[0],
) {
  return useQuery({
    queryKey: reportesKeys.compras(filtros),
    queryFn: () => reportesService.getCompras(filtros).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useReporteInventario(
  filtros?: Parameters<typeof reportesService.getInventario>[0],
) {
  return useQuery({
    queryKey: reportesKeys.inventario(filtros),
    queryFn: () => reportesService.getInventario(filtros).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useReporteRRHH(
  filtros?: Parameters<typeof reportesService.getRRHH>[0],
) {
  return useQuery({
    queryKey: reportesKeys.rrhh(filtros),
    queryFn: () => reportesService.getRRHH(filtros).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useReporteResultados(
  filtros?: Parameters<typeof reportesService.getResultados>[0],
) {
  return useQuery({
    queryKey: reportesKeys.resultados(filtros),
    queryFn: () => reportesService.getResultados(filtros).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
