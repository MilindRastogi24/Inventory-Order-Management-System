function normalizeColumn(column) {
  if (typeof column === 'string') {
    return { label: column, className: '' };
  }
  return { label: column.label, className: column.className || '' };
}

export default function DataTable({ columns, children, emptyMessage }) {
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 sm:p-8">
        {emptyMessage || 'No data found.'}
      </div>
    );
  }

  const normalizedColumns = columns.map(normalizeColumn);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {normalizedColumns.map((col) => (
                <th
                  key={col.label}
                  className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-4 ${col.className}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      <p className="px-3 py-2 text-center text-xs text-slate-400 sm:hidden">
        Swipe horizontally to see more columns
      </p>
    </div>
  );
}
