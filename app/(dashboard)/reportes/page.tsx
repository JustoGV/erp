import Link from 'next/link';
import { TrendingUp, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-1">Análisis completo del desempeño empresarial</p>
        </div>
      </div>

      {/* Reportes de Ventas */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes de Ventas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Ventas del Mes"
            description="Análisis de ventas mensuales"
            href="/reportes/ventas-mes"
          />
          <ReportCard
            title="Ventas por Cliente"
            description="Ranking de clientes"
            href="/reportes/ventas-cliente"
          />
          <ReportCard
            title="Ventas por Producto"
            description="Productos más vendidos"
            href="/reportes/ventas-producto"
          />
          <ReportCard
            title="Evolución de Ventas"
            description="Tendencia histórica"
            href="/reportes/evolucion-ventas"
          />
          <ReportCard
            title="Margen de Ventas"
            description="Rentabilidad por producto"
            href="/reportes/margen-ventas"
          />
          <ReportCard
            title="Presupuestos vs Ventas"
            description="Tasa de conversión"
            href="/reportes/conversion"
          />
        </div>
      </div>

      {/* Reportes de Compras */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <ShoppingCart size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes de Compras</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Compras del Mes"
            description="Análisis de compras mensuales"
            href="/reportes/compras-mes"
          />
          <ReportCard
            title="Compras por Proveedor"
            description="Ranking de proveedores"
            href="/reportes/compras-proveedor"
          />
          <ReportCard
            title="Órdenes Pendientes"
            description="Órdenes sin recibir"
            href="/reportes/ordenes-pendientes"
          />
        </div>
      </div>

      {/* Reportes de Inventario */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Package size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes de Inventario</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Stock Actual"
            description="Inventario disponible"
            href="/reportes/stock-actual"
          />
          <ReportCard
            title="Stock Bajo Mínimo"
            description="Productos a reponer"
            href="/reportes/stock-minimo"
          />
          <ReportCard
            title="Rotación de Inventario"
            description="Análisis de rotación"
            href="/reportes/rotacion"
          />
          <ReportCard
            title="Valorización de Stock"
            description="Valor del inventario"
            href="/reportes/valorizacion"
          />
          <ReportCard
            title="Movimientos de Stock"
            description="Historial de movimientos"
            href="/reportes/movimientos-stock"
          />
        </div>
      </div>

      {/* Reportes Financieros */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes Financieros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Estado de Caja"
            description="Flujo de caja diario"
            href="/reportes/estado-caja"
          />
          <ReportCard
            title="Cuentas por Cobrar"
            description="Deudas de clientes"
            href="/reportes/cuentas-cobrar"
          />
          <ReportCard
            title="Cuentas por Pagar"
            description="Deudas con proveedores"
            href="/reportes/cuentas-pagar"
          />
          <ReportCard
            title="Balance General"
            description="Estado patrimonial"
            href="/reportes/balance"
          />
          <ReportCard
            title="Estado de Resultados"
            description="Ingresos y egresos"
            href="/reportes/resultados"
          />
          <ReportCard
            title="Flujo de Fondos"
            description="Proyección financiera"
            href="/reportes/flujo-fondos"
          />
        </div>
      </div>

      {/* Reportes de RRHH */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes de RRHH</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard
            title="Liquidaciones"
            description="Sueldos del mes"
            href="/reportes/liquidaciones"
          />
          <ReportCard
            title="Asistencias"
            description="Control de asistencia"
            href="/reportes/asistencias"
          />
          <ReportCard
            title="Costos de Personal"
            description="Análisis de costos laborales"
            href="/reportes/costos-personal"
          />
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
