"use client";

import React, { Component, ErrorInfo } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: React.ReactNode;
  /** Nombre de la sección para los logs (ej: "inventario", "ventas") */
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Captura errores de renderizado y muestra un fallback amigable
 * en vez de la pantalla blanca de Next.js.
 *
 * Loguea automáticamente el error con contexto.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error(
      `Error de renderizado en ${this.props.section ?? "desconocido"}: ${error.message}`,
      "render",
      {
        stack: error.stack?.slice(0, 500),
        componentStack: info.componentStack?.slice(0, 500),
        section: this.props.section,
      },
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 my-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-2 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                Ocurrió un error inesperado
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Hubo un problema al mostrar esta sección. Podés intentar de
                nuevo o volver al inicio.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-3 rounded bg-red-100 p-3 text-xs text-red-900 overflow-auto max-h-40">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack?.slice(0, 400)}
                </pre>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary text-sm"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="btn btn-secondary text-sm"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
