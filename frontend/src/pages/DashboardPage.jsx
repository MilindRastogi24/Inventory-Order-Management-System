import LoadingSpinner from '../components/common/LoadingSpinner';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import StatCard from '../components/dashboard/StatCard';
import PageHeader from '../components/layout/PageHeader';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
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
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            All products are above the low-stock threshold.
          </div>
        ) : (
          <DataTable columns={['Product', 'SKU', 'In Stock', 'Status']}>
            {data.low_stock_products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{product.sku}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{product.quantity_in_stock}</td>
                <td className="px-4 py-3">
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
