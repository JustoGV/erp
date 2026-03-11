"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { localesService } from "@/lib/services/config.service";
import type { Local } from "@/lib/api-types";

interface LocalContextType {
  selectedLocal: Local | null;
  setSelectedLocal: (local: Local | null) => void;
  locales: Local[];
  isAllLocales: boolean;
  isLoading: boolean;
}

const LocalContext = createContext<LocalContextType | undefined>(undefined);

export function LocalProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocal, setSelectedLocalState] = useState<Local | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["locales", "all"],
    queryFn: () => localesService.getAll({ limit: 100 }),
  });

  const locales = data?.data ?? [];

  // Restaurar local seleccionado del localStorage cuando carguen los locales
  useEffect(() => {
    if (locales.length === 0) return;

    const savedId = localStorage.getItem("selectedLocalId");
    if (savedId === "all") {
      setSelectedLocalState(null);
    } else if (savedId) {
      const found = locales.find((l) => l.id === savedId);
      setSelectedLocalState(found ?? locales[0] ?? null);
    } else {
      setSelectedLocalState(locales[0] ?? null);
    }
  }, [locales]);

  const setSelectedLocal = (local: Local | null) => {
    setSelectedLocalState(local);
    localStorage.setItem("selectedLocalId", local ? local.id : "all");
  };

  return (
    <LocalContext.Provider
      value={{
        selectedLocal,
        setSelectedLocal,
        locales,
        isAllLocales: selectedLocal === null,
        isLoading,
      }}
    >
      {children}
    </LocalContext.Provider>
  );
}

export function useLocal() {
  const context = useContext(LocalContext);
  if (!context)
    throw new Error("useLocal debe ser usado dentro de un LocalProvider");
  return context;
}
