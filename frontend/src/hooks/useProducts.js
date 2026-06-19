import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { productsApi } from '../api/products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.list();
      setProducts(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data) => {
    const response = await productsApi.create(data);
    await fetchProducts();
    return response.data;
  };

  const updateProduct = async (id, data) => {
    const response = await productsApi.update(id, data);
    await fetchProducts();
    return response.data;
  };

  const deleteProduct = async (id) => {
    await productsApi.delete(id);
    await fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
