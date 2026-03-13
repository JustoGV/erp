import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientesService,
  presupuestosService,
  pedidosService,
  facturasService,
  cobranzasService,
} from "@/lib/services/ventas.service";
import type {
  FilterClienteDto,
  CreateClienteDto,
  UpdateClienteDto,
  CreatePresupuestoDto,
  EstadoPresupuesto,
  CreateFacturaDto,
  CreateCobranzaDto,
} from "@/lib/api-types";

// ── Clientes ──────────────────────────────────────────────────

export function useClientes(filter?: FilterClienteDto) {
  return useQuery({
    queryKey: ["clientes", filter],
    queryFn: () => clientesService.getAll(filter),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: () => clientesService.getOne(id),
    enabled: !!id,
  });
}

export function useClienteSaldos(id: string) {
  return useQuery({
    queryKey: ["clientes", id, "saldos"],
    queryFn: () => clientesService.getSaldos(id),
    enabled: !!id,
  });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClienteDto) => clientesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClienteDto }) =>
      clientesService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["clientes", id] });
    },
  });
}

// ── Presupuestos ──────────────────────────────────────────────

export function usePresupuestos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["presupuestos", params],
    queryFn: () => presupuestosService.getAll(params),
  });
}

export function usePresupuesto(id: string) {
  return useQuery({
    queryKey: ["presupuestos", id],
    queryFn: () => presupuestosService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreatePresupuestoDto;
      localId: string;
    }) => presupuestosService.create(dto, localId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuestos"] }),
  });
}

export function useConvertirPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presupuestosService.convertirAPedido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useCambiarEstadoPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPresupuesto }) =>
      presupuestosService.cambiarEstado(id, estado),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: ["presupuestos", id] });
    },
  });
}

// ── Pedidos ───────────────────────────────────────────────────

export function usePedidos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["pedidos", params],
    queryFn: () => pedidosService.getAll(params),
  });
}

export function usePedido(id: string) {
  return useQuery({
    queryKey: ["pedidos", id],
    queryFn: () => pedidosService.getOne(id),
    enabled: !!id,
  });
}

export function useAprobarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pedidosService.aprobar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["pedidos", id] });
    },
  });
}

// ── Facturas ──────────────────────────────────────────────────

export function useFacturas(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["facturas", params],
    queryFn: () => facturasService.getAll(params),
  });
}

export function useFactura(id: string) {
  return useQuery({
    queryKey: ["facturas", id],
    queryFn: () => facturasService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearFacturaDesdePedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFacturaDto) => facturasService.desdePedido(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facturas"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useAnularFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      facturasService.anular(id, motivo),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["facturas"] });
      qc.invalidateQueries({ queryKey: ["facturas", id] });
      qc.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── Cobranzas ─────────────────────────────────────────────────

export function useCobranzas(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["cobranzas", params],
    queryFn: () => cobranzasService.getAll(params),
  });
}

export function useCrearCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCobranzaDto) => cobranzasService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cobranzas"] });
      qc.invalidateQueries({ queryKey: ["facturas"] });
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}
