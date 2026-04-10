import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Empresa,
  CreateEmpresaDto,
  UpdateEmpresaDto,
  Local,
  CreateLocalDto,
  UpdateLocalDto,
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
} from "@/lib/api-types";

// ── Empresas ─────────────────────────────────────────────────

export const empresasService = {
  getAll: () =>
    apiClient.get<ApiResponse<Empresa[]>>("/empresas").then((r) => r.data.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Empresa>>(`/empresas/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateEmpresaDto) =>
    apiClient
      .post<ApiResponse<Empresa>>("/empresas", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateEmpresaDto) =>
    apiClient
      .patch<ApiResponse<Empresa>>(`/empresas/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Locales ───────────────────────────────────────────────────

export const localesService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; empresaId?: string }) =>
    apiClient
      .get<PaginatedResponse<Local>>("/locales", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Local>>(`/locales/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateLocalDto) =>
    apiClient
      .post<ApiResponse<Local>>("/locales", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateLocalDto) =>
    apiClient
      .patch<ApiResponse<Local>>(`/locales/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Usuarios ──────────────────────────────────────────────────

export const usuariosService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<PaginatedResponse<Usuario>>("/usuarios", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Usuario>>(`/usuarios/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateUsuarioDto) =>
    apiClient
      .post<ApiResponse<Usuario>>("/usuarios", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateUsuarioDto) =>
    apiClient
      .patch<ApiResponse<Usuario>>(`/usuarios/${id}`, dto)
      .then((r) => r.data.data),

  changePassword: (id: string, dto: ChangePasswordDto) =>
    apiClient
      .patch<ApiResponse<{ message: string }>>(`/usuarios/${id}/password`, dto)
      .then((r) => r.data.data),
};
