// Mock data para el ERP (sin base de datos)

// ==================== LOCALES / SUCURSALES ====================
export interface Local {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  manager: string;
  active: boolean;
}

export const mockLocales: Local[] = [
  {
    id: '1',
    code: 'LOC-SF',
    name: 'Local Santa Fe',
    address: 'San Martín 2450',
    city: 'Santa Fe',
    state: 'Santa Fe',
    phone: '0342-4567890',
    email: 'santafe@empresa.com',
    manager: 'Juan Pérez',
    active: true,
  },
  {
    id: '2',
    code: 'LOC-PR',
    name: 'Local Paraná',
    address: 'San Juan 1234',
    city: 'Paraná',
    state: 'Entre Ríos',
    phone: '0343-4561234',
    email: 'parana@empresa.com',
    manager: 'María González',
    active: true,
  },
  {
    id: '3',
    code: 'LOC-ROS',
    name: 'Local Rosario',
    address: 'Pellegrini 890',
    city: 'Rosario',
    state: 'Santa Fe',
    phone: '0341-4445566',
    email: 'rosario@empresa.com',
    manager: 'Carlos Martínez',
    active: true,
  },
];

// ==================== CLIENTES ====================
export const mockClientes = [
  { 
    id: '1', 
    code: 'CLI-001', 
    name: 'Empresa ABC S.A.', 
    taxId: '20-12345678-9', 
    email: 'contacto@empresaabc.com', 
    phone: '11-4444-5555', 
    address: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    state: 'CABA',
    creditLimit: 50000,
    active: true,
    localId: '1', // Santa Fe
  },
  { 
    id: '2', 
    code: 'CLI-002', 
    name: 'Comercial XYZ', 
    taxId: '20-98765432-1', 
    email: 'ventas@xyz.com', 
    phone: '11-5555-6666',
    address: 'Av. Santa Fe 5678',
    city: 'Buenos Aires',
    state: 'CABA',
    creditLimit: 75000,
    active: true,
    localId: '3', // Rosario
  },
  { 
    id: '3', 
    code: 'CLI-003', 
    name: 'Distribuidora 123', 
    taxId: '20-11111111-1', 
    email: 'info@dist123.com', 
    phone: '11-6666-7777',
    address: 'Calle Falsa 123',
    city: 'La Plata',
    state: 'Buenos Aires',
    creditLimit: 30000,
    active: false,
    localId: '2', // Paraná
  },
  { 
    id: '4', 
    code: 'CLI-004', 
    name: 'Mayorista del Sur', 
    taxId: '20-22222222-2', 
    email: 'compras@mayosur.com', 
    phone: '11-7777-8888',
    address: 'Av. Belgrano 999',
    city: 'Buenos Aires',
    state: 'CABA',
    creditLimit: 100000,
    active: true,
    localId: '1', // Santa Fe
  },
];

// ==================== PROVEEDORES ====================
export const mockProveedores = [
  {
    id: '1',
    code: 'PROV-001',
    name: 'Proveedor Industrial S.A.',
    taxId: '20-33333333-3',
    email: 'ventas@provin.com',
    phone: '11-8888-9999',
    address: 'Parque Industrial 456',
    city: 'Buenos Aires',
    state: 'CABA',
    paymentTerms: 30,
    active: true,
    localId: '1',
  },
  {
    id: '2',
    code: 'PROV-002',
    name: 'Distribuidora Nacional',
    taxId: '20-44444444-4',
    email: 'info@distnac.com',
    phone: '11-9999-0000',
    address: 'Av. Libertador 789',
    city: 'Buenos Aires',
    state: 'CABA',
    paymentTerms: 45,
    active: true,
    localId: '2',
  },
];

// ==================== PRODUCTOS ====================
export const mockProductos = [
  {
    id: '1',
    code: 'PROD-001',
    name: 'Producto A - Premium',
    description: 'Producto de alta calidad',
    category: 'Categoría 1',
    unit: 'UNI',
    cost: 600,
    price: 1000,
    stock: 145,
    minStock: 20,
    active: true,
    localId: '1', // Santa Fe
  },
  {
    id: '2',
    code: 'PROD-002',
    name: 'Producto B - Standard',
    description: 'Producto estándar',
    category: 'Categoría 1',
    unit: 'UNI',
    cost: 300,
    price: 500,
    stock: 230,
    minStock: 50,
    active: true,
    localId: '1', // Santa Fe
  },
  {
    id: '3',
    code: 'PROD-001',
    name: 'Producto A - Premium',
    description: 'Producto de alta calidad',
    category: 'Categoría 1',
    unit: 'UNI',
    cost: 600,
    price: 1000,
    stock: 89,
    minStock: 20,
    active: true,
    localId: '2', // Paraná
  },
  {
    id: '4',
    code: 'PROD-003',
    name: 'Producto C - Economy',
    description: 'Producto económico',
    category: 'Categoría 2',
    unit: 'UNI',
    cost: 150,
    price: 250,
    stock: 12,
    minStock: 30,
    active: true,
    localId: '3', // Rosario - Stock bajo!
  },
  {
    id: '5',
    code: 'PROD-004',
    name: 'Producto D - Deluxe',
    description: 'Producto de lujo',
    category: 'Categoría 3',
    unit: 'UNI',
    cost: 1200,
    price: 2000,
    stock: 45,
    minStock: 10,
    active: true,
    localId: '1', // Santa Fe
  },
];

// ==================== FACTURAS ====================
export const mockFacturas = [
  {
    id: '1',
    invoiceNumber: 'SF-00001',
    customerId: '1',
    customerName: 'Empresa ABC S.A.',
    date: '2025-11-25',
    dueDate: '2025-12-25',
    total: 25000,
    status: 'Paid' as const,
    localId: '1', // Santa Fe
  },
  {
    id: '2',
    invoiceNumber: 'SF-00002',
    customerId: '4',
    customerName: 'Mayorista del Sur',
    date: '2025-11-28',
    dueDate: '2025-12-28',
    total: 48500,
    status: 'Pending' as const,
    localId: '1', // Santa Fe
  },
  {
    id: '3',
    invoiceNumber: 'PR-00001',
    customerId: '3',
    customerName: 'Distribuidora 123',
    date: '2025-11-20',
    dueDate: '2025-12-20',
    total: 32000,
    status: 'Overdue' as const,
    localId: '2', // Paraná
  },
  {
    id: '4',
    invoiceNumber: 'ROS-00001',
    customerId: '2',
    customerName: 'Comercial XYZ',
    date: '2025-11-22',
    dueDate: '2025-12-22',
    total: 67000,
    status: 'Pending' as const,
    localId: '3', // Rosario
  },
];

// ==================== EMPLEADOS ====================
export const mockEmpleados = [
  {
    id: '1',
    code: 'EMP-001',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    phone: '11-1111-1111',
    position: 'Gerente',
    department: 'Administración',
    salary: 150000,
    hireDate: '2020-01-15',
    active: true,
    localId: '1', // Santa Fe
  },
  {
    id: '2',
    code: 'EMP-002',
    name: 'María González',
    email: 'maria.gonzalez@empresa.com',
    phone: '11-2222-2222',
    position: 'Gerente',
    department: 'Ventas',
    salary: 135000,
    hireDate: '2021-03-20',
    active: true,
    localId: '2', // Paraná
  },
  {
    id: '3',
    code: 'EMP-003',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@empresa.com',
    phone: '11-3333-3333',
    position: 'Gerente',
    department: 'Ventas',
    salary: 140000,
    hireDate: '2021-06-10',
    active: true,
    localId: '3', // Rosario
  },
  {
    id: '4',
    code: 'EMP-004',
    name: 'Ana López',
    email: 'ana.lopez@empresa.com',
    phone: '11-4444-4444',
    position: 'Vendedor',
    department: 'Ventas',
    salary: 85000,
    hireDate: '2022-02-01',
    active: true,
    localId: '1', // Santa Fe
  },
];

