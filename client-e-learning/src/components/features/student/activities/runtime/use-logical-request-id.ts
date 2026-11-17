import { useCallback, useMemo, useRef } from "react";

/** Keeps one idempotency key across transport retries for the same logical answer. */
export function useLogicalRequestId() {
  const ids = useRef(new Map<string, string>());

  const acquire = useCallback((key: string) => {
    const existing = ids.current.get(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    ids.current.set(key, created);
    return created;
  }, []);

  const clear = useCallback((key: string) => {
    ids.current.delete(key);
  }, []);

  const clearAll = useCallback(() => {
    ids.current.clear();
  }, []);

  return useMemo(
    () => ({ acquire, clear, clearAll }),
    [acquire, clear, clearAll],
  );
}
