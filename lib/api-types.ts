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

// ── Inventario ────────────────────────────────────────────────

export type TipoProducto =
  | "TERMINADO"
  | "SEMI_TERMINADO"
  | "MATERIA_PRIMA"
  | "INSUMO";

export type TipoMovimientoStock =
  | "ENTRADA"
  | "SALIDA"
  | "TRANSFERENCIA"
  | "AJUSTE_POSITIVO"
  | "AJUSTE_NEGATIVO"
  | "PRODUCCION_ENTRADA"
  | "PRODUCCION_SALIDA";

export interface Categoria {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  empresaId: string;
  createdAt: string;
}

export interface CreateCategoriaDto {
  name: string;
  description?: string;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
  active?: boolean;
}

export interface Producto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  tipo: TipoProducto;
  unit: string;
  cost: number;
  price: number;
  minStock: number;
  active: boolean;
  empresaId: string;
  categoriaId?: string | null;
  categoria?: Pick<Categoria, "id" | "name"> | null;
  stockTotal?: number;
  alertaStockBajo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoDto {
  code: string;
  name: string;
  description?: string;
  tipo: TipoProducto;
  unit: string;
  cost: number;
  price: number;
  minStock: number;
  categoriaId?: string;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  active?: boolean;
}

export interface FilterProductoDto {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: TipoProducto;
  categoriaId?: string;
  active?: boolean;
  stockBajo?: boolean;
  localId?: string;
}

export interface Deposito {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  active: boolean;
  localId: string;
  empresaId: string;
  createdAt: string;
}

export interface CreateDepositoDto {
  code: string;
  name: string;
  localId: string;
  address?: string;
}

export interface UpdateDepositoDto extends Partial<CreateDepositoDto> {
  active?: boolean;
}

export interface StockItem {
  id: string;
  cantidad: number;
  productoId: string;
  localId: string;
  depositoId?: string | null;
  empresaId: string;
  producto?: {
    id: string;
    code: string;
    name: string;
    unit: string;
    minStock: number;
    price: number;
    cost: number;
  };
  deposito?: { id: string; name: string } | null;
  local?: { id: string; name: string; city?: string | null };
  alertaStockBajo?: boolean;
  valorTotal?: number;
}

export interface StockPorProducto {
  stockPorLocal: StockItem[];
  stockTotal: number;
}

export interface AlertaStock {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  localId: string;
  localNombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  diferencia: number;
}

export interface AjusteStockDto {
  productoId: string;
  tipo: "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO";
  cantidad: number;
  depositoId?: string;
  observaciones: string;
}

export interface TransferenciaStockDto {
  productoId: string;
  localDestinoId: string;
  cantidad: number;
  observaciones?: string;
}

export interface MovimientoStock {
  id: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  productoId: string;
  localId: string;
  depositoId?: string | null;
  empresaId: string;
  usuarioId: string;
  observaciones?: string | null;
  referencia?: string | null;
  createdAt: string;
  producto?: Pick<Producto, "id" | "code" | "name" | "unit">;
  local?: { id: string; name: string };
}

// ── Ventas ────────────────────────────────────────────────────

export type EstadoPresupuesto =
  | "BORRADOR"
  | "ENVIADO"
  | "APROBADO"
  | "RECHAZADO"
  | "VENCIDO";

export type EstadoPedido =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "LISTO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export type EstadoFactura =
  | "PENDIENTE"
  | "PARCIAL"
  | "PAGADA"
  | "VENCIDA"
  | "ANULADA";

// ---------- Cliente ----------

export interface Cliente {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  creditLimit: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDto {
  code: string;
  name: string;
  localId: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
}

export interface UpdateClienteDto extends Partial<
  Omit<CreateClienteDto, "code">
> {
  active?: boolean;
}

export interface FilterClienteDto {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
  active?: boolean;
}

// ---------- Presupuesto ----------

export interface ItemPresupuesto {
  id: string;
  presupuestoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface Presupuesto {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  clienteId: string;
  fecha: string;
  fechaVencimiento: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoPresupuesto;
  notas?: string;
  vendedor: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  items?: ItemPresupuesto[];
  _count?: { items: number };
}

export interface ItemPresupuestoDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
}

export interface CreatePresupuestoDto {
  clienteId: string;
  fechaVencimiento?: string;
  notas?: string;
  items: ItemPresupuestoDto[];
}

// ---------- Pedido ----------

export interface ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  cantidadEntregada: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface PedidoVenta {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  presupuestoId?: string;
  clienteId: string;
  fecha: string;
  fechaEntregaEstimada: string;
  fechaEntregaReal?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoPedido;
  notas?: string;
  vendedor: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  presupuesto?: { id: string; numero: string };
  factura?: { id: string; numero: string; estado: EstadoFactura };
  items?: ItemPedido[];
}

// ---------- Factura ----------

export interface ItemFactura {
  id: string;
  facturaId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { code: string; name: string; unit: string };
}

export interface Factura {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  pedidoId?: string;
  clienteId: string;
  fecha: string;
  fechaVencimiento: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoFactura;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  pedido?: { id: string; numero: string };
  items?: ItemFactura[];
  cobranzas?: Cobranza[];
  totalCobrado?: number;
  saldoPendiente?: number;
}

export interface CreateFacturaDto {
  pedidoId: string;
  fechaVencimiento?: string;
  notas?: string;
}

// ---------- Cobranza ----------

export interface Cobranza {
  id: string;
  empresaId: string;
  localId: string;
  facturaId: string;
  fecha: string;
  monto: number;
  metodoPago: string;
  referencia?: string;
  notas?: string;
  creadoPor: string;
  createdAt: string;
}

export interface CreateCobranzaDto {
  facturaId: string;
  monto: number;
  metodoPago: string;
  fecha?: string;
  referencia?: string;
  notas?: string;
}

// ---------- Saldos cliente ----------

export interface SaldoFactura {
  facturaId: string;
  numero: string;
  fecha: string;
  vencimiento: string;
  total: number;
  cobrado: number;
  saldoPendiente: number;
  vencida: boolean;
}

export interface SaldosCliente {
  saldos: SaldoFactura[];
  totalPendiente: number;
}
