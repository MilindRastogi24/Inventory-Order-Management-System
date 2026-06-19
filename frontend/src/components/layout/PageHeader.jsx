export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto [&_a]:block [&_button]:w-full sm:[&_a]:inline-block sm:[&_button]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