// ==================== ÓRDENES DE COMPRA ====================
export const mockOrdenesCompra = [
  {
    id: '1',
    orderNumber: 'OC-SF-00001',
    supplierId: '1',
    supplierName: 'Proveedor Industrial S.A.',
    date: '2025-11-20',
    expectedDate: '2025-12-05',
    total: 50000,
    status: 'Pending' as const,
    localId: '1', // Santa Fe
  },
  {
    id: '2',
    orderNumber: 'OC-PR-00001',
    supplierId: '2',
    supplierName: 'Distribuidora Nacional',
    date: '2025-11-22',
    expectedDate: '2025-12-07',
    total: 35000,
    status: 'Received' as const,
    localId: '2', // Paraná
  },
];

// ==================== MOVIMIENTOS DE STOCK ====================
export const mockMovimientosStock = [
  {
    id: '1',
    date: '2025-11-25',
    type: 'IN' as const,
    productId: '1',
    productName: 'Producto A - Premium',
    quantity: 50,
    reference: 'OC-SF-00001',
    localId: '1', // Santa Fe
  },
  {
    id: '2',
    date: '2025-11-26',
    type: 'OUT' as const,
    productId: '2',
    productName: 'Producto B - Standard',
    quantity: 25,
    reference: 'SF-00001',
    localId: '1', // Santa Fe
  },
  {
    id: '3',
    date: '2025-11-27',
    type: 'TRANSFER' as const,
    productId: '1',
    productName: 'Producto A - Premium',
    quantity: 20,
    reference: 'TRANS-001',
    localId: '1', // De Santa Fe
    destinationLocalId: '2', // A Paraná
  },
];

// ==================== ESTADÍSTICAS ====================
export const mockStats = {
  ventasMes: 172500, // Total consolidado
  comprasMes: 85000,
  stockProductos: 521,
  clientesActivos: 3,
};

// Stats por local
export const mockStatsByLocal: Record<string, typeof mockStats> = {
  '1': { // Santa Fe
    ventasMes: 73500,
    comprasMes: 50000,
    stockProductos: 275,
    clientesActivos: 2,
  },
  '2': { // Paraná
    ventasMes: 32000,
    comprasMes: 35000,
    stockProductos: 89,
    clientesActivos: 1,
  },
  '3': { // Rosario
    ventasMes: 67000,
    comprasMes: 0,
    stockProductos: 157,
    clientesActivos: 1,
  },
};

// ==================== PRODUCTOS MÁS VENDIDOS ====================
export const mockProductosVendidos = [
  { name: 'Producto A - Premium', sales: 125000, units: 150 },
  { name: 'Producto B - Standard', sales: 95000, units: 190 },
  { name: 'Producto C - Economy', sales: 67000, units: 268 },
  { name: 'Producto D - Deluxe', sales: 54000, units: 27 },
  { name: 'Producto E - Special', sales: 38500, units: 77 },
];

// ==================== ALERTAS ====================
export const mockAlertas = [
  {
    id: '1',
    type: 'warning' as const,
    message: 'Producto C - Economy tiene stock bajo en Local Rosario (12 unidades, mínimo 30)',
  },
  {
    id: '2',
    type: 'danger' as const,
    message: 'Factura PR-00001 de Distribuidora 123 está vencida desde hace 11 días',
  },
  {
    id: '3',
    type: 'info' as const,
    message: 'Orden de compra OC-PR-00001 recibida exitosamente en Local Paraná',
  },
  {
    id: '4',
    type: 'warning' as const,
    message: 'Se recomienda hacer transferencia de stock de Producto A desde Santa Fe a Rosario',
  },
];

// ==================== MÓDULO DE PRODUCCIÓN ====================

// Tipos de productos
export type TipoProducto = 'TERMINADO' | 'SEMI_TERMINADO' | 'MATERIA_PRIMA' | 'INSUMO';

// BOM (Bill of Materials - Lista de materiales)
export interface BOM {
  id: string;
  code: string;
  productoTerminadoId: string;
  productoTerminadoNombre: string;
  cantidad: number;
  unidad: string;
  materiales: BOMItem[];
  costoTotal: number;
  version: number;
  activo: boolean;
  localId: string;
}

export interface BOMItem {
  id: string;
  materialId: string;
  materialNombre: string;
  materialCode: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  costoTotal: number;
}

