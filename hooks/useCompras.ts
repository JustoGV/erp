import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  proveedoresService,
  requerimientosService,
  ordenesCompraService,
  recepcionesService,
  pagosProveedorService,
} from "@/lib/services/compras.service";
import type {
  CreateProveedorDto,
  UpdateProveedorDto,
  CreateRequerimientoDto,
  CreateOrdenCompraDto,
  CreateRecepcionDto,
  CreatePagoProveedorDto,
} from "@/lib/api-types";

// ── Proveedores ───────────────────────────────────────────────

export function useProveedores(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["proveedores", params],
    queryFn: () => proveedoresService.getAll(params),
  });
}

export function useProveedor(id: string) {
  return useQuery({
    queryKey: ["proveedores", id],
    queryFn: () => proveedoresService.getOne(id),
    enabled: !!id,
  });
}

export function useProveedorDeuda(id: string) {
  return useQuery({
    queryKey: ["proveedores", id, "deuda"],
    queryFn: () => proveedoresService.getDeuda(id),
    enabled: !!id,
  });
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProveedorDto) => proveedoresService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  });
}

export function useActualizarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProveedorDto }) =>
      proveedoresService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["proveedores"] });
      qc.invalidateQueries({ queryKey: ["proveedores", id] });
    },
  });
}

// ── Requerimientos ────────────────────────────────────────────

export function useRequerimientos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["requerimientos", params],
    queryFn: () => requerimientosService.getAll(params),
  });
}

export function useRequerimiento(id: string) {
  return useQuery({
    queryKey: ["requerimientos", id],
    queryFn: () => requerimientosService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearRequerimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateRequerimientoDto;
      localId: string;
    }) => requerimientosService.create(dto, localId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requerimientos"] }),
  });
}

export function useAutorizarRequerimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requerimientosService.autorizar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["requerimientos"] });
      qc.invalidateQueries({ queryKey: ["requerimientos", id] });
    },
  });
}

// ── Órdenes de Compra ─────────────────────────────────────────

export function useOrdenesCompra(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["ordenesCompra", params],
    queryFn: () => ordenesCompraService.getAll(params),
  });
}

export function useOrdenCompra(id: string) {
  return useQuery({
    queryKey: ["ordenesCompra", id],
    queryFn: () => ordenesCompraService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateOrdenCompraDto;
      localId: string;
    }) => ordenesCompraService.create(dto, localId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      qc.invalidateQueries({ queryKey: ["requerimientos"] });
    },
  });
}

export function useAprobarOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordenesCompraService.aprobar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      qc.invalidateQueries({ queryKey: ["ordenesCompra", id] });
    },
  });
}

// ── Recepciones ───────────────────────────────────────────────

export function useRecepciones(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["recepciones", params],
    queryFn: () => recepcionesService.getAll(params),
  });
}

export function useRegistrarRecepcion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecepcionDto) => recepcionesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recepciones"] });
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      qc.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── Pagos a Proveedores ───────────────────────────────────────

export function usePagosProveedor(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["pagosProveedor", params],
    queryFn: () => pagosProveedorService.getAll(params),
  });
}

export function useRegistrarPagoProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePagoProveedorDto) =>
      pagosProveedorService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagosProveedor"] });
      qc.invalidateQueries({ queryKey: ["proveedores"] });
      qc.invalidateQueries({ queryKey: ["cuentasPagar"] });
    },
  });
}
