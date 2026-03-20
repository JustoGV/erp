"use client";

import { Search } from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterFieldType = "text" | "select" | "boolean" | "date" | "number";

export interface FilterField {
  /** Internal key — passed back to onSearch so the page can map it to a query param */
  key: string;
  /** Label shown in the attribute selector dropdown */
  label: string;
  /** Controls which input is rendered when this field is selected */
  type: FilterFieldType;
  /** Options for type="select" */
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface EntitySearchBarProps {
  /** Column definitions — shown as options in the attribute selector */
  fields: FilterField[];
  /**
   * Called when the user clicks Buscar or presses Enter.
   * Receives the selected field key and the typed/chosen value.
   */
  onSearch: (key: string, value: string) => void;
}

// ─── Shared class ─────────────────────────────────────────────────────────────

const cls =
  "h-8 rounded border border-slate-300 bg-white px-2 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

// ─── Component ────────────────────────────────────────────────────────────────

export default function EntitySearchBar({ fields, onSearch }: EntitySearchBarProps) {
  const [selectedKey, setSelectedKey] = useState(fields[0]?.key ?? "");
  const [inputValue, setInputValue] = useState("");

  const selectedField = fields.find((f) => f.key === selectedKey) ?? fields[0];

  const handleFieldChange = (key: string) => {
    setSelectedKey(key);
    setInputValue("");
  };

  const commit = () => onSearch(selectedKey, inputValue.trim());

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* ── Adaptive input control ────────────────────────────── */}
      {selectedField?.type === "text" && (
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            className={`${cls} pl-6 min-w-[200px]`}
            placeholder={selectedField.placeholder ?? `Buscar por ${selectedField.label}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKey}
          />
        </div>
      )}

      {selectedField?.type === "boolean" && (
        <select
          className={cls}
          aria-label={selectedField.label}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      )}

      {selectedField?.type === "select" && (
        <select
          className={cls}
          aria-label={selectedField.label}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        >
          <option value="">Todos</option>
          {selectedField.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {selectedField?.type === "date" && (
        <input
          type="date"
          className={cls}
          aria-label={selectedField.label}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKey}
        />
      )}

      {selectedField?.type === "number" && (
        <input
          type="number"
          className={`${cls} w-28`}
          aria-label={selectedField.label}
          placeholder={selectedField.placeholder ?? selectedField.label}
          min={selectedField.min}
          max={selectedField.max}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKey}
        />
      )}

      {/* ── Attribute selector ────────────────────────────────── */}
      <select
        className={cls}
        aria-label="Atributo de búsqueda"
        value={selectedKey}
        onChange={(e) => handleFieldChange(e.target.value)}
      >
        {fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>

      {/* ── Buscar ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={commit}
        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-1.5 shrink-0 transition-colors"
      >
        <Search size={13} />
        Buscar
      </button>
    </div>
  );
}

