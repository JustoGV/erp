'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">Página {page} de {totalPages}</p>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-secondary px-3 py-1"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="btn btn-secondary px-3 py-1"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
