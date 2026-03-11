import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresasService } from "@/lib/services/config.service";
import type { CreateEmpresaDto, UpdateEmpresaDto } from "@/lib/api-types";

export const EMPRESAS_KEY = ["empresas"] as const;

export function useEmpresas() {
  return useQuery({
    queryKey: EMPRESAS_KEY,
    queryFn: () => empresasService.getAll(),
  });
}

export function useEmpresa(id: string) {
  return useQuery({
    queryKey: [...EMPRESAS_KEY, id],
    queryFn: () => empresasService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmpresaDto) => empresasService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPRESAS_KEY }),
  });
}

export function useUpdateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmpresaDto }) =>
      empresasService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPRESAS_KEY }),
  });
}
