import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  planCuentasService,
  asientosService,
  cuentasCobrarService,
  cuentasPagarService,
  bancosService,
  cajaService,
  retencionesService,
} from "@/lib/services/finanzas.service";
import type {
  CreateCuentaDto,
  CreateAsientoDto,
  CreateMovimientoBancarioDto,
  MovimientoCajaDto,
  CreateRetencionDto,
} from "@/lib/api-types";

// ── Plan de Cuentas ───────────────────────────────────────────────────────────

export function usePlanCuentas(empresaId?: string) {
  return useQuery({
    queryKey: ["plan-cuentas", empresaId],
    queryFn: () => planCuentasService.getAll(empresaId).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCuentaContable(id: string) {
  return useQuery({
    queryKey: ["plan-cuentas", id],
    queryFn: () => planCuentasService.getOne(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useMayorContable(
  cuentaId: string,
  params?: { desde?: string; hasta?: string },
) {
  return useQuery({
    queryKey: ["mayor", cuentaId, params],
    queryFn: () =>
      planCuentasService.getMayor(cuentaId, params).then((r) => r.data),
    enabled: !!cuentaId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCuentaDto) =>
      planCuentasService.create(dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-cuentas"] });
    },
  });
}

// ── Asientos ──────────────────────────────────────────────────────────────────

export function useAsientos(params?: {
  localId?: string;
  page?: number;
  limit?: number;
  estado?: string;
  desde?: string;
  hasta?: string;
}) {
  return useQuery({
    queryKey: ["asientos", params],
    queryFn: () => asientosService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAsiento(id: string) {
  return useQuery({
    queryKey: ["asientos", id],
    queryFn: () => asientosService.getOne(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCrearAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateAsientoDto;
      localId: string;
    }) => asientosService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asientos"] });
    },
  });
}

// ── Cuentas por Cobrar ────────────────────────────────────────────────────────

export function useCuentasCobrar(params?: {
  localId?: string;
  page?: number;
  limit?: number;
  estado?: string;
}) {
  return useQuery({
    queryKey: ["cuentas-cobrar", params],
    queryFn: () => cuentasCobrarService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useResumenCxC(localId?: string) {
  return useQuery({
    queryKey: ["cuentas-cobrar-resumen", localId],
    queryFn: () => cuentasCobrarService.getResumen(localId).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ── Cuentas por Pagar ─────────────────────────────────────────────────────────

export function useCuentasPagar(params?: {
  localId?: string;
  page?: number;
  limit?: number;
  estado?: string;
}) {
  return useQuery({
    queryKey: ["cuentas-pagar", params],
    queryFn: () => cuentasPagarService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useResumenCxP(localId?: string) {
  return useQuery({
    queryKey: ["cuentas-pagar-resumen", localId],
    queryFn: () => cuentasPagarService.getResumen(localId).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ── Bancos ────────────────────────────────────────────────────────────────────

export function useCuentasBancarias() {
  return useQuery({
    queryKey: ["bancos-cuentas"],
    queryFn: () => bancosService.getCuentas().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useMovimientosBancarios(
  cuentaBancariaId: string,
  params?: { page?: number; limit?: number; desde?: string; hasta?: string },
) {
  return useQuery({
    queryKey: ["bancos-movimientos", cuentaBancariaId, params],
    queryFn: () =>
      bancosService
        .getMovimientos(cuentaBancariaId, params)
        .then((r) => r.data),
    enabled: !!cuentaBancariaId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useRegistrarMovimientoBancario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMovimientoBancarioDto) =>
      bancosService.registrarMovimiento(dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bancos-movimientos"] });
      qc.invalidateQueries({ queryKey: ["bancos-cuentas"] });
    },
  });
}

// ── Caja ──────────────────────────────────────────────────────────────────────

export function useSaldoCaja(localId: string) {
  return useQuery({
    queryKey: ["caja-saldo", localId],
    queryFn: () => cajaService.getSaldo(localId).then((r) => r.data),
    enabled: !!localId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useMovimientosCaja(
  localId: string,
  params?: { page?: number; limit?: number; desde?: string; hasta?: string },
) {
  return useQuery({
    queryKey: ["caja-movimientos", localId, params],
    queryFn: () =>
      cajaService.getMovimientos(localId, params).then((r) => r.data),
    enabled: !!localId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useRegistrarMovimientoCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      localId,
      dto,
    }: {
      localId: string;
      dto: MovimientoCajaDto;
    }) => cajaService.registrarMovimiento(localId, dto).then((r) => r.data),
    onSuccess: (_data, { localId }) => {
      qc.invalidateQueries({ queryKey: ["caja-movimientos", localId] });
      qc.invalidateQueries({ queryKey: ["caja-saldo", localId] });
    },
  });
}

// ── Retenciones ───────────────────────────────────────────────────────────────

export function useRetenciones(params?: {
  localId?: string;
  page?: number;
  limit?: number;
  tipo?: string;
}) {
  return useQuery({
    queryKey: ["retenciones", params],
    queryFn: () => retencionesService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useRegistrarRetencion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateRetencionDto;
      localId: string;
    }) => retencionesService.create(dto, localId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retenciones"] });
    },
  });
}
