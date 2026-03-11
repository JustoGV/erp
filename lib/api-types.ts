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
