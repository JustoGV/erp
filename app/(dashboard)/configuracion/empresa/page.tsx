"use client";

import { Building } from "lucide-react";
import { useEmpresas } from "@/hooks/useEmpresas";

export default function EmpresaPage() {
  const { data: empresas, isLoading } = useEmpresas();
  const items = empresas ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building size={24} /> Empresas
        </h1>
        <p className="text-slate-500">{items.length} empresas registradas</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>CUIT / RUT</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron empresas.</td></tr>
              ) : (
                items.map((e) => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="font-mono text-xs">{e.code}</td>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.taxId ?? "—"}</td>
                    <td>{e.city ?? "—"}</td>
                    <td>{e.phone ?? "—"}</td>
                    <td>{e.email ?? "—"}</td>
                    <td>
                      <span className={`badge ${e.active ? "badge-success" : "badge-secondary"}`}>
                        {e.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
