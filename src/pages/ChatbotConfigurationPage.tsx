import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { ChatbotForm } from "@/components/chatbot";
import { useChatbot, useUpdateChatbot } from "@/hooks/useChatbotApi";

export default function ChatbotConfigurationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatbotId = id ? parseInt(id) : 0;
  const { data: chatbot, isLoading, error } = useChatbot(chatbotId);
  const updateChatbot = useUpdateChatbot();

  const handleSubmit = async (formData: FormData) => {
    if (!chatbot) return;

    await updateChatbot.mutateAsync({
      id: chatbot.id,
      formData,
    });

    navigate("/chatbots");
  };

  const handleCancel = () => {
    navigate("/chatbots");
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configure Chatbot"
        subtitle="Loading chatbot configuration..."
        activePath="/chatbots"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !chatbot) {
    return (
      <DashboardLayout
        title="Configure Chatbot"
        subtitle="Error loading chatbot"
        activePath="/chatbots"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">
            {error
              ? "Failed to load chatbot configuration"
              : "Chatbot not found"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Configure Chatbot"
      subtitle={`Edit settings for ${chatbot.name}`}
      activePath="/chatbots"
    >
      <ChatbotForm
        mode="edit"
        initialData={chatbot}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateChatbot.isPending}
        showBackButton={true}
      />
    </DashboardLayout>
  );
}
