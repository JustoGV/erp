'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Clock,
  Building2
} from 'lucide-react';
import { mockStats, mockStatsByLocal, mockProductosVendidos, mockFacturas, mockAlertas, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState(mockStats);
  const [facturas, setFacturas] = useState(mockFacturas);
  
  // Actualizar datos cuando cambia el local
  useEffect(() => {
    const newStats = isAllLocales ? mockStats : mockStatsByLocal[selectedLocal?.id || '1'];
    const newFacturas = isAllLocales 
      ? mockFacturas 
      : mockFacturas.filter(f => f.localId === selectedLocal?.id);
    
    setStats(newStats);
    setFacturas(newFacturas);
  }, [selectedLocal, isAllLocales]);

  const localName = isAllLocales ? 'Todos los locales' : selectedLocal?.name || '';
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={16} />
              <span className="font-medium">{localName}</span>
            </div>
            <span className="text-slate-300">•</span>
            <p className="text-slate-600 flex items-center gap-2">
              <Clock size={16} />
              Actualizado hace 5 minutos
            </p>
          </div>
        </div>
        <button className="btn btn-primary">
          <BarChart3 size={18} />
          Generar Reporte
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas del Mes"
          value={`$${stats.ventasMes.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={<DollarSign size={24} />}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Compras del Mes"
          value={`$${stats.comprasMes.toLocaleString()}`}
          change="+8.2%"
          trend="up"
          icon={<ShoppingCart size={24} />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Productos en Stock"
          value={stats.stockProductos.toLocaleString()}
          change="-3.1%"
          trend="down"
          icon={<Package size={24} />}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Clientes Activos"
          value={stats.clientesActivos.toString()}
          change="+5.7%"
          trend="up"
          icon={<Users size={24} />}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas de los últimos 6 meses</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver detalle
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="text-center">
              <BarChart3 size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Gráfico de ventas</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Productos más vendidos</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todos
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {mockProductosVendidos.map((product, index) => (
              <ProductItem 
                key={index}
                rank={index + 1}
                name={product.name} 
                sales={`$${product.sales.toLocaleString()}`} 
                units={product.units.toString()} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Facturas Recientes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todas
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {facturas.slice(0, 4).map((invoice) => (
                  <InvoiceRow 
                    key={invoice.id}
                    number={invoice.invoiceNumber} 
                    customer={invoice.customerName} 
                    amount={`$${invoice.total.toLocaleString()}`} 
                    status={invoice.status.toLowerCase() as 'paid' | 'pending' | 'overdue'} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alertas y Notificaciones</h3>
            <span className="badge badge-danger">{mockAlertas.length}</span>
          </div>
          <div className="space-y-3">
            {mockAlertas.map((alerta) => (
              <AlertItem
                key={alerta.id}
                type={alerta.type}
                message={alerta.message}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  gradient 
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down'; 
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
      {/* Background gradient effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{value}</p>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
              {trend === 'up' ? (
                <TrendingUp size={14} className="text-emerald-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={`text-xs font-semibold ${
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            </div>
            <span className="text-xs text-slate-500">vs mes anterior</span>
          </div>
        </div>
        <div className={`stat-icon bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProductItem({ rank, name, sales, units }: { rank: number; name: string; sales: string; units: string }) {
  const rankColors = ['bg-gradient-to-r from-yellow-400 to-yellow-500', 'bg-gradient-to-r from-slate-300 to-slate-400', 'bg-gradient-to-r from-orange-400 to-orange-500', 'bg-slate-200', 'bg-slate-200'];
  
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
      <div className={`w-8 h-8 ${rankColors[rank - 1]} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{name}</p>
        <p className="text-sm text-slate-600">{units} unidades vendidas</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-slate-900">{sales}</p>
        <div className="h-1 w-12 bg-slate-200 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${80 - (rank - 1) * 10}%` }} />
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ 
  number, 
  customer, 
  amount, 
  status 
}: { 
  number: string; 
  customer: string; 
  amount: string; 
  status: 'paid' | 'pending' | 'overdue';
}) {
  const statusClasses = {
    paid: 'badge-success',
    pending: 'badge-warning',
    overdue: 'badge-danger',
  }[status];

  const statusText = {
    paid: 'Pagada',
    pending: 'Pendiente',
    overdue: 'Vencida',
  }[status];

  return (
    <tr className="table-row-hover">
      <td className="font-mono text-xs">{number}</td>
      <td className="font-medium">{customer}</td>
      <td className="font-semibold">{amount}</td>
      <td>
        <span className={`badge ${statusClasses}`}>{statusText}</span>
      </td>
    </tr>
  );
}

function AlertItem({ type, message }: { type: 'warning' | 'danger' | 'info'; message: string }) {
  const config = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-500',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  }[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} hover:shadow-sm transition-shadow duration-200`}>
      <div className={`p-2 rounded-lg ${config.bg} ring-1 ring-inset ${config.border}`}>
        <AlertTriangle size={18} className={config.icon} />
      </div>
      <p className={`text-sm flex-1 ${config.text} leading-relaxed`}>{message}</p>
    </div>
  );
}
