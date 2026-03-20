import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type UseSupabaseTableOptions<T> = {
  fallbackData: T[];
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
};

export function useSupabaseTable<T>(
  tableName: string | string[],
  options: UseSupabaseTableOptions<T>,
) {
  const tableNameKey = Array.isArray(tableName) ? tableName.join("|") : tableName;
  const [data, setData] = useState<T[]>(options.fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        if (!isMounted) return;
        setUsingFallback(true);
        setLoading(false);
        setError("Missing Supabase environment variables");
        return;
      }

      setLoading(true);
      setError(null);

      const tableCandidates = Array.isArray(tableName) ? tableName : [tableName];
      let rows: T[] | null = null;
      let lastError: string | null = null;

      for (const candidate of tableCandidates) {
        let query = supabase.from(candidate).select("*");

        if (options.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          });
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data: candidateRows, error: queryError } = await query;

        if (queryError) {
          lastError = queryError.message;
          continue;
        }

        rows = (candidateRows ?? []) as T[];
        lastError = null;
        break;
      }

      if (!isMounted) return;

      if (lastError || !rows) {
        setData(options.fallbackData);
        setUsingFallback(true);
        setError(lastError ?? "Could not load data from Supabase");
      } else {
        setData(rows);
        setUsingFallback(false);
      }

      setLoading(false);
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [options.fallbackData, options.limit, options.orderBy, tableNameKey]);

  return { data, loading, error, usingFallback };
}
