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
    // The initial fetch synchronizes local request state with the endpoint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload().catch(() => {});
  }, [reload]);

  return { data, setData, loading, error, reload };
}