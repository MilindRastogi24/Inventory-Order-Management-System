import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { ordersApi } from '../api/orders';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.list();
      setOrders(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data) => {
    const response = await ordersApi.create(data);
    await fetchOrders();
    return response.data;
  };

  const deleteOrder = async (id) => {
    await ordersApi.delete(id);
    await fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    deleteOrder,
  };
}

export function useOrder(id) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.get(id);
      setOrder(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
