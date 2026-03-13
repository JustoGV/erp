import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localesService } from "@/lib/services/config.service";
import type { CreateLocalDto, UpdateLocalDto } from "@/lib/api-types";

export const LOCALES_KEY = ["locales"] as const;

export function useLocales(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...LOCALES_KEY, params],
    queryFn: () => localesService.getAll(params),
  });
}

export function useLocale(id: string) {
  return useQuery({
    queryKey: [...LOCALES_KEY, id],
    queryFn: () => localesService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocalDto) => localesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCALES_KEY }),
  });
}

export function useUpdateLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLocalDto }) =>
      localesService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCALES_KEY }),
  });
}
