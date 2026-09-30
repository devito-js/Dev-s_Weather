"use client";
import { useEffect, useState } from "react";
export function useSource<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  interval: number,
  request: number,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;
    async function update() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      setLoading(true);
      try {
        const result = await fetcher(current.signal);
        if (active && !current.signal.aborted) {
          setData(result);
          setError(false);
          setUpdatedAt(Date.now() / 1000);
        }
      } catch {
        if (active && !current.signal.aborted) setError(true);
      } finally {
        if (active && !current.signal.aborted) setLoading(false);
      }
    }
    void update();
    const timer = setInterval(() => {
      if (!document.hidden) void update();
    }, interval);
    return () => {
      active = false;
      controller?.abort();
      clearInterval(timer);
    };
  }, [fetcher, interval, request]);
  return { data, loading, error, updatedAt };
}
