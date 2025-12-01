'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, CreditCard, Building2 } from 'lucide-react';

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    creditLimit: 0,
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulación de guardado (hardcoded)
    setTimeout(() => {
      console.log('Cliente guardado:', formData);
      alert('✅ Cliente creado exitosamente');
      setLoading(false);
      router.push('/ventas/clientes');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/ventas/clientes" 
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Cliente</h1>
          <p className="text-slate-600 mt-1">Completa los datos del nuevo cliente</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="card-title">Información Básica</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                Código *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="input"
                placeholder="CLI-001"
              />
            </div>

            <div>
              <label className="label">
                Nombre / Razón Social *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Empresa ABC S.A."
              />
            </div>

            <div>
              <label className="label">
                CUIT / DNI
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="input"
                placeholder="20-12345678-9"
              />
            </div>

            <div>
              <label className="label">
                Límite de Crédito
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                  $
                </div>
                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  className="input pl-8"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Mail size={20} />
              </div>
              <h3 className="card-title">Información de Contacto</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="contacto@empresa.com"
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
                placeholder="11-4444-5555"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="card-title">Dirección</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Av. Corrientes 1234"
              />
            </div>

            <div>
              <label className="label">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                placeholder="Buenos Aires"
              />
            </div>

            <div>
              <label className="label">
                Provincia
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input"
                placeholder="Buenos Aires"
              />
            </div>

            <div>
              <label className="label">
                Código Postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="input"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="label">
                País
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
          <Link href="/ventas/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