export const mockBOMs: BOM[] = [
  {
    id: '1',
    code: 'BOM-001',
    productoTerminadoId: '1',
    productoTerminadoNombre: 'Producto A - Premium',
    cantidad: 1,
    unidad: 'UN',
    materiales: [
      {
        id: '1',
        materialId: 'MP-001',
        materialNombre: 'Materia Prima Base',
        materialCode: 'MP-001',
        cantidad: 2.5,
        unidad: 'KG',
        costoUnitario: 1200,
        costoTotal: 3000
      },
      {
        id: '2',
        materialId: 'INS-001',
        materialNombre: 'Insumo Químico A',
        materialCode: 'INS-001',
        cantidad: 0.5,
        unidad: 'LT',
        costoUnitario: 800,
        costoTotal: 400
      },
      {
        id: '3',
        materialId: 'INS-002',
        materialNombre: 'Envase Premium',
        materialCode: 'INS-002',
        cantidad: 1,
        unidad: 'UN',
        costoUnitario: 450,
        costoTotal: 450
      }
    ],
    costoTotal: 3850,
    version: 1,
    activo: true,
    localId: '1'
  },
  {
    id: '2',
    code: 'BOM-002',
    productoTerminadoId: '2',
    productoTerminadoNombre: 'Producto B - Standard',
    cantidad: 1,
    unidad: 'UN',
    materiales: [
      {
        id: '4',
        materialId: 'MP-001',
        materialNombre: 'Materia Prima Base',
        materialCode: 'MP-001',
        cantidad: 2,
        unidad: 'KG',
        costoUnitario: 1200,
        costoTotal: 2400
      },
      {
        id: '5',
        materialId: 'INS-001',
        materialNombre: 'Insumo Químico A',
        materialCode: 'INS-001',
        cantidad: 0.3,
        unidad: 'LT',
        costoUnitario: 800,
        costoTotal: 240
      },
      {
        id: '6',
        materialId: 'INS-003',
        materialNombre: 'Envase Standard',
        materialCode: 'INS-003',
        cantidad: 1,
        unidad: 'UN',
        costoUnitario: 250,
        costoTotal: 250
      }
    ],
    costoTotal: 2890,
    version: 1,
    activo: true,
    localId: '1'
  }
];

// Órdenes de Producción
export type EstadoOrdenProduccion = 'PLANIFICADA' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';

export interface OrdenProduccion {
  id: string;
  code: string;
  bomId: string;
  productoId: string;
  productoNombre: string;
  cantidadPlanificada: number;
  cantidadProducida: number;
  unidad: string;
  estado: EstadoOrdenProduccion;
  fechaInicio: string;
  fechaFinPlanificada: string;
  fechaFinReal?: string;
  operador: string;
  notas?: string;
  costoMateriales: number;
  costoManoObra: number;
  costoTotal: number;
  localId: string;
}

export const mockOrdenesProduccion: OrdenProduccion[] = [
  {
    id: '1',
    code: 'OP-001',
    bomId: '1',
    productoId: '1',
    productoNombre: 'Producto A - Premium',
    cantidadPlanificada: 100,
    cantidadProducida: 100,
    unidad: 'UN',
    estado: 'COMPLETADA',
    fechaInicio: '2026-02-01',
    fechaFinPlanificada: '2026-02-05',
    fechaFinReal: '2026-02-05',
    operador: 'Juan Pérez',
    notas: 'Producción completada sin novedades',
    costoMateriales: 385000,
    costoManoObra: 25000,
    costoTotal: 410000,
    localId: '1'
  },
  {
    id: '2',
    code: 'OP-002',
    bomId: '2',
    productoId: '2',
    productoNombre: 'Producto B - Standard',
    cantidadPlanificada: 200,
    cantidadProducida: 150,
    unidad: 'UN',
    estado: 'EN_PROCESO',
    fechaInicio: '2026-02-07',
    fechaFinPlanificada: '2026-02-12',
    operador: 'María González',
    notas: 'En proceso - 75% completado',
    costoMateriales: 433500,
    costoManoObra: 30000,
    costoTotal: 463500,
    localId: '1'
  },
  {
    id: '3',
    code: 'OP-003',
    bomId: '1',
    productoId: '1',
    productoNombre: 'Producto A - Premium',
    cantidadPlanificada: 50,
    cantidadProducida: 0,
    unidad: 'UN',
    estado: 'PLANIFICADA',
    fechaInicio: '2026-02-15',
    fechaFinPlanificada: '2026-02-18',
    operador: 'Carlos Rodríguez',
    notas: 'Pendiente inicio de producción',
    costoMateriales: 192500,
    costoManoObra: 15000,
    costoTotal: 207500,
    localId: '3'
  }
];

// Materias primas e insumos
export interface MaterialProduccion {
  id: string;
  code: string;
  nombre: string;
  tipo: TipoProducto;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  costoUnitario: number;
  proveedorId: string;
  proveedorNombre: string;
  localId: string;
}

export const mockMateriales: MaterialProduccion[] = [
  {
    id: 'MP-001',
    code: 'MP-001',
    nombre: 'Materia Prima Base',
    tipo: 'MATERIA_PRIMA',
    unidad: 'KG',
    stockActual: 500,
    stockMinimo: 100,
    stockMaximo: 1000,
    costoUnitario: 1200,
    proveedorId: '1',
    proveedorNombre: 'Proveedor Alpha',
    localId: '1'
  },
  {
    id: 'INS-001',
    code: 'INS-001',
    nombre: 'Insumo Químico A',
    tipo: 'INSUMO',
    unidad: 'LT',
    stockActual: 80,
    stockMinimo: 20,
    stockMaximo: 200,
    costoUnitario: 800,
    proveedorId: '2',
    proveedorNombre: 'Proveedor Beta',
    localId: '1'
  },
  {
    id: 'INS-002',
    code: 'INS-002',
    nombre: 'Envase Premium',
    tipo: 'INSUMO',
    unidad: 'UN',
    stockActual: 250,
    stockMinimo: 50,
    stockMaximo: 500,
    costoUnitario: 450,
    proveedorId: '1',
    proveedorNombre: 'Proveedor Alpha',
    localId: '1'
  },
  {
    id: 'INS-003',
    code: 'INS-003',
    nombre: 'Envase Standard',
    tipo: 'INSUMO',
    unidad: 'UN',
    stockActual: 400,
    stockMinimo: 100,
    stockMaximo: 800,
    costoUnitario: 250,
    proveedorId: '1',
    proveedorNombre: 'Proveedor Alpha',
    localId: '1'
  }
];

// ==================== MÓDULO DE CONTABILIDAD ====================

// Plan de cuentas contables
export type TipoCuenta = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'EGRESO';
export type NaturalezaCuenta = 'DEUDORA' | 'ACREEDORA';

export interface CuentaContable {
  id: string;
  code: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel: number;
  cuentaPadreId?: string;
  cuentaPadreNombre?: string;
  imputable: boolean;
  activa: boolean;
  saldo: number;
}

