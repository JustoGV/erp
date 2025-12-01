'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockLocales, type Local } from '@/lib/mock-data';

interface LocalContextType {
  selectedLocal: Local | null;
  setSelectedLocal: (local: Local | null) => void;
  locales: Local[];
  isAllLocales: boolean;
}

const LocalContext = createContext<LocalContextType | undefined>(undefined);

export function LocalProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocal, setSelectedLocalState] = useState<Local | null>(null);
  const [locales] = useState<Local[]>(mockLocales);

  // Cargar el local guardado en localStorage al iniciar
  useEffect(() => {
    const savedLocalId = localStorage.getItem('selectedLocalId');
    if (savedLocalId === 'all') {
      setSelectedLocalState(null);
    } else if (savedLocalId) {
      const local = locales.find(l => l.id === savedLocalId);
      if (local) {
        setSelectedLocalState(local);
      } else {
        // Si no existe, seleccionar el primer local
        setSelectedLocalState(locales[0] || null);
      }
    } else {
      // Por defecto, seleccionar el primer local
      setSelectedLocalState(locales[0] || null);
    }
  }, [locales]);

  const setSelectedLocal = (local: Local | null) => {
    setSelectedLocalState(local);
    // Guardar en localStorage
    if (local) {
      localStorage.setItem('selectedLocalId', local.id);
    } else {
      localStorage.setItem('selectedLocalId', 'all');
    }
  };

  const isAllLocales = selectedLocal === null;

  return (
    <LocalContext.Provider value={{ selectedLocal, setSelectedLocal, locales, isAllLocales }}>
      {children}
    </LocalContext.Provider>
  );
}

export function useLocal() {
  const context = useContext(LocalContext);
  if (context === undefined) {
    throw new Error('useLocal debe ser usado dentro de un LocalProvider');
  }
  return context;
}
