import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { ChatbotForm } from "@/components/chatbot";
import { useCreateChatbot } from "@/hooks/useChatbotApi";

export default function CreateChatbotPage() {
  const navigate = useNavigate();
  const createChatbot = useCreateChatbot();

  const handleSubmit = async (formData: FormData) => {
    await createChatbot.mutateAsync(formData);
    navigate("/chatbots");
  };

  const handleCancel = () => {
    navigate("/chatbots");
  };

  return (
    <DashboardLayout
      title="Create Chatbot"
      subtitle="Set up a new AI chatbot for your organization"
      activePath="/chatbots"
    >
      <ChatbotForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createChatbot.isPending}
        showBackButton={true}
      />
    </DashboardLayout>
  );
}
