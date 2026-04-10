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
  | "Super"
  | "Administrador"
  | "Gerente"
  | "Vendedor"
  | "Inventario"
  | "Contador"
  | "RRHH"
  | "Produccion"
  | "SoloLectura";

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
  empresaId?: string;
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
  empresaId?: string;
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
  _count?: { productos: number };
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
  stock?: Array<{ cantidad: number; localId: string; depositoId?: string }>;
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
  local?: { id: string; name: string };
  _count?: { stock: number };
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
  id?: string;
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  localId: string;
  localNombre: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
  unidad: string;
  criticidad: "ADVERTENCIA" | "CRITICO";
  // legacy fields (por compatibilidad)
  cantidad?: number;
  deficit?: number;
  producto?: {
    id: string;
    code: string;
    name: string;
    minStock: number;
    unit: string;
  };
  local?: { id: string; name: string };
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
  fecha?: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  productoId: string;
  localId: string;
  depositoId?: string | null;
  empresaId: string;
  usuarioId?: string;
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
  name: string;
  localId: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  active?: boolean;
}

export interface UpdateClienteDto {
  name?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
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

// ── Compras ───────────────────────────────────────────────────

export type EstadoRequerimiento =
  | "PENDIENTE"
  | "AUTORIZADO"
  | "RECHAZADO"
  | "COMPLETADO"
  | "CANCELADO";

export type EstadoOrdenCompra =
  | "BORRADOR"
  | "ENVIADA"
  | "CONFIRMADA"
  | "RECIBIDA_PARCIAL"
  | "RECIBIDA_COMPLETA"
  | "CANCELADA";

// ---------- Proveedor ----------

export interface Proveedor {
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
  paymentTerms: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { ordenesCompra: number };
}

export interface CreateProveedorDto {
  code: string;
  name: string;
  localId: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentTerms?: number;
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {
  active?: boolean;
}

export interface DeudaProveedor {
  cuentaId: string;
  ordenId: string;
  ordenNumero: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
}

export interface DeudaProveedorResponse {
  saldos: DeudaProveedor[];
  totalDeuda: number;
}

// ---------- Requerimiento ----------

export interface ItemRequerimiento {
  id: string;
  requerimientoId: string;
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioEstimado?: number;
  observaciones?: string;
}

export interface Requerimiento {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  solicitante: string;
  departamento: string;
  justificacion: string;
  fechaNecesidad: string;
  estado: EstadoRequerimiento;
  observaciones?: string;
  autorizadoPor?: string;
  fechaAutorizacion?: string;
  createdAt: string;
  updatedAt: string;
  items?: ItemRequerimiento[];
  _count?: { items: number };
}

export interface ItemRequerimientoDto {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioEstimado?: number;
  observaciones?: string;
}

export interface CreateRequerimientoDto {
  solicitante: string;
  departamento: string;
  justificacion: string;
  fechaNecesidad: string;
  observaciones?: string;
  items: ItemRequerimientoDto[];
}

// ---------- Orden de Compra ----------

export interface ItemOrdenCompra {
  id: string;
  ordenCompraId: string;
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  cantidadRecibida: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface OrdenCompra {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  proveedorId: string;
  requerimientoId?: string;
  fechaEntregaEstimada?: string;
  condicionesPago?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoOrdenCompra;
  observaciones?: string;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
  proveedor?: { id: string; code: string; name: string };
  requerimiento?: { id: string; numero: string };
  items?: ItemOrdenCompra[];
  recepciones?: RecepcionCompra[];
  pagos?: PagoProveedor[];
  totalPagado?: number;
  saldoPendiente?: number;
  _count?: { items: number; recepciones: number; pagos: number };
}

export interface ItemOrdenCompraDto {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento?: number;
}

export interface CreateOrdenCompraDto {
  proveedorId: string;
  requerimientoId?: string;
  fechaEntregaEstimada?: string;
  condicionesPago?: string;
  observaciones?: string;
  items: ItemOrdenCompraDto[];
}

// ---------- Recepción ----------

export interface ItemRecepcion {
  id: string;
  recepcionId: string;
  itemOrdenCompraId: string;
  descripcion: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  motivoRechazo?: string;
  observaciones?: string;
}

export interface RecepcionCompra {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  ordenCompraId: string;
  fechaRecepcion: string;
  observaciones?: string;
  recibidoPor: string;
  conformidad: boolean;
  createdAt: string;
  items?: ItemRecepcion[];
  ordenCompra?: {
    id: string;
    numero: string;
    proveedor?: { id: string; name: string };
    items?: { id: string; descripcion: string; cantidad: number; cantidadRecibida: number; unidad: string }[];
  };
}

export interface ItemRecepcionDto {
  itemOrdenCompraId: string;
  cantidadRecibida: number;
  cantidadRechazada?: number;
  motivoRechazo?: string;
  observaciones?: string;
}

export interface CreateRecepcionDto {
  ordenCompraId: string;
  nroRemito?: string;
  observaciones?: string;
  items: ItemRecepcionDto[];
}

// ---------- Pago a Proveedor ----------

export interface PagoProveedor {
  id: string;
  empresaId: string;
  localId: string;
  proveedorId: string;
  fecha: string;
  monto: number;
  metodoPago: string;
  referencia?: string;
  notas?: string;
  creadoPor: string;
  createdAt: string;
  ordenCompra?: {
    id: string;
    numero: string;
    proveedor?: { id: string; name: string };
  };
}

export interface CreatePagoProveedorDto {
  proveedorId: string;
  cuentaPagarId?: string;
  monto: number;
  metodoPago: string;
  fecha?: string;
  referencia?: string;
  notas?: string;
}

// ── Finanzas ───────────────────────────────────────────────────

export type TipoCuenta =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "INGRESO"
  | "EGRESO";
export type NaturalezaCuenta = "DEUDORA" | "ACREEDORA";
export type EstadoAsiento = "BORRADOR" | "CONFIRMADO" | "ANULADO";
export type TipoRetencion = "IVA" | "GANANCIAS" | "INGRESOS_BRUTOS" | "OTRAS";
export type EstadoCuentaCobrar =
  | "PENDIENTE"
  | "PARCIAL"
  | "COBRADA"
  | "VENCIDA"
  | "INCOBRABLE";
export type EstadoCuentaPagar = "PENDIENTE" | "PARCIAL" | "PAGADA" | "VENCIDA";

// ---------- Plan de Cuentas ----------

export interface CuentaContable {
  id: string;
  empresaId: string;
  code: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel: number;
  cuentaPadreId?: string;
  imputable: boolean;
  createdAt: string;
  parent?: { code: string; nombre: string };
  children?: CuentaContable[];
  _count?: { detallesAsiento: number };
}

export interface CreateCuentaDto {
  code: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel?: number;
  cuentaPadreId?: string;
  imputable?: boolean;
}

export interface MayorContable {
  cuenta: { code: string; nombre: string; naturaleza: NaturalezaCuenta };
  movimientos: Array<{
    id: string;
    debe: number;
    haber: number;
    saldoAcumulado: number;
    descripcion?: string;
    asiento: { id: string; numero: number; fecha: string; descripcion: string };
  }>;
  totales: { debe: number; haber: number; saldoFinal: number };
}

// ---------- Asientos Contables ----------

export interface DetalleAsiento {
  id: string;
  asientoId: string;
  cuentaId: string;
  debe: number;
  haber: number;
  descripcion?: string;
  cuenta?: { code: string; nombre: string; naturaleza: NaturalezaCuenta };
}

export interface AsientoContable {
  id: string;
  empresaId: string;
  numero: number;
  fecha: string;
  descripcion: string;
  referencia?: string;
  totalDebe: number;
  totalHaber: number;
  estado: EstadoAsiento;
  tipo: string;
  creadoPor: string;
  createdAt: string;
  detalles?: DetalleAsiento[];
  _count?: { detalles: number };
}

export interface DetalleAsientoDto {
  cuentaId: string;
  debe: number;
  haber: number;
  descripcion?: string;
}

export interface CreateAsientoDto {
  fecha?: string;
  descripcion: string;
  referencia?: string;
  detalles: DetalleAsientoDto[];
}

export interface UpdateAsientoDto {
  fecha?: string;
  descripcion?: string;
  referencia?: string;
  detalles?: DetalleAsientoDto[];
}

// ---------- Cuentas por Cobrar ----------

export interface CuentaPorCobrar {
  id: string;
  empresaId: string;
  localId: string;
  clienteId: string;
  facturaId?: string;
  estado: EstadoCuentaCobrar;
  montoOriginal: number;
  montoSaldo: number;
  fechaVencimiento: string;
  diasVencido: number;
  cliente?: { id: string; name: string };
  factura?: { id: string; numero: string; fecha: string };
}

export interface ResumenCxC {
  totalPendiente: number;
  totalVencido: number;
  cantidadPendiente: number;
  cantidadVencida: number;
}

// ---------- Cuentas por Pagar ----------

export interface CuentaPorPagar {
  id: string;
  empresaId: string;
  localId: string;
  proveedorId: string;
  ordenCompraId?: string;
  estado: EstadoCuentaPagar;
  montoOriginal: number;
  montoSaldo: number;
  fechaVencimiento: string;
  diasVencido: number;
  proveedor?: { id: string; name: string };
  ordenCompra?: { id: string; numero: string; fecha: string };
}

export interface ResumenCxP {
  totalPendiente: number;
  totalVencido: number;
  cantidadPendiente: number;
  cantidadVencida: number;
}

// ---------- Bancos ----------

export interface CuentaBancaria {
  id: string;
  empresaId: string;
  numero: string;
  alias?: string;
  tipoCuenta: string;
  saldo: number;
  banco?: { id: string; nombre: string };
  _count?: { movimientos: number };
}

export interface MovimientoBancario {
  id: string;
  empresaId: string;
  cuentaBancariaId: string;
  tipo: "CREDITO" | "DEBITO";
  monto: number;
  fecha: string;
  concepto: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  creadoPor: string;
  createdAt: string;
}

export interface CreateCuentaBancariaDto {
  numero: string;
  alias?: string;
  tipoCuenta: "CORRIENTE" | "CAJA_AHORRO" | "PLAZO_FIJO" | "OTRA";
  bancoNombre: string;
  saldoInicial?: number;
}

export interface CreateMovimientoBancarioDto {
  cuentaBancariaId: string;
  tipo: "CREDITO" | "DEBITO";
  monto: number;
  concepto: string;
  fecha?: string;
  referencia?: string;
}

// ---------- Caja ----------

export interface CajaLocal {
  id: string;
  empresaId: string;
  localId: string;
  saldo: number;
  updatedAt: string;
}

export interface MovimientoCaja {
  id: string;
  empresaId: string;
  localId: string;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  concepto: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  creadoPor: string;
  fecha: string;
  createdAt: string;
}

export interface MovimientoCajaDto {
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  concepto: string;
  referencia?: string;
}

// ---------- Retenciones ----------

export interface Retencion {
  id: string;
  empresaId: string;
  localId: string;
  tipo: TipoRetencion;
  numero: string;
  fecha: string;
  proveedorNombre?: string;
  clienteNombre?: string;
  importe: number;
  alicuota: number;
  baseImponible: number;
  descripcion?: string;
  creadoPor: string;
  createdAt: string;
}

export interface CreateRetencionDto {
  tipo: TipoRetencion;
  numero: string;
  importe: number;
  alicuota: number;
  baseImponible: number;
  fecha?: string;
  proveedorNombre?: string;
  clienteNombre?: string;
  descripcion?: string;
}
