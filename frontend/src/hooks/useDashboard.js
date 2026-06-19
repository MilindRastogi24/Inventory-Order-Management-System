import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard';
import { getErrorMessage } from '../api/client';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.summary();
      setData(response.data);
    } catch (err) {
      setError(err.userMessage || getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}
