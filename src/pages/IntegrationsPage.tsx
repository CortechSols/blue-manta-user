import { DashboardLayout } from "@/components/layout";
import { PipedreamIntegrationCard, OutboundEventsTab } from "@/components/integrations";
import { useState } from "react";

export default function IntegrationsPage() {
  const [tab, setTab] = useState("pipedream");

  return (
    <DashboardLayout
      title="Integrations"
      subtitle="Manage your organization's integrations, including Pipedream and outbound events."
      activePath="/integrations"
    >
      <div className="mb-4 flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "pipedream" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"}`}
          onClick={() => setTab("pipedream")}
        >
          Pipedream Integration
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "outbound" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"}`}
          onClick={() => setTab("outbound")}
        >
          Outbound Events
        </button>
      </div>
      {tab === "pipedream" && <PipedreamIntegrationCard />}
      {tab === "outbound" && <OutboundEventsTab />}
    </DashboardLayout>
  );
} 