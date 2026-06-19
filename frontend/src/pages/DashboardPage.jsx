import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import StatCard from '../components/dashboard/StatCard';
import PageHeader from '../components/layout/PageHeader';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your inventory and orders" />
        <ErrorBanner
          title="Failed to load dashboard"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and orders"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={data.total_products} accent="indigo" />
        <StatCard label="Total Customers" value={data.total_customers} accent="emerald" />
        <StatCard label="Total Orders" value={data.total_orders} accent="violet" />
        <StatCard
          label="Low Stock Items"
          value={data.low_stock_products.length}
          accent="amber"
        />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 sm:p-8">
            All products are above the low-stock threshold.
          </div>
        ) : (
          <DataTable
            columns={[
              'Product',
              { label: 'SKU', className: 'hidden sm:table-cell' },
              'In Stock',
              'Status',
            ]}
          >
            {data.low_stock_products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 sm:px-4">
                  <div className="text-sm font-medium text-slate-900">{product.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500 sm:hidden">{product.sku}</div>
                </td>
                <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell sm:px-4">{product.sku}</td>
                <td className="px-3 py-3 text-sm text-slate-600 sm:px-4">{product.quantity_in_stock}</td>
                <td className="px-3 py-3 sm:px-4">
                  <Badge variant="warning">Low stock</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
