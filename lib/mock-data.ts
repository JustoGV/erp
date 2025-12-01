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
