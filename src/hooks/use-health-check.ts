import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useHealthCheck() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.healthCheck();
        setIsBackendHealthy(true);
        setError(null);
      } catch (err) {
        setIsBackendHealthy(false);
        setError(
          err instanceof Error ? err.message : 'Backend is not responding',
        );
      }
    };

    checkHealth();
  }, []);

  return { isBackendHealthy, error };
}
