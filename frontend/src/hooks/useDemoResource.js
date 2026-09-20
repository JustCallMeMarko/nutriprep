import { useCallback, useEffect, useState } from "react";
import { makeDemoRequest } from "@/utils/demoData";

export function useDemoResource(endpoint, initialValue = null) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeDemoRequest(endpoint);
      setData(response);
      return response;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload().catch(() => {});
  }, [reload]);

  return { data, setData, loading, error, reload };
}