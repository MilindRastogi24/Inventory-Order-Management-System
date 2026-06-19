import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { customersApi } from '../api/customers';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customersApi.list();
      setCustomers(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (data) => {
    const response = await customersApi.create(data);
    await fetchCustomers();
    return response.data;
  };

  const deleteCustomer = async (id) => {
    await customersApi.delete(id);
    await fetchCustomers();
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    deleteCustomer,
  };
}
