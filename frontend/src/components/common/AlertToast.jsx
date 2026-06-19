import { useAppContext } from '../../context/AppContext';

const styles = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  warning: 'bg-amber-500',
  info: 'bg-slate-700',
};

const labels = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

export default function AlertToast() {
  const { alert, clearAlert } = useAppContext();

  if (!alert) return null;

  const type = alert.type || 'info';

  return (
    <div className="fixed left-4 right-4 top-4 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <div
        className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${styles[type] || styles.info}`}
        role="alert"
        aria-live="polite"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{labels[type] || 'Notice'}</p>
          <p className="mt-0.5 break-words text-white/95">{alert.message}</p>
        </div>
        <button
          type="button"
          onClick={clearAlert}
          className="shrink-0 rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
