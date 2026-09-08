import { useState, useRef, useCallback } from 'react';
import { TelemetryEvent } from '@/types';

export type SolverStatus = 'IDLE' | 'SOLVING' | 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';

const MAX_BUFFER = 50;

export function useBlockTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [solverStatus, setSolverStatus] = useState<SolverStatus>('IDLE');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    sessionIdRef.current = null;
  }, []);

  const connect = useCallback(
    (sessionId: string) => {
      disconnect();
      sessionIdRef.current = sessionId;
      setTelemetry([]);
      setSolverStatus('SOLVING');

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api/telemetry/stream/${sessionId}`;

      const createConnection = () => {
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('solver_progress', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data) as TelemetryEvent;
            setTelemetry((prev) => {
              const next = [...prev, data];
              return next.length > MAX_BUFFER ? next.slice(-MAX_BUFFER) : next;
            });
          } catch {
            // skip malformed frames
          }
        });

        es.addEventListener('solution_found', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            const status: SolverStatus = data.status === 'FEASIBLE' ? 'FEASIBLE' : 'OPTIMAL';
            setSolverStatus(status);
            if (data.iteration !== undefined) {
              const evt: TelemetryEvent = {
                iteration: data.iteration,
                objective_cost: data.objective_cost ?? data.objective_value ?? 0,
                best_bound: data.best_bound ?? data.objective_cost ?? 0,
                time_sec: data.time_sec ?? 0,
              };
              setTelemetry((prev) => {
                const next = [...prev, evt];
                return next.length > MAX_BUFFER ? next.slice(-MAX_BUFFER) : next;
              });
            }
          } catch {
            // skip
          }
        });

        es.addEventListener('solve_complete', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            const s = (data.status as string)?.toUpperCase();
            if (s === 'OPTIMAL' || s === 'FEASIBLE' || s === 'INFEASIBLE') {
              setSolverStatus(s as SolverStatus);
            }
          } catch {
            // skip
          }
          es.close();
          eventSourceRef.current = null;
        });

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          // Reconnect after 2s if session still active
          if (sessionIdRef.current === sessionId) {
            reconnectTimerRef.current = setTimeout(() => {
              if (sessionIdRef.current === sessionId) {
                createConnection();
              }
            }, 2000);
          }
        };
      };

      createConnection();
    },
    [disconnect],
  );

  return { telemetry, solverStatus, setSolverStatus, connect, disconnect };
}
