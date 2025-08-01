/* eslint-disable */

import React, { useState } from "react";
import {
  useOutboundEvents,
  useOutboundEventDetail,
  useRetryOutboundEvent,
} from "@/hooks/useOutboundEvents";
import { format, parseISO } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
  { label: "Delivered", value: "delivered" },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "delivered"
      ? "bg-green-100 text-green-700 border-green-300"
      : status === "failed"
      ? "bg-red-100 text-red-700 border-red-300"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${color}`}
    >
      {status}
    </span>
  );
}

function CodeBadge({ code }: { code: number | null }) {
  const color =
    code && code >= 200 && code < 300
      ? "bg-green-100 text-green-700 border-green-300"
      : code && code >= 400
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-gray-100 text-gray-700 border-gray-300";
  return code ? (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${color}`}
    >
      {code}
    </span>
  ) : null;
}

function formatDateTime(dt?: string | null) {
  if (!dt) return "-";
  try {
    return format(parseISO(dt), "PPpp"); // e.g., Jul 24, 2025 at 8:14:18 AM
  } catch {
    return dt;
  }
}

function OutboundEventDetailModal({
  eventId,
  onClose,
}: {
  eventId: number;
  onClose: () => void;
}) {
  const detail = useOutboundEventDetail(eventId);
  const retry = useRetryOutboundEvent(eventId);
  const [retryMsg, setRetryMsg] = useState<string | null>(null);

  const handleRetry = () => {
    setRetryMsg(null);
    retry.mutate(undefined, {
      onSuccess: (data: any) => setRetryMsg(data.message || "Retried!"),
      onError: (err: any) => setRetryMsg(err?.message || "Retry failed"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-6">
          {detail.isLoading && (
            <div className="text-gray-500">Loading event details...</div>
          )}
          {detail.error && (
            <div className="text-red-500">Error loading event details.</div>
          )}
          {(detail.data as any) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Event #{(detail.data as any).id} Details
              </h3>
              <div className="mb-2 flex flex-wrap gap-4 text-xs text-gray-700">
                <div>
                  <span className="font-semibold">Type:</span>{" "}
                  {(detail.data as any).eventType ||
                    (detail.data as any).event_type}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <StatusBadge status={(detail.data as any).status} />
                </div>
                <div>
                  <span className="font-semibold">Attempts:</span>{" "}
                  {(detail.data as any).attempts}
                </div>
                <div>
                  <span className="font-semibold">Last Attempt:</span>{" "}
                  {formatDateTime(
                    (detail.data as any).lastAttemptAt ||
                      (detail.data as any).last_attempt_at
                  )}
                </div>
                <div>
                  <span className="font-semibold">Response Code:</span>{" "}
                  <CodeBadge
                    code={
                      (detail.data as any).responseCode ||
                      (detail.data as any).response_code
                    }
                  />
                </div>
                <div>
                  <span className="font-semibold">Created At:</span>{" "}
                  {formatDateTime(
                    (detail.data as any).createdAt ||
                      (detail.data as any).created_at
                  )}
                </div>
                <div>
                  <span className="font-semibold">Integration ID:</span>{" "}
                  {(detail.data as any).integration}
                </div>
                <div>
                  <span className="font-semibold">Organization ID:</span>{" "}
                  {(detail.data as any).organization}
                </div>
                <div>
                  <span className="font-semibold">Next Retry At:</span>{" "}
                  {formatDateTime(
                    (detail.data as any).nextRetryAt ||
                      (detail.data as any).next_retry_at
                  )}
                </div>
                <div>
                  <span className="font-semibold">Last Error:</span>{" "}
                  {(detail.data as any).lastError ||
                    (detail.data as any).last_error || (
                      <span className="text-gray-400">-</span>
                    )}
                </div>
              </div>
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-700">
                Response Body:
              </div>
              <div
                className="bg-gray-100 rounded p-2 text-xs max-h-40 overflow-auto whitespace-pre-wrap mb-4"
                style={{ wordBreak: "break-all" }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      (detail.data as any).responseBody ||
                      (detail.data as any).response_body ||
                      "<span class='text-gray-400'>-</span>",
                  }}
                />
              </div>
              <div className="mb-2 text-xs font-semibold text-gray-700">
                Payload:
              </div>
              <pre
                className="bg-gray-100 rounded p-2 text-xs max-h-40 overflow-auto whitespace-pre-wrap mb-4"
                style={{ wordBreak: "break-all" }}
              >
                {JSON.stringify(
                  (detail.data as any).payloadJson ||
                    (detail.data as any).payload_json,
                  null,
                  2
                )}
              </pre>
              {(detail.data as any).status === "failed" && (
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleRetry}
                  disabled={retry.isPending}
                >
                  Retry
                </button>
              )}
              {retryMsg && (
                <div className="mt-2 text-sm text-blue-600">{retryMsg}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const OutboundEventsTab: React.FC = () => {
  const [status, setStatus] = useState("");
  const { list } = useOutboundEvents(status);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [retryMsgMap, setRetryMsgMap] = useState<{ [id: number]: string }>({});

  // Modal logic
  const closeModal = () => setSelectedId(null);

  // Retry handler for table
  const handleRetryFromTable = (id: number) => {
    setRetryingId(id);
    setRetryMsgMap((prev) => ({ ...prev, [id]: "" }));
    const retry = useRetryOutboundEvent(id);
    retry.mutate(undefined, {
      onSuccess: (data: any) => {
        setRetryMsgMap((prev) => ({
          ...prev,
          [id]: data.message || "Retried!",
        }));
        setRetryingId(null);
        (list as any).refetch(); // Refresh the table
      },
      onError: (err: any) => {
        setRetryMsgMap((prev) => ({
          ...prev,
          [id]: err?.message || "Retry failed",
        }));
        setRetryingId(null);
      },
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Filter by status:</span>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                status === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
              onClick={() => setStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (list as any).refetch()}
          disabled={list.isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${list.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {list.isLoading && <div className="text-gray-500">Loading events...</div>}
      {list.error && <div className="text-red-500">Error loading events.</div>}
      {(list.data as any) && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Event ID</th>
                <th className="px-3 py-2 border">Event Type</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Attempts</th>
                <th className="px-3 py-2 border">Last Attempt</th>
                <th className="px-3 py-2 border">Response Code</th>
                <th className="px-3 py-2 border">Last Error</th>
                <th className="px-3 py-2 border">Created At</th>
                <th className="px-3 py-2 border">Actions</th>
                <th className="px-3 py-2 border">View</th>
              </tr>
            </thead>
            <tbody>
              {(list.data as any).results.map((event: any) => (
                <tr key={event.id} className="hover:bg-blue-50">
                  <td className="px-3 py-2 border">{event.id}</td>
                  <td className="px-3 py-2 border">
                    {event.eventType || event.event_type}
                  </td>
                  <td className="px-3 py-2 border">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-3 py-2 border">{event.attempts}</td>
                  <td className="px-3 py-2 border">
                    {formatDateTime(
                      event.lastAttemptAt || event.last_attempt_at
                    )}
                  </td>
                  <td className="px-3 py-2 border">
                    <CodeBadge
                      code={event.responseCode || event.response_code}
                    />
                  </td>
                  <td className="px-3 py-2 border">
                    {event.lastError || event.last_error}
                  </td>
                  <td className="px-3 py-2 border">
                    {formatDateTime(event.createdAt || event.created_at)}
                  </td>
                  <td className="px-3 py-2 border">
                    {event.status === "failed" && (
                      <>
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-60"
                          onClick={() => handleRetryFromTable(event.id)}
                          disabled={retryingId === event.id}
                        >
                          {retryingId === event.id ? "Retrying..." : "Retry"}
                        </button>
                        {retryMsgMap[event.id] && (
                          <div className="text-xs mt-1 text-blue-600">
                            {retryMsgMap[event.id]}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td
                    className="px-3 py-2 border text-blue-600 underline cursor-pointer"
                    onClick={() => setSelectedId(event.id)}
                  >
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(list.data as any) && (list.data as any).results.length === 0 && (
        <div className="text-gray-500 mt-4">
          No events found for this filter.
        </div>
      )}

      {/* Detail Modal */}
      {typeof selectedId === "number" && (
        <OutboundEventDetailModal eventId={selectedId} onClose={closeModal} />
      )}
    </div>
  );
};
