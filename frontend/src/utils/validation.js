export function validateProduct(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Name is required';
  if (!form.sku?.trim()) errors.sku = 'SKU is required';
  else if (!/^[A-Za-z0-9-]+$/.test(form.sku)) errors.sku = 'SKU must be letters, numbers, or hyphens';
  const price = Number(form.price);
  if (form.price === '' || Number.isNaN(price) || price < 0) errors.price = 'Price must be 0 or greater';
  const qty = Number(form.quantity_in_stock);
  if (form.quantity_in_stock === '' || Number.isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
    errors.quantity_in_stock = 'Quantity must be a whole number ≥ 0';
  }
  return errors;
}

export function validateCustomer(form) {
  const errors = {};
  if (!form.full_name?.trim()) errors.full_name = 'Full name is required';
  if (!form.email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
  if (!form.phone?.trim()) errors.phone = 'Phone is required';
  else if (form.phone.length < 7 || form.phone.length > 50) {
    errors.phone = 'Phone must be 7–50 characters';
  }
  return errors;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

export function formatDate(value) {
  return new Date(value).toLocaleString();
}
