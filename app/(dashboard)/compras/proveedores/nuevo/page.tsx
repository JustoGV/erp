'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2, Mail, Phone, MapPin, User } from 'lucide-react';

export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxId: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Proveedor guardado:', formData);
      alert('✅ Proveedor creado exitosamente');
      setLoading(false);
      router.push('/compras/proveedores');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          href="/compras/proveedores"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Proveedor</h1>
          <p className="text-slate-600 mt-1">Completa los datos del nuevo proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Building2 size={20} />
              </div>
              <h3 className="card-title">Información del Proveedor</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="input"
                placeholder="PROV-001"
              />
            </div>

            <div>
              <label className="label">Nombre / Razón Social *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Proveedor S.A."
              />
            </div>

            <div>
              <label className="label">CUIT</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="input"
                placeholder="30-12345678-9"
              />
            </div>

            <div>
              <label className="label">
                <User size={16} className="inline mr-1" />
                Contacto
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="input"
                placeholder="Nombre del contacto"
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
                placeholder="contacto@proveedor.com"
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
                placeholder="11-5555-6666"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <MapPin size={16} className="inline mr-1" />
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Av. Siempre Viva 123"
              />
            </div>

            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                placeholder="Córdoba"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Proveedor'}
          </button>
          <Link href="/compras/proveedores" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
