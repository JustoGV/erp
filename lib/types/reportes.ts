// ─── Filtros generales ───────────────────────────────────────────────────────

export interface ReporteFiltros {
  desde?: string;
  hasta?: string;
  localId?: string;
  clienteId?: string;
  proveedorId?: string;
  empleadoId?: string;
  formato?: "json" | "xlsx";
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface DashboardKPIs {
  ventasMes: {
    total: number;
    cantidad: number;
  };
  comprasMes: {
    total: number;
    cantidad: number;
  };
  stockAlertas: number;
  ordenesProdPendientes: number;
  empleadosActivos: number;
  cxcVencidas: number;
}

// ─── Reporte Ventas ──────────────────────────────────────────────────────────

export interface FacturaResumen {
  numero: string;
  fecha: string;
  cliente: string;
  taxId: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
}

export interface ReporteVentas {
  facturas: FacturaResumen[];
  resumen: {
    totalFacturado: number;
    cantidadFacturas: number;
  };
  porCliente: Array<{
    nombre: string;
    total: number;
    cantidad: number;
  }>;
  porMes: Array<{
    nombre: string;
    total: number;
    cantidad: number;
  }>;
}

// ─── Reporte Compras ─────────────────────────────────────────────────────────

export interface OrdenCompraResumen {
  numero: string;
  fecha: string;
  proveedor: string;
  total: number;
  estado: string;
}

export interface ReporteCompras {
  ordenes: OrdenCompraResumen[];
  resumen: {
    totalComprado: number;
    totalPagado: number;
  };
  porProveedor: Array<{
    nombre: string;
    total: number;
    cantidad: number;
  }>;
}

// ─── Reporte Inventario ──────────────────────────────────────────────────────

export interface ItemInventarioResumen {
  sku: string;
  nombre: string;
  categoria: string;
  deposito: string;
  local: string;
  cantidad: number;
  costo: number;
  valorizado: number;
  alertaStock: boolean;
}

export interface ReporteInventario {
  items: ItemInventarioResumen[];
  resumen: {
    valorizacionTotal: number;
    productosConAlerta: number;
  };
}

// ─── Reporte RRHH ────────────────────────────────────────────────────────────

export interface LiquidacionResumen {
  legajo: string;
  nombre: string;
  cargo: string;
  departamento: string;
  periodo: string;
  totalBruto: number;
  totalDescuentos: number;
  totalNeto: number;
  estado: string;
}

export interface ReporteRRHH {
  liquidaciones: LiquidacionResumen[];
  resumen: {
    totalBruto: number;
    totalDescuentos: number;
    totalNeto: number;
    cantidad: number;
  };
}

// ─── Reporte Resultados ──────────────────────────────────────────────────────

export interface ReporteResultados {
  periodo: {
    desde: string;
    hasta: string;
  };
  ingresos: number;
  egresos: number;
  resultado: number;
  esGanancia: boolean;
}
