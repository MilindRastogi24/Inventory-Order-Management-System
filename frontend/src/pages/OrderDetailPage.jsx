import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/layout/PageHeader';
import { useAppContext } from '../context/AppContext';
import { useOrder, useOrders } from '../hooks/useOrders';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../utils/validation';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(id);
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
      showAlert('error', getErrorMessage(err));
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
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link to="/orders" className="mt-4 text-indigo-600 hover:underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Order #${order.id}`}
        description={`Created ${formatDate(order.created_at)}`}
        action={
          <div className="flex gap-2">
            <Link to="/orders">
              <Button variant="secondary">Back</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
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

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Items</h2>
      <DataTable columns={['Product', 'Quantity', 'Unit Price', 'Line Total']}>
        {order.items.map((item) => (
          <tr key={item.product_id} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.product_name}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.unit_price)}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.line_total)}</td>
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
