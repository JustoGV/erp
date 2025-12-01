'use client';

import Link from 'next/link';
import { Construction, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
              <Construction size={80} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            Página en Preparación
          </h1>
          <p className="text-lg text-slate-600">
            Esta sección está siendo desarrollada y estará disponible próximamente.
          </p>
        </div>

        {/* Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Estamos trabajando en ello.</span> Esta funcionalidad se agregará en una futura actualización del sistema.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-secondary"
          >
            <ArrowLeft size={18} />
            Volver Atrás
          </button>
          <Link href="/dashboard" className="btn btn-primary">
            <Home size={18} />
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
