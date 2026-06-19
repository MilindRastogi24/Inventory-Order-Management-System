import { useState } from 'react';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import PageHeader from '../components/layout/PageHeader';
import { useAppContext } from '../context/AppContext';
import { useCustomers } from '../hooks/useCustomers';
import { getErrorMessage } from '../api/client';
import { validateCustomer } from '../utils/validation';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function CustomersPage() {
  const { customers, loading, error, refetch, createCustomer, deleteCustomer } = useCustomers();
  const { showAlert } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSubmit = async () => {
    const errors = validateCustomer(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      showAlert('success', 'Customer created successfully');
      setModalOpen(false);
      setForm(emptyForm);
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
      await deleteCustomer(deleteTarget.id);
      showAlert('success', 'Customer deleted');
      setDeleteTarget(null);
    } catch (err) {
      showAlert('error', err.userMessage || getErrorMessage(err));
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
        title="Customers"
        description="Manage customer records"
        action={<Button onClick={() => { setForm(emptyForm); setFormErrors({}); setModalOpen(true); }}>+ Add Customer</Button>}
      />

      {error && (
        <ErrorBanner message={error} onRetry={refetch} title="Failed to load customers" />
      )}

      <DataTable
        columns={[
          'Name',
          { label: 'Email', className: 'hidden sm:table-cell' },
          { label: 'Phone', className: 'hidden md:table-cell' },
          'Actions',
        ]}
        emptyMessage="No customers yet."
      >
        {customers.map((customer) => (
          <tr key={customer.id} className="hover:bg-slate-50">
            <td className="px-3 py-3 sm:px-4">
              <div className="text-sm font-medium text-slate-900">{customer.full_name}</div>
              <div className="mt-0.5 text-xs text-slate-500 sm:hidden">
                {customer.email}
                {customer.phone ? ` · ${customer.phone}` : ''}
              </div>
            </td>
            <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell sm:px-4">{customer.email}</td>
            <td className="hidden px-3 py-3 text-sm text-slate-600 md:table-cell sm:px-4">{customer.phone}</td>
            <td className="px-3 py-3 sm:px-4">
              <Button
                variant="ghost"
                className="!px-2 !py-1 text-red-600 hover:bg-red-50"
                onClick={() => setDeleteTarget(customer)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        open={modalOpen}
        title="Add Customer"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name" error={formErrors.full_name}>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          <Field label="Email" error={formErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"?`}
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
