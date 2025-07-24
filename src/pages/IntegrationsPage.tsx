import { DashboardLayout } from "@/components/DashboardLayout";
import { PipedreamIntegrationCard } from "@/components/integrations/PipedreamIntegrationCard";

export default function IntegrationsPage() {
  return (
    <DashboardLayout
      title="Integrations"
      subtitle="Manage your organization's integrations, including Pipedream."
      activePath="/integrations"
    >
      <PipedreamIntegrationCard />
    </DashboardLayout>
  );
} 