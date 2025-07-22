import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatbotForm } from "@/components/ChatbotForm";
import { useCreateChatbot } from "@/hooks/useChatbotApi";

export default function CreateChatbotPage() {
  const navigate = useNavigate();
  const createChatbot = useCreateChatbot();

  const handleSubmit = async (formData: FormData) => {
    console.log("Form data: ");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
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
