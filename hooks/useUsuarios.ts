import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosService } from "@/lib/services/config.service";
import type {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
} from "@/lib/api-types";

export const USUARIOS_KEY = ["usuarios"] as const;

export function useUsuarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...USUARIOS_KEY, params],
    queryFn: () => usuariosService.getAll(params),
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: [...USUARIOS_KEY, id],
    queryFn: () => usuariosService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUsuarioDto) => usuariosService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUsuarioDto }) =>
      usuariosService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ChangePasswordDto }) =>
      usuariosService.changePassword(id, dto),
  });
}
