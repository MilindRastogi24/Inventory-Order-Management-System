import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import PageHeader from '../components/layout/PageHeader';
import { useAppContext } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../utils/validation';

export default function OrdersPage() {
  const { orders, loading, error, createOrder } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { showAlert } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([{ product_id: '', quantity: '1' }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const estimatedTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      if (!product || !item.quantity) return sum;
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);
  }, [lineItems, products]);

  const openCreate = () => {
    setCustomerId('');
    setLineItems([{ product_id: '', quantity: '1' }]);
    setFormError('');
    setModalOpen(true);
  };

  const updateLineItem = (index, field, value) => {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () => {
    setLineItems((items) => [...items, { product_id: '', quantity: '1' }]);
  };

  const removeLineItem = (index) => {
    setLineItems((items) => items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!customerId) {
      setFormError('Please select a customer');
      return;
    }
    const items = lineItems
      .filter((item) => item.product_id && item.quantity)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    if (items.length === 0) {
      setFormError('Add at least one product line');
      return;
    }

    const productIds = items.map((i) => i.product_id);
    if (productIds.length !== new Set(productIds).size) {
      setFormError('Each product can only appear once per order');
      return;
    }

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        setFormError('Quantities must be positive whole numbers');
        return;
      }
    }

    setSubmitting(true);
    try {
      await createOrder({ customer_id: Number(customerId), items });
      showAlert('success', 'Order created successfully');
      setModalOpen(false);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      showAlert('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Create and manage customer orders"
        action={<Button onClick={openCreate}>+ Create Order</Button>}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <DataTable columns={['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Actions']} emptyMessage="No orders yet.">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-medium text-slate-900">#{order.id}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{order.customer_name}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(order.total_amount)}</td>
            <td className="px-4 py-3">
              <Badge variant={order.status === 'active' ? 'success' : 'info'}>{order.status}</Badge>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(order.created_at)}</td>
            <td className="px-4 py-3">
              <Link
                to={`/orders/${order.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        open={modalOpen}
        title="Create Order"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Line Items</label>
              <Button variant="ghost" className="!px-2 !py-1" onClick={addLineItem}>
                + Add item
              </Button>
            </div>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateLineItem(index, 'product_id', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.price)} (stock: {p.quantity_in_stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Qty"
                  />
                  {lineItems.length > 1 && (
                    <Button variant="ghost" className="!px-2" onClick={() => removeLineItem(index)}>
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">Estimated total: </span>
            <span className="font-semibold text-slate-900">{formatCurrency(estimatedTotal)}</span>
            <span className="text-slate-400"> (final amount calculated by server)</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
