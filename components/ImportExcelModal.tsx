"use client";

import { useRef, useState } from "react";
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2, MapPin } from "lucide-react";
import * as XLSX from "xlsx";
import Modal from "@/components/Modal";
import { useLocal } from "@/contexts/LocalContext";
import type { Local } from "@/lib/api-types";

export interface ImportColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date";
  example?: string;
  hint?: string;
}

interface RowResult {
  row: number;
  status: "ok" | "error";
  message?: string;
}

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  entityName: string;
  columns: ImportColumn[];
  onImport: (rows: Record<string, unknown>[]) => Promise<void>;
  templateFileName?: string;
}

export default function ImportExcelModal({
  open,
  onClose,
  entityName,
  columns,
  onImport,
  templateFileName,
}: ImportExcelModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState<RowResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const { selectedLocal, isAllLocales, locales } = useLocal();
  const [localOverride, setLocalOverride] = useState<Local | null>(null);
  // Local efectivo para la importación
  const effectiveLocal = isAllLocales ? localOverride : selectedLocal;

  const reset = () => {
    setPreview([]);
    setFileName("");
    setResults([]);
    setDone(false);
    setLocalOverride(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Download a blank template Excel
  const downloadTemplate = () => {
    const header = columns.map((c) => c.label);
    const example = columns.map((c) => c.example ?? "");
    const ws = XLSX.utils.aoa_to_sheet([header, example]);
    // Style column widths
    ws["!cols"] = columns.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entityName);
    XLSX.writeFile(wb, templateFileName ?? `plantilla_${entityName.toLowerCase()}.xlsx`);
  };

  // Parse uploaded file into rows
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      // Map Excel column labels → DTO keys
      const labelToKey: Record<string, string> = {};
      columns.forEach((c) => { labelToKey[c.label] = c.key; });

      const mapped = raw.map((row) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          const dtoKey = labelToKey[k] ?? k;
          if (dtoKey === "id") continue; // el backend genera el id automáticamente
          const colDef = columns.find((c) => c.key === dtoKey);
          if (colDef?.type === "number") {
            out[dtoKey] = v === "" ? undefined : Number(v);
          } else if (colDef?.type === "boolean") {
            out[dtoKey] = v === true || v === "true" || v === 1 || v === "1" || v === "si" || v === "SI";
          } else if (colDef?.type === "date" && v instanceof Date) {
            out[dtoKey] = v.toISOString().slice(0, 10);
          } else {
            out[dtoKey] = v === "" ? undefined : v;
          }
        }
        return out;
      });

      setPreview(mapped.slice(0, 5));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setImporting(true);
    setResults([]);

    // Re-read the full file for import
    const file = fileRef.current.files[0];
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    const labelToKey: Record<string, string> = {};
    columns.forEach((c) => { labelToKey[c.label] = c.key; });

    const rows = raw.map((row) => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        const dtoKey = labelToKey[k] ?? k;
        if (dtoKey === "id") continue; // el backend genera el id automáticamente
        const colDef = columns.find((c) => c.key === dtoKey);
        if (colDef?.type === "number") {
          out[dtoKey] = v === "" ? undefined : Number(v);
        } else if (colDef?.type === "boolean") {
          out[dtoKey] = v === true || v === "true" || v === 1 || v === "1" || v === "si" || v === "SI";
        } else if (colDef?.type === "date" && v instanceof Date) {
          out[dtoKey] = v.toISOString().slice(0, 10);
        } else {
          out[dtoKey] = v === "" ? undefined : v;
        }
      }
      return out;
    });

    const newResults: RowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      // Validate required fields
      const missing = columns
        .filter((c) => c.required)
        .filter((c) => rows[i][c.key] === undefined || rows[i][c.key] === "")
        .map((c) => c.label);
      if (missing.length > 0) {
        newResults.push({ row: i + 2, status: "error", message: `Falta: ${missing.join(", ")}` });
        continue;
      }
      try {
        await onImport([rows[i]]);
        newResults.push({ row: i + 2, status: "ok" });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        newResults.push({ row: i + 2, status: "error", message: msg });
      }
    }

    setResults(newResults);
    setImporting(false);
    setDone(true);
  };

  const okCount = results.filter((r) => r.status === "ok").length;
  const errCount = results.filter((r) => r.status === "error").length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Importar ${entityName} desde Excel`}
    >
      <div className="space-y-4">
        {/* Aviso de local requerido */}
        {isAllLocales && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Seleccioná un local para importar</p>
            </div>
            <p className="text-xs text-amber-600 mb-2">Tenés "Todos los locales" activo. La importación necesita un local específico.</p>
            <select
              className="input w-full"
              value={localOverride?.id ?? ""}
              onChange={(e) => {
                const found = locales.find((l) => l.id === e.target.value) ?? null;
                setLocalOverride(found);
              }}
            >
              <option value="">-- Elegir local --</option>
              {locales.filter((l) => l.active).map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-blue-800">1. Descargá la plantilla</p>
            <p className="text-xs text-blue-600">Completá los datos y subí el archivo</p>
          </div>
          <button onClick={downloadTemplate} className="btn btn-sm flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Plantilla
          </button>
        </div>

        {/* Columns reference */}
        <div className="rounded-lg border bg-gray-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Columnas esperadas
          </p>
          <div className="flex flex-wrap gap-2">
            {columns.map((c) => (
              <div key={c.key} className="flex flex-col gap-0.5">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    c.required
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {c.label}
                  {c.required && " *"}
                </span>
                {c.hint && (
                  <span className="text-xs text-slate-400 px-1">{c.hint}</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">* campos obligatorios</p>
        </div>

        {/* Step 2: Upload file */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">2. Subí el archivo Excel</p>
          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition ${isAllLocales && !effectiveLocal ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}>
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {fileName || (isAllLocales && !effectiveLocal ? "Primero elegí un local" : "Hacé clic o arrastrá un archivo .xlsx / .xls")}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
              disabled={importing || (isAllLocales && !effectiveLocal)}
            />
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && !done && (
          <div className="overflow-x-auto">
            <p className="mb-1 text-sm font-medium text-gray-700">
              Vista previa (primeras {preview.length} filas)
            </p>
            <table className="table text-xs">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key}>{String(row[c.key] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results */}
        {done && (
          <div className="rounded-lg border bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                <CheckCircle className="h-4 w-4" />
                {okCount} importados
              </span>
              {errCount > 0 && (
                <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errCount} errores
                </span>
              )}
            </div>
            {results.filter((r) => r.status === "error").length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results
                  .filter((r) => r.status === "error")
                  .map((r) => (
                    <p key={r.row} className="text-xs text-red-600">
                      Fila {r.row}: {r.message}
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={handleClose} className="btn btn-sm" disabled={importing}>
            <X className="h-4 w-4" />
            Cerrar
          </button>
          {!done && preview.length > 0 && (
            <button
              onClick={handleImport}
              disabled={importing || preview.length === 0 || (isAllLocales && !effectiveLocal)}
              className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? "Importando..." : "Importar"}
            </button>
          )}
          {done && (
            <button onClick={reset} className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700">
              Importar otro archivo
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