export const mockPlanCuentas: CuentaContable[] = [
  // ACTIVOS
  { id: '1', code: '1', nombre: 'ACTIVO', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 1, imputable: false, activa: true, saldo: 0 },
  { id: '1.1', code: '1.1', nombre: 'ACTIVO CORRIENTE', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 2, cuentaPadreId: '1', cuentaPadreNombre: 'ACTIVO', imputable: false, activa: true, saldo: 0 },
  { id: '1.1.1', code: '1.1.1', nombre: 'Caja y Bancos', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '1.1', cuentaPadreNombre: 'ACTIVO CORRIENTE', imputable: false, activa: true, saldo: 0 },
  { id: '1.1.1.1', code: '1.1.1.1', nombre: 'Caja General', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 4, cuentaPadreId: '1.1.1', cuentaPadreNombre: 'Caja y Bancos', imputable: true, activa: true, saldo: 125000 },
  { id: '1.1.1.2', code: '1.1.1.2', nombre: 'Banco Nación Cta Cte', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 4, cuentaPadreId: '1.1.1', cuentaPadreNombre: 'Caja y Bancos', imputable: true, activa: true, saldo: 450000 },
  { id: '1.1.2', code: '1.1.2', nombre: 'Deudores por Ventas', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '1.1', cuentaPadreNombre: 'ACTIVO CORRIENTE', imputable: true, activa: true, saldo: 250000 },
  { id: '1.1.3', code: '1.1.3', nombre: 'Inventarios', tipo: 'ACTIVO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '1.1', cuentaPadreNombre: 'ACTIVO CORRIENTE', imputable: true, activa: true, saldo: 680000 },
  
  // PASIVOS
  { id: '2', code: '2', nombre: 'PASIVO', tipo: 'PASIVO', naturaleza: 'ACREEDORA', nivel: 1, imputable: false, activa: true, saldo: 0 },
  { id: '2.1', code: '2.1', nombre: 'PASIVO CORRIENTE', tipo: 'PASIVO', naturaleza: 'ACREEDORA', nivel: 2, cuentaPadreId: '2', cuentaPadreNombre: 'PASIVO', imputable: false, activa: true, saldo: 0 },
  { id: '2.1.1', code: '2.1.1', nombre: 'Proveedores', tipo: 'PASIVO', naturaleza: 'ACREEDORA', nivel: 3, cuentaPadreId: '2.1', cuentaPadreNombre: 'PASIVO CORRIENTE', imputable: true, activa: true, saldo: 180000 },
  { id: '2.1.2', code: '2.1.2', nombre: 'Sueldos a Pagar', tipo: 'PASIVO', naturaleza: 'ACREEDORA', nivel: 3, cuentaPadreId: '2.1', cuentaPadreNombre: 'PASIVO CORRIENTE', imputable: true, activa: true, saldo: 95000 },
  
  // PATRIMONIO
  { id: '3', code: '3', nombre: 'PATRIMONIO NETO', tipo: 'PATRIMONIO', naturaleza: 'ACREEDORA', nivel: 1, imputable: false, activa: true, saldo: 0 },
  { id: '3.1', code: '3.1', nombre: 'Capital Social', tipo: 'PATRIMONIO', naturaleza: 'ACREEDORA', nivel: 2, cuentaPadreId: '3', cuentaPadreNombre: 'PATRIMONIO NETO', imputable: true, activa: true, saldo: 500000 },
  { id: '3.2', code: '3.2', nombre: 'Resultados Acumulados', tipo: 'PATRIMONIO', naturaleza: 'ACREEDORA', nivel: 2, cuentaPadreId: '3', cuentaPadreNombre: 'PATRIMONIO NETO', imputable: true, activa: true, saldo: 350000 },
  
  // INGRESOS
  { id: '4', code: '4', nombre: 'INGRESOS', tipo: 'INGRESO', naturaleza: 'ACREEDORA', nivel: 1, imputable: false, activa: true, saldo: 0 },
  { id: '4.1', code: '4.1', nombre: 'Ventas', tipo: 'INGRESO', naturaleza: 'ACREEDORA', nivel: 2, cuentaPadreId: '4', cuentaPadreNombre: 'INGRESOS', imputable: true, activa: true, saldo: 1250000 },
  { id: '4.2', code: '4.2', nombre: 'Ingresos Financieros', tipo: 'INGRESO', naturaleza: 'ACREEDORA', nivel: 2, cuentaPadreId: '4', cuentaPadreNombre: 'INGRESOS', imputable: true, activa: true, saldo: 15000 },
  
  // EGRESOS
  { id: '5', code: '5', nombre: 'EGRESOS', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 1, imputable: false, activa: true, saldo: 0 },
  { id: '5.1', code: '5.1', nombre: 'Costo de Ventas', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 2, cuentaPadreId: '5', cuentaPadreNombre: 'EGRESOS', imputable: true, activa: true, saldo: 520000 },
  { id: '5.2', code: '5.2', nombre: 'Gastos Operativos', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 2, cuentaPadreId: '5', cuentaPadreNombre: 'EGRESOS', imputable: false, activa: true, saldo: 0 },
  { id: '5.2.1', code: '5.2.1', nombre: 'Sueldos y Jornales', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '5.2', cuentaPadreNombre: 'Gastos Operativos', imputable: true, activa: true, saldo: 280000 },
  { id: '5.2.2', code: '5.2.2', nombre: 'Alquileres', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '5.2', cuentaPadreNombre: 'Gastos Operativos', imputable: true, activa: true, saldo: 75000 },
  { id: '5.2.3', code: '5.2.3', nombre: 'Servicios Públicos', tipo: 'EGRESO', naturaleza: 'DEUDORA', nivel: 3, cuentaPadreId: '5.2', cuentaPadreNombre: 'Gastos Operativos', imputable: true, activa: true, saldo: 35000 },
];

// Asientos contables
export interface AsientoContable {
  id: string;
  numero: number;
  fecha: string;
  descripcion: string;
  tipo: 'MANUAL' | 'AUTOMATICO';
  origen?: string;
  detalles: DetalleAsiento[];
  totalDebe: number;
  totalHaber: number;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'ANULADO';
  creadoPor: string;
  localId: string;
}

export interface DetalleAsiento {
  id: string;
  cuentaId: string;
  cuentaCode: string;
  cuentaNombre: string;
  debe: number;
  haber: number;
  descripcion?: string;
}

export const mockAsientosContables: AsientoContable[] = [
  {
    id: '1',
    numero: 1,
    fecha: '2026-02-01',
    descripcion: 'Venta de productos - Factura SF-00001',
    tipo: 'AUTOMATICO',
    origen: 'VENTAS',
    detalles: [
      {
        id: '1',
        cuentaId: '1.1.2',
        cuentaCode: '1.1.2',
        cuentaNombre: 'Deudores por Ventas',
        debe: 12500,
        haber: 0,
        descripcion: 'Cliente: Empresa ABC S.A.'
      },
      {
        id: '2',
        cuentaId: '4.1',
        cuentaCode: '4.1',
        cuentaNombre: 'Ventas',
        debe: 0,
        haber: 12500,
        descripcion: 'Venta productos'
      }
    ],
    totalDebe: 12500,
    totalHaber: 12500,
    estado: 'CONFIRMADO',
    creadoPor: 'Sistema',
    localId: '1'
  },
  {
    id: '2',
    numero: 2,
    fecha: '2026-02-05',
    descripcion: 'Pago de alquiler mes febrero',
    tipo: 'MANUAL',
    detalles: [
      {
        id: '3',
        cuentaId: '5.2.2',
        cuentaCode: '5.2.2',
        cuentaNombre: 'Alquileres',
        debe: 25000,
        haber: 0
      },
      {
        id: '4',
        cuentaId: '1.1.1.2',
        cuentaCode: '1.1.1.2',
        cuentaNombre: 'Banco Nación Cta Cte',
        debe: 0,
        haber: 25000
      }
    ],
    totalDebe: 25000,
    totalHaber: 25000,
    estado: 'CONFIRMADO',
    creadoPor: 'Juan Pérez',
    localId: '1'
  },
  {
    id: '3',
    numero: 3,
    fecha: '2026-02-08',
    descripcion: 'Compra de materias primas - OC-001',
    tipo: 'AUTOMATICO',
    origen: 'COMPRAS',
    detalles: [
      {
        id: '5',
        cuentaId: '1.1.3',
        cuentaCode: '1.1.3',
        cuentaNombre: 'Inventarios',
        debe: 45000,
        haber: 0
      },
      {
        id: '6',
        cuentaId: '2.1.1',
        cuentaCode: '2.1.1',
        cuentaNombre: 'Proveedores',
        debe: 0,
        haber: 45000,
        descripcion: 'Proveedor: Proveedor Alpha'
      }
    ],
    totalDebe: 45000,
    totalHaber: 45000,
    estado: 'CONFIRMADO',
    creadoPor: 'Sistema',
    localId: '1'
  }
];

// Cuentas por cobrar
export interface CuentaPorCobrar {
  id: string;
  clienteId: string;
  clienteNombre: string;
  facturaId: string;
  facturaNumero: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  montoPagado: number;
  montoSaldo: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA';
  diasVencido: number;
  localId: string;
}

export const mockCuentasPorCobrar: CuentaPorCobrar[] = [
  {
    id: '1',
    clienteId: '1',
    clienteNombre: 'Empresa ABC S.A.',
    facturaId: '1',
    facturaNumero: 'SF-00001',
    fechaEmision: '2026-02-01',
    fechaVencimiento: '2026-03-01',
    montoTotal: 12500,
    montoPagado: 0,
    montoSaldo: 12500,
    estado: 'PENDIENTE',
    diasVencido: 0,
    localId: '1'
  },
  {
    id: '2',
    clienteId: '2',
    clienteNombre: 'Comercial XYZ',
    facturaId: '4',
    facturaNumero: 'RS-00001',
    fechaEmision: '2026-01-25',
    fechaVencimiento: '2026-02-25',
    montoTotal: 22800,
    montoPagado: 10000,
    montoSaldo: 12800,
    estado: 'PARCIAL',
    diasVencido: 0,
    localId: '3'
  },
  {
    id: '3',
    clienteId: '3',
    clienteNombre: 'Distribuidora 123',
    facturaId: '2',
    facturaNumero: 'PR-00001',
    fechaEmision: '2026-01-15',
    fechaVencimiento: '2026-01-29',
    montoTotal: 8400,
    montoPagado: 0,
    montoSaldo: 8400,
    estado: 'VENCIDA',
    diasVencido: 11,
    localId: '2'
  }
];

// Cuentas por pagar
export interface CuentaPorPagar {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  ordenCompraId: string;
  ordenCompraNumero: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  montoPagado: number;
  montoSaldo: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA';
  diasVencido: number;
  localId: string;
}

export const mockCuentasPorPagar: CuentaPorPagar[] = [
  {
    id: '1',
    proveedorId: '1',
    proveedorNombre: 'Proveedor Alpha',
    ordenCompraId: '1',
    ordenCompraNumero: 'OC-SF-00001',
    fechaEmision: '2026-02-01',
    fechaVencimiento: '2026-03-15',
    montoTotal: 45000,
    montoPagado: 0,
    montoSaldo: 45000,
    estado: 'PENDIENTE',
    diasVencido: 0,
    localId: '1'
  },
  {
    id: '2',
    proveedorId: '2',
    proveedorNombre: 'Proveedor Beta',
    ordenCompraId: '2',
    ordenCompraNumero: 'OC-PR-00001',
    fechaEmision: '2026-01-28',
    fechaVencimiento: '2026-02-28',
    montoTotal: 15600,
    montoPagado: 15600,
    montoSaldo: 0,
    estado: 'PAGADA',
    diasVencido: 0,
    localId: '2'
  }
];

// Balance y Estado de Resultados (datos calculados)
export interface BalanceGeneral {
  fecha: string;
  activos: {
    corrientes: number;
    noCorrientes: number;
    total: number;
  };
  pasivos: {
    corrientes: number;
    noCorrientes: number;
    total: number;
  };
  patrimonioNeto: number;
  totalPasivoPatrimonio: number;
}

export const mockBalanceGeneral: BalanceGeneral = {
  fecha: '2026-02-09',
  activos: {
    corrientes: 1505000, // Caja + Bancos + Deudores + Inventarios
    noCorrientes: 0,
    total: 1505000
  },
  pasivos: {
    corrientes: 275000, // Proveedores + Sueldos a pagar
    noCorrientes: 0,
    total: 275000
  },
  patrimonioNeto: 850000, // Capital + Resultados
  totalPasivoPatrimonio: 1125000
};

export interface EstadoResultados {
  periodo: string;
  ingresos: {
    ventas: number;
    otros: number;
    total: number;
  };
  egresos: {
    costoVentas: number;
    gastosOperativos: number;
    gastosFinancieros: number;
    total: number;
  };
  utilidadBruta: number;
  utilidadOperativa: number;
  utilidadNeta: number;
}

export const mockEstadoResultados: EstadoResultados = {
  periodo: 'Febrero 2026',
  ingresos: {
    ventas: 1250000,
    otros: 15000,
    total: 1265000
  },
  egresos: {
    costoVentas: 520000,
    gastosOperativos: 390000, // Sueldos + Alquileres + Servicios
    gastosFinancieros: 0,
    total: 910000
  },
  utilidadBruta: 730000,
  utilidadOperativa: 355000,
  utilidadNeta: 355000
};

