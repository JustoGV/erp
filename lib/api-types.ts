// Formato estándar de todas las respuestas del backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Roles del backend (deben coincidir exactamente con el enum del backend)
export type UserRole =
  | "Administrador"
  | "Gerente"
  | "Vendedor"
  | "Comprador"
  | "Contador"
  | "RRHH"
  | "Produccion"
  | "Viewer";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  empresaId: string;
  localId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

// ── Empresa ──────────────────────────────────────────────────
export interface Empresa {
  id: string;
  code: string;
  name: string;
  taxId: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaDto {
  code: string;
  name: string;
  taxId: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {
  active?: boolean;
}

// ── Local ─────────────────────────────────────────────────────
export interface Local {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  manager?: string | null;
  active: boolean;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usuarios: number;
    clientes: number;
  };
}

export interface CreateLocalDto {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  manager?: string;
}

export interface UpdateLocalDto extends Partial<CreateLocalDto> {
  active?: boolean;
}

// ── Usuario ───────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  active: boolean;
  empresaId: string;
  localId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  localId?: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  localId?: string;
  active?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
