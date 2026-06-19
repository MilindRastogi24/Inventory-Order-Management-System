import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/layout/PageHeader';
import { useAppContext } from '../context/AppContext';
import { useOrder, useOrders } from '../hooks/useOrders';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../utils/validation';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, loading, error, refetch } = useOrder(id);
  const { deleteOrder } = useOrders();
  const { showAlert } = useAppContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteOrder(Number(id));
      showAlert('success', 'Order deleted and stock restored');
      navigate('/orders');
    } catch (err) {
      showAlert('error', err.userMessage || getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <PageHeader title="Order details" description="View order information" />
        <ErrorBanner
          title="Failed to load order"
          message={error || 'Order not found'}
          onRetry={refetch}
        />
        <Link to="/orders" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Order #${order.id}`}
        description={`Created ${formatDate(order.created_at)}`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link to="/orders" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">Back</Button>
            </Link>
            <Button variant="danger" className="w-full sm:w-auto" onClick={() => setConfirmOpen(true)}>
              Delete Order
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Customer</p>
          <p className="mt-1 font-medium text-slate-900">{order.customer_name}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <div className="mt-1">
            <Badge variant={order.status === 'active' ? 'success' : 'info'}>{order.status}</Badge>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Amount</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">Order Items</h2>
      <DataTable
        columns={[
          'Product',
          'Qty',
          { label: 'Unit Price', className: 'hidden sm:table-cell' },
          'Total',
        ]}
      >
        {order.items.map((item) => (
          <tr key={item.product_id} className="hover:bg-slate-50">
            <td className="px-3 py-3 sm:px-4">
              <div className="text-sm font-medium text-slate-900">{item.product_name}</div>
              <div className="mt-0.5 text-xs text-slate-500 sm:hidden">
                {formatCurrency(item.unit_price)} each
              </div>
            </td>
            <td className="px-3 py-3 text-sm text-slate-600 sm:px-4">{item.quantity}</td>
            <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell sm:px-4">{formatCurrency(item.unit_price)}</td>
            <td className="px-3 py-3 text-sm font-medium text-slate-900 sm:px-4">{formatCurrency(item.line_total)}</td>
          </tr>
        ))}
      </DataTable>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Order"
        message="This will delete the order and restore product stock. Continue?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
