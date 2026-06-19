import Button from './Button';

export default function ErrorBanner({ message, onRetry, title = 'Something went wrong' }) {
  if (!message) return null;

  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3 !py-1.5 !text-sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
