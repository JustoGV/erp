import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/api-types";

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const FULL: Permission = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
};
const READ: Permission = {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};
const NONE: Permission = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

const ROLE_PERMISSIONS: Record<UserRole, Record<string, Permission>> = {
  Administrador: { default: FULL },
  Gerente: {
    default: { ...FULL, canDelete: false },
    reportes: READ,
  },
  Vendedor: {
    default: NONE,
    dashboard: FULL,
    ventas: FULL,
    inventario: READ,
    reportes: READ,
  },
  Comprador: {
    default: NONE,
    dashboard: READ,
    compras: FULL,
    inventario: READ,
    reportes: READ,
  },
  Contador: {
    default: NONE,
    dashboard: READ,
    finanzas: FULL,
    compras: READ,
    reportes: READ,
  },
  RRHH: {
    default: NONE,
    dashboard: READ,
    rrhh: FULL,
    reportes: READ,
  },
  Produccion: {
    default: NONE,
    dashboard: READ,
    produccion: FULL,
    inventario: READ,
    reportes: READ,
  },
  Viewer: {
    default: READ,
  },
};

export const usePermissions = () => {
  const { user } = useAuth();

  const getModulePermissions = (module: string): Permission => {
    if (!user) return NONE;

    const roleMap = ROLE_PERMISSIONS[user.rol];
    if (!roleMap) return NONE;

    if (user.rol === "Administrador") return FULL;

    return roleMap[module] ?? roleMap["default"] ?? NONE;
  };

  const hasAccess = (module: string): boolean => {
    const permissions = getModulePermissions(module);
    return permissions.canView;
  };

  const canCreate = (module: string): boolean => {
    const permissions = getModulePermissions(module);
    return permissions.canCreate;
  };

  const canEdit = (module: string): boolean => {
    const permissions = getModulePermissions(module);
    return permissions.canEdit;
  };

  const canDelete = (module: string): boolean => {
    const permissions = getModulePermissions(module);
    return permissions.canDelete;
  };

  return {
    user,
    hasAccess,
    canCreate,
    canEdit,
    canDelete,
    getModulePermissions,
    isAdmin: user?.rol === "Administrador",
  };
};
