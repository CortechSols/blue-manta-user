import { useApiQuery, useApiMutation } from "./useApi";

const BASE_URL = "/integrations/outbound-events/";

export function useOutboundEvents(status?: string) {
  // List events with optional status filter
  const list = useApiQuery(
    ["outbound-events", status],
    status ? `${BASE_URL}?status=${status}` : BASE_URL
  );
  return { list };
}

export function useOutboundEventDetail(id: number) {
  return useApiQuery(["outbound-event-detail", id], `${BASE_URL}${id}/`);
}

export function useRetryOutboundEvent(id: number) {
  return useApiMutation(`${BASE_URL}${id}/retry/`, "POST");
} 