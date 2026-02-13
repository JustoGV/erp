'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legajo: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    startDate: '',
    status: 'Activo',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Empleado guardado:', formData);
      alert('✅ Empleado creado exitosamente');
      setLoading(false);
      router.push('/rrhh/empleados');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/rrhh/empleados"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Empleado</h1>
          <p className="text-slate-600 mt-1">Registra un nuevo integrante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="card-title">Datos del Empleado</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Legajo *</label>
              <input
                type="text"
                name="legajo"
                value={formData.legajo}
                onChange={handleChange}
                required
                className="input"
                placeholder="EMP-100"
              />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input"
                placeholder="María"
              />
            </div>

            <div>
              <label className="label">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="input"
                placeholder="González"
              />
            </div>

            <div>
              <label className="label">
                <Mail size={16} className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="maria@empresa.com"
              />
            </div>

            <div>
              <label className="label">
                <Phone size={16} className="inline mr-1" />
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="11-4444-2222"
              />
            </div>

            <div>
              <label className="label">
                <Briefcase size={16} className="inline mr-1" />
                Puesto
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
                placeholder="Analista de RRHH"
              />
            </div>

            <div>
              <label className="label">
                <Calendar size={16} className="inline mr-1" />
                Fecha de Ingreso
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option>Activo</option>
                <option>En licencia</option>
                <option>Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
          <Link href="/rrhh/empleados" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
