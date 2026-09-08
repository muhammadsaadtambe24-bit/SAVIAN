import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { BlockDemand } from '@/types';

export function useDemands() {
  const [demands, setDemands] = useState<BlockDemand[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<BlockDemand[]>('/api/demands');
      setDemands(Array.isArray(data) ? data : []);
    } catch {
      // If the API is unavailable, keep existing state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDemand = useCallback(
    async (demandData: Omit<BlockDemand, 'id'>) => {
      setIsLoading(true);
      try {
        const { data } = await api.post<BlockDemand>('/api/demands', demandData);
        setDemands((prev) => [...prev, data]);
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateDemand = useCallback(
    async (id: number, demandData: Partial<BlockDemand>) => {
      setIsLoading(true);
      try {
        const { data } = await api.put<BlockDemand>(`/api/demands/${id}`, demandData);
        setDemands((prev) => prev.map((d) => (d.id === id ? data : d)));
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteDemand = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/demands/${id}`);
      setDemands((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { demands, isLoading, createDemand, updateDemand, deleteDemand, refetch };
}
