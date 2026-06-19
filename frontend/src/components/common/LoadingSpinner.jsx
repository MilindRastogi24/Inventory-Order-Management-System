export default function LoadingSpinner({ className = '' }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
