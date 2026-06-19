import { useAppContext } from '../../context/AppContext';

const styles = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  warning: 'bg-amber-500',
};

export default function AlertToast() {
  const { alert, clearAlert } = useAppContext();

  if (!alert) return null;

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${styles[alert.type] || styles.success}`}
      >
        <p className="flex-1">{alert.message}</p>
        <button
          type="button"
          onClick={clearAlert}
          className="text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
