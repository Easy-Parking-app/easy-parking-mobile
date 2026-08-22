import { useCallback, useEffect, useRef, useState } from 'react';

import type { AsyncState } from '@/types';

type UseAsyncResult<T> = AsyncState<T> & {
  /** Re-runs the loader. Safe to call from a pull-to-refresh handler. */
  reload: () => void;
  refreshing: boolean;
};

/**
 * Minimal data-loading hook over the mock service layer.
 *
 * Deliberately small: it covers loading, error and refresh without pulling in a
 * caching library the mock backend does not need. When Supabase lands, swap the
 * body for React Query and the call sites stay the same.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [nonce, setNonce] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    if (nonce === 0) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    loaderRef
      .current()
      .then((data) => {
        if (cancelled || !mounted.current) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled || !mounted.current) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Algo salió mal.',
        });
      })
      .finally(() => {
        if (!cancelled && mounted.current) setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setNonce((value) => value + 1);
  }, []);

  return { ...state, reload, refreshing };
}
