export default function Modal({ open, title, children, onClose, footer, size = 'md' }) {
  if (!open) return null;

  const maxWidth = size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex w-full ${maxWidth} max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:rounded-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
