import { useAuth, UserRole } from '@/contexts/AuthContext'

export interface Permission {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export const usePermissions = () => {
  const { user } = useAuth()

  const getModulePermissions = (module: string): Permission => {
    if (!user) {
      return { canView: false, canCreate: false, canEdit: false, canDelete: false }
    }

    const role = user.rol

    // Administrador tiene acceso completo a todo
    if (role === 'Administrador') {
      return { canView: true, canCreate: true, canEdit: true, canDelete: true }
    }

    // Vendedor: acceso a ventas, clientes, inventario (solo lectura)
    if (role === 'Vendedor') {
      const fullAccessModules = ['dashboard', 'ventas']
      const readOnlyModules = ['inventario', 'reportes']
      
      if (fullAccessModules.includes(module)) {
        return { canView: true, canCreate: true, canEdit: true, canDelete: false }
      }
      if (readOnlyModules.includes(module)) {
        return { canView: true, canCreate: false, canEdit: false, canDelete: false }
      }
      return { canView: false, canCreate: false, canEdit: false, canDelete: false }
    }

    // Contable: acceso a finanzas, compras, reportes financieros
    if (role === 'Contable') {
      const fullAccessModules = ['dashboard', 'finanzas']
      const readOnlyModules = ['compras', 'reportes']
      
      if (fullAccessModules.includes(module)) {
        return { canView: true, canCreate: true, canEdit: true, canDelete: false }
      }
      if (readOnlyModules.includes(module)) {
        return { canView: true, canCreate: false, canEdit: false, canDelete: false }
      }
      return { canView: false, canCreate: false, canEdit: false, canDelete: false }
    }

    return { canView: false, canCreate: false, canEdit: false, canDelete: false }
  }

  const hasAccess = (module: string): boolean => {
    const permissions = getModulePermissions(module)
    return permissions.canView
  }

  const canCreate = (module: string): boolean => {
    const permissions = getModulePermissions(module)
    return permissions.canCreate
  }

  const canEdit = (module: string): boolean => {
    const permissions = getModulePermissions(module)
    return permissions.canEdit
  }

  const canDelete = (module: string): boolean => {
    const permissions = getModulePermissions(module)
    return permissions.canDelete
  }

  return {
    user,
    hasAccess,
    canCreate,
    canEdit,
    canDelete,
    getModulePermissions,
    isAdmin: user?.rol === 'Administrador',
    isVendedor: user?.rol === 'Vendedor',
    isContable: user?.rol === 'Contable'
  }
}
