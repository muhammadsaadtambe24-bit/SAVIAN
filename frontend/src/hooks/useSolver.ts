import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { SolverResult } from '@/types';
import { useBlockTelemetry, SolverStatus } from './useBlockTelemetry';

const POLL_INTERVAL_MS = 800;
const MAX_POLLS = 60; // safety limit

export function useSolver() {
  const [solveResult, setSolveResult] = useState<SolverResult | null>(null);
  const [chaosResult, setChaosResult] = useState<SolverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { telemetry, solverStatus, setSolverStatus, connect, disconnect } = useBlockTelemetry();

  const pollUntilComplete = useCallback(
    async (solveId: string): Promise<SolverResult> => {
      let polls = 0;
      while (polls < MAX_POLLS) {
        polls++;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        try {
          const resp = await api.get<SolverResult>(`/api/solve/${solveId}`);
          const data = resp.data;
          const s = data.status?.toUpperCase();
          if (s === 'OPTIMAL' || s === 'FEASIBLE' || s === 'INFEASIBLE') {
            return data;
          }
        } catch {
          // keep polling on transient errors
        }
      }
      throw new Error('Solve polling timed out');
    },
    [],
  );

  const triggerSolve = useCallback(
    async (mode: 'cold' | 'warm', timeLimitSec: number) => {
      setIsLoading(true);
      setSolverStatus('SOLVING');
      setSolveResult(null);

      try {
        // POST to initiate the solve
        const { data } = await api.post<{ solve_id: string }>('/api/solve', {
          mode,
          time_limit_sec: timeLimitSec,
        });

        const solveId = data.solve_id;

        // Connect telemetry SSE
        connect(solveId);

        // Poll for completion
        const result = await pollUntilComplete(solveId);
        setSolveResult(result);

        const finalStatus = result.status?.toUpperCase() as SolverStatus;
        setSolverStatus(
          finalStatus === 'OPTIMAL' || finalStatus === 'FEASIBLE' || finalStatus === 'INFEASIBLE'
            ? finalStatus
            : 'OPTIMAL',
        );

        return result;
      } catch (err) {
        setSolverStatus('INFEASIBLE');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [connect, pollUntilComplete, setSolverStatus],
  );

  const runChaosBaseline = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post<SolverResult>('/api/solve', {
        mode: 'chaos',
        time_limit_sec: 5,
      });
      setChaosResult(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    triggerSolve,
    solveResult,
    chaosResult,
    isLoading,
    runChaosBaseline,
    telemetry,
    solverStatus,
    setSolverStatus,
    disconnect,
  };
}
