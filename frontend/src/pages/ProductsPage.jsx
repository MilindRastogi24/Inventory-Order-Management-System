import { useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import PageHeader from '../components/layout/PageHeader';
import { useAppContext } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { getErrorMessage } from '../api/client';
import { validateProduct, formatCurrency } from '../utils/validation';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function ProductsPage() {
  const { products, loading, error, refetch, createProduct, updateProduct, deleteProduct } = useProducts();
  const { showAlert } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const errors = validateProduct(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        showAlert('success', 'Product updated successfully');
      } else {
        await createProduct(payload);
        showAlert('success', 'Product created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      showAlert('error', err.userMessage || getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showAlert('success', 'Product deleted');
      setDeleteTarget(null);
    } catch (err) {
      showAlert('error', err.userMessage || getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

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
        title="Products"
        description="Manage your product catalog and inventory"
        action={
          <Button onClick={openCreate}>+ Add Product</Button>
        }
      />

      {error && (
        <ErrorBanner message={error} onRetry={refetch} title="Failed to load products" />
      )}

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <DataTable
        columns={[
          'Name',
          { label: 'SKU', className: 'hidden sm:table-cell' },
          { label: 'Price', className: 'hidden md:table-cell' },
          'Stock',
          'Actions',
        ]}
        emptyMessage="No products yet."
      >
        {filtered.map((product) => (
          <tr key={product.id} className="hover:bg-slate-50">
            <td className="px-3 py-3 sm:px-4">
              <div className="text-sm font-medium text-slate-900">{product.name}</div>
              <div className="mt-0.5 text-xs text-slate-500 sm:hidden">
                {product.sku} · {formatCurrency(product.price)}
              </div>
            </td>
            <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell sm:px-4">{product.sku}</td>
            <td className="hidden px-3 py-3 text-sm text-slate-600 md:table-cell sm:px-4">{formatCurrency(product.price)}</td>
            <td className="px-3 py-3 sm:px-4">
              {product.quantity_in_stock <= 10 ? (
                <Badge variant="warning">{product.quantity_in_stock}</Badge>
              ) : (
                <Badge variant="success">{product.quantity_in_stock}</Badge>
              )}
            </td>
            <td className="px-3 py-3 sm:px-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(product)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(product)}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Product' : 'Add Product'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" error={formErrors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          <Field label="SKU" error={formErrors.sku}>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          <Field label="Price" error={formErrors.price}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          <Field label="Quantity in Stock" error={formErrors.quantity_in_stock}>
            <input
              type="number"
              min="0"
              step="1"
              value={form.quantity_in_stock}
              onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={submitting}
      />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
