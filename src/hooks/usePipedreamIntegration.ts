import { useApiQuery, useApiMutation } from "./useApi";
import { usePipedreamIntegrationStore } from "@/stores/pipedreamIntegrationStore";
import { useEffect } from "react";
import type {
  PipedreamIntegration,
  PipedreamIntegrationConfig,
} from "@/types/integration";

const BASE_URL = "/integrations/pipedream/";

export function usePipedreamIntegration() {
  const store = usePipedreamIntegrationStore();

  // Fetch current integration
  const getIntegration = useApiQuery<any>(["pipedream-integration"], BASE_URL, {
    onSuccess: (data: any) => {
      console.log("[Pipedream] onSuccess data:", data);
      // Expect paginated response with 'results' array
      const integration =
        data && Array.isArray(data.results) ? data.results[0] || null : null;
      console.log("[Pipedream] integration extracted:", integration);
      store.setIntegration(integration);
      store.setError(null);
    },
    onError: (err: any) => {
      console.log("[Pipedream] onError:", err);
      store.setError(err.message || "Failed to load integration");
    },
  });

  // Log the query data
  console.log("[Pipedream] getIntegration.data:", getIntegration.data);

  // Update Zustand store when query data changes
  useEffect(() => {
    if (getIntegration.data && Array.isArray(getIntegration.data.results)) {
      const integration = getIntegration.data.results[0] || null;
      console.log("[Pipedream] useEffect integration:", integration);
      store.setIntegration(integration);
    }
  }, [getIntegration.data]);

  // Create integration
  const createIntegration = useApiMutation<
    PipedreamIntegration,
    { is_active: boolean; config_blob: PipedreamIntegrationConfig }
  >(BASE_URL, "POST", {
    onSuccess: (data) => {
      store.setIntegration(data);
      store.setError(null);
    },
    onError: (err: any) => {
      store.setError(err.message || "Failed to create integration");
    },
  });

  // Update integration
  const updateIntegration = useApiMutation<
    PipedreamIntegration,
    { is_active: boolean; config_blob: PipedreamIntegrationConfig }
  >(BASE_URL + (store.integration ? `${store.integration.id}/` : ""), "PATCH", {
    onSuccess: (data) => {
      store.setIntegration(data);
      store.setError(null);
    },
    onError: (err: any) => {
      store.setError(err.message || "Failed to update integration");
    },
  });

  // Delete integration
  const deleteIntegration = useApiMutation<void, void>(
    BASE_URL + (store.integration ? `${store.integration.id}/` : ""),
    "DELETE",
    {
      onSuccess: () => {
        store.setIntegration(null);
        store.setError(null);
      },
      onError: (err: any) => {
        store.setError(err.message || "Failed to delete integration");
      },
    }
  );

  // Test integration
  const testIntegration = useApiMutation<
    { message?: string; error?: string },
    void
  >(BASE_URL + "test/", "POST");

  return {
    getIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    store,
  };
}
