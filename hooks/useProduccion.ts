import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  materialesProduccionService,
  bomService,
  ordenesProduccionService,
  planificacionService,
} from "@/lib/services/produccion.service";
import type {
  CreateMaterialProduccionDto,
  UpdateMaterialProduccionDto,
  CreateBomDto,
  CreateOrdenProduccionDto,
  FinalizarOrdenDto,
  CancelarOrdenDto,
} from "@/lib/types/produccion";

export const produccionKeys = {
  materiales: {
    all: ["materiales-produccion"] as const,
  },
  bom: {
    all: ["bom"] as const,
    detail: (id: string) => ["bom", id] as const,
  },
  ordenes: {
    all: ["ordenes-produccion"] as const,
    detail: (id: string) => ["ordenes-produccion", id] as const,
  },
  planificacion: {
    calendario: (desde: string, hasta: string) =>
      ["planificacion", "calendario", desde, hasta] as const,
    materiales: ["planificacion", "materiales"] as const,
  },
};

// ─── Materiales ──────────────────────────────────────────────────────────────

export function useMaterialesProduccion() {
  return useQuery({
    queryKey: produccionKeys.materiales.all,
    queryFn: () => materialesProduccionService.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateMaterialProduccionDto;
      localId: string;
    }) => materialesProduccionService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: produccionKeys.materiales.all,
      });
    },
  });
}

export function useActualizarMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateMaterialProduccionDto;
    }) => materialesProduccionService.update(id, dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: produccionKeys.materiales.all,
      });
    },
  });
}

// ─── BOMs ────────────────────────────────────────────────────────────────────

export function useBOMs() {
  return useQuery({
    queryKey: produccionKeys.bom.all,
    queryFn: () => bomService.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useBOM(id: string) {
  return useQuery({
    queryKey: produccionKeys.bom.detail(id),
    queryFn: () => bomService.getById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearBOM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, localId }: { dto: CreateBomDto; localId: string }) =>
      bomService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.bom.all });
    },
  });
}

// ─── Órdenes de Producción ───────────────────────────────────────────────────

export function useOrdenesProduccion() {
  return useQuery({
    queryKey: produccionKeys.ordenes.all,
    queryFn: () => ordenesProduccionService.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useOrdenProduccion(id: string) {
  return useQuery({
    queryKey: produccionKeys.ordenes.detail(id),
    queryFn: () => ordenesProduccionService.getById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateOrdenProduccionDto;
      localId: string;
    }) => ordenesProduccionService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
    },
  });
}

export function useIniciarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      ordenesProduccionService.iniciar(id).then((r) => r.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.ordenes.detail(id),
      });
      // Stock changes — invalidate materials verification too
      queryClient.invalidateQueries({
        queryKey: produccionKeys.planificacion.materiales,
      });
    },
  });
}

export function useFinalizarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FinalizarOrdenDto }) =>
      ordenesProduccionService.finalizar(id, dto).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.ordenes.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.planificacion.materiales,
      });
    },
  });
}

export function useCancelarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelarOrdenDto }) =>
      ordenesProduccionService.cancelar(id, dto).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.ordenes.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.planificacion.materiales,
      });
    },
  });
}

// ─── Planificación ───────────────────────────────────────────────────────────

export function useCalendarioProduccion(desde: string, hasta: string) {
  return useQuery({
    queryKey: produccionKeys.planificacion.calendario(desde, hasta),
    queryFn: () =>
      planificacionService.getCalendario(desde, hasta).then((r) => r.data),
    enabled: !!desde && !!hasta,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useVerificarMateriales() {
  return useQuery({
    queryKey: produccionKeys.planificacion.materiales,
    queryFn: () =>
      planificacionService.verificarMateriales().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
