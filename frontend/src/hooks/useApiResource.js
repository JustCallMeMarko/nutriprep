import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/utils/api";

export function useApiResource(endpoint, initialValue = null) {
  const { makeRequest } = useApi();
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest(endpoint);
      setData(response);
      return response;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [endpoint, makeRequest]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return { data, setData, loading, error, reload };
}