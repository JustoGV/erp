import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  empleadosService,
  asistenciasService,
  horasService,
  liquidacionesService,
  vacacionesService,
} from "@/lib/services/rrhh.service";
import type {
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  CreateAsistenciaDto,
  CreateRegistroHorasDto,
  CreateLiquidacionDto,
  CreateVacacionDto,
} from "@/lib/types/rrhh";

// ─────────────────────────── Keys ───────────────────────────────────────────

export const rrhhKeys = {
  empleados: {
    all: ["empleados"] as const,
    list: (params?: object) => ["empleados", "list", params] as const,
    detail: (id: string) => ["empleados", "detail", id] as const,
    resumen: (id: string, mes: number, anio: number) =>
      ["empleados", "resumen", id, mes, anio] as const,
  },
  asistencias: {
    all: ["asistencias"] as const,
    list: (params?: object) => ["asistencias", "list", params] as const,
  },
  horas: {
    all: ["horas"] as const,
    list: (params?: object) => ["horas", "list", params] as const,
  },
  liquidaciones: {
    all: ["liquidaciones"] as const,
    list: (params?: object) => ["liquidaciones", "list", params] as const,
    detail: (id: string) => ["liquidaciones", "detail", id] as const,
  },
  vacaciones: {
    all: ["vacaciones"] as const,
    byEmpleado: (empleadoId: string) =>
      ["vacaciones", "empleado", empleadoId] as const,
  },
};

// ─────────────────────────── Empleados ──────────────────────────────────────

interface EmpleadoParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
}

export function useEmpleados(params?: EmpleadoParams) {
  return useQuery({
    queryKey: rrhhKeys.empleados.list(params),
    queryFn: () => empleadosService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useEmpleado(id: string) {
  return useQuery({
    queryKey: rrhhKeys.empleados.detail(id),
    queryFn: () => empleadosService.getById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useResumenHoras(id: string, mes: number, anio: number) {
  return useQuery({
    queryKey: rrhhKeys.empleados.resumen(id, mes, anio),
    queryFn: () =>
      empleadosService.getResumenHoras(id, mes, anio).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateEmpleadoDto;
      localId: string;
    }) => empleadosService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.empleados.all });
    },
  });
}

export function useActualizarEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmpleadoDto }) =>
      empleadosService.update(id, dto).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.empleados.all });
      queryClient.invalidateQueries({
        queryKey: rrhhKeys.empleados.detail(id),
      });
    },
  });
}

// ─────────────────────────── Asistencias ────────────────────────────────────

interface AsistenciaParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
  empleadoId?: string;
  fecha?: string;
}

export function useAsistencias(params?: AsistenciaParams) {
  return useQuery({
    queryKey: rrhhKeys.asistencias.list(params),
    queryFn: () => asistenciasService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useRegistrarAsistencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAsistenciaDto) =>
      asistenciasService.create(dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.asistencias.all });
    },
  });
}

// ─────────────────────────── Horas ──────────────────────────────────────────

interface HorasParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
  empleadoId?: string;
}

export function useHoras(params?: HorasParams) {
  return useQuery({
    queryKey: rrhhKeys.horas.list(params),
    queryFn: () => horasService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useRegistrarHoras() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRegistroHorasDto) =>
      horasService.create(dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.horas.all });
    },
  });
}

// ─────────────────────────── Liquidaciones ──────────────────────────────────

interface LiquidacionParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
}

export function useLiquidaciones(params?: LiquidacionParams) {
  return useQuery({
    queryKey: rrhhKeys.liquidaciones.list(params),
    queryFn: () => liquidacionesService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useLiquidacion(id: string) {
  return useQuery({
    queryKey: rrhhKeys.liquidaciones.detail(id),
    queryFn: () => liquidacionesService.getById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLiquidacionDto) =>
      liquidacionesService.create(dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.liquidaciones.all });
    },
  });
}

export function useAprobarLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      liquidacionesService.aprobar(id).then((r) => r.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.liquidaciones.all });
      queryClient.invalidateQueries({
        queryKey: rrhhKeys.liquidaciones.detail(id),
      });
    },
  });
}

// ─────────────────────────── Vacaciones ─────────────────────────────────────

export function useVacacionesByEmpleado(empleadoId: string) {
  return useQuery({
    queryKey: rrhhKeys.vacaciones.byEmpleado(empleadoId),
    queryFn: () =>
      vacacionesService.getByEmpleado(empleadoId).then((r) => r.data),
    enabled: !!empleadoId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useSolicitarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVacacionDto) =>
      vacacionesService.create(dto).then((r) => r.data),
    onSuccess: (_data, dto) => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.vacaciones.all });
      queryClient.invalidateQueries({
        queryKey: rrhhKeys.vacaciones.byEmpleado(dto.empleadoId),
      });
    },
  });
}

export function useAprobarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      vacacionesService.aprobar(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.vacaciones.all });
    },
  });
}

export function useRechazarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      vacacionesService.rechazar(id, motivo).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.vacaciones.all });
    },
  });
}
