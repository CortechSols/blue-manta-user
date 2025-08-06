import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  Bot,
  Send,
  RefreshCw,
  AlertCircle,
  Code,
  Copy,
  MoreVertical,
} from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import { format } from "date-fns";
import {
  useChatbots,
  useUpdateChatbot,
  useDeleteChatbot,
  useChatInterface,
  useChatbotRefresh,
} from "@/hooks/useChatbotApi";
import type {
  CreateChatbotRequest,
  Chatbot,
  ChatMessage,
} from "@/types/chatbot";
import { useAuthStore } from "@/stores/authStore";
import ReactMarkdown from "react-markdown";
import { cleanBotMarkdown } from "@/lib/utils";
import { CalendlyWidgetWrapper } from "@/components/calendly/widgets/CalendlyWidgetWrapper";

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, formatString);
  } catch (error) {
    console.warn("Failed to format date:", dateString, error);
    return "Invalid date";
  }
};

// Create a memoized component for chat messages
const MemoizedChatMessage = memo(
  ({ message }: { message: ChatMessage }) => {
    return (
      <div
        className={`flex ${
          message.sender === "bot" ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`${
            message.sender === "bot" && message.calendlyUrl
              ? "max-w-[95%] sm:max-w-[85%]"
              : "max-w-[85%] sm:max-w-[70%]"
          } p-3 rounded-lg ${
            message.sender === "bot"
              ? "bg-white border border-gray-200 shadow-sm"
              : "bg-blue-600 text-white"
          }`}
        >
          {message.sender === "bot" && message.calendlyUrl ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="border-t pt-3">
                <CalendlyWidgetWrapper
                  key={message.id}
                  url={message.calendlyUrl}
                />
              </div>
            </div>
          ) : (
            <ReactMarkdown>{cleanBotMarkdown(message.content)}</ReactMarkdown>
          )}
          <p
            className={`text-xs mt-1 ${
              message.sender === "bot" ? "text-gray-500" : "text-blue-100"
            }`}
          >
            {safeFormatDate(message.sentAt, "HH:mm")}
          </p>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if message content or calendly URL changes
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.calendlyUrl === nextProps.message.calendlyUrl
    );
  }
);

export default function ChatbotsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showIframeModal, setShowIframeModal] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);

  const { user } = useAuthStore();
  // API hooks
  const { data: chatbots, isLoading, error } = useChatbots();
  const updateChatbot = useUpdateChatbot();
  const deleteChatbot = useDeleteChatbot();
  const { refreshList } = useChatbotRefresh();

  // Form state for edit modal
  const [formData, setFormData] = useState<CreateChatbotRequest>({
    name: "",
    systemPrompt: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Chat interface
  const chatInterface = useChatInterface(selectedChatbot?.id || 0);

  const [chatMessage, setChatMessage] = useState("");
  const [visitorId, setVisitorId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visitorId && chatInterface?.messages.length) {
      const visitorId = chatInterface.visitorId;
      if (visitorId) {
        setVisitorId(visitorId);
      }
    }
  }, [chatInterface?.messages, visitorId]);

  const handleUpdateChatbot = async () => {
    if (!selectedChatbot) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("systemPrompt", formData.systemPrompt);
      if (logoFile) {
        formDataObj.append("logo", logoFile);
      }

      await updateChatbot.mutateAsync({
        id: selectedChatbot.id,
        formData: formDataObj,
      });
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update chatbot:", error);
    }
  };

  const handleDeleteChatbot = async () => {
    if (!chatbotToDelete) return;

    try {
      await deleteChatbot.mutateAsync(chatbotToDelete.id);
      setChatbotToDelete(null);
    } catch (error) {
      console.error("Failed to delete chatbot:", error);
    }
  };

  const handleOpenChat = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowChatModal(true);
  };

  const handleOpenIframe = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowIframeModal(true);
  };

  const generateIframeCode = (chatbot: Chatbot) => {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const iframeUrl = import.meta.env.VITE_APP_URL || window.location.origin;

    return `<!-- Blue Manta Chatbot Integration -->
      <script>
        window.BlueMantaChatbot = {
          chatbotId: ${chatbot.id},
          apiBaseUrl: '${apiBaseUrl}',
          theme: 'light',
          primaryColor: '#3b82f6',
          greeting: 'Hello! How can I help you today?',
          position: 'bottom-right',
          iframeUrl: '${iframeUrl}/widget'
        };
      </script>
      <script src="${iframeUrl}/embed.js"></script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {});
  };

  const resetForm = () => {
    setFormData({
      name: "",
      systemPrompt: "",
    });
    setLogoFile(null);
    setSelectedChatbot(null);
  };

  const handleRefresh = () => {
    refreshList();
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !chatInterface) return;

    setChatMessage("");
    await chatInterface.sendMessage(chatMessage, visitorId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (error) {
    const isBackendNotAvailable = error.message?.includes(
      "not available on the backend"
    );

    return (
      <DashboardLayout
        title={`${user?.organizationName}`}
        subtitle="Manage your AI chatbots"
        activePath="/chatbots"
      >
        <Card
          className={`${
            isBackendNotAvailable
              ? "border-orange-200 bg-orange-50"
              : "border-red-200 bg-red-50"
          } mx-4 sm:mx-0`}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 ${
                  isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                }`}
              />
              <div className="space-y-1">
                <h3
                  className={`font-semibold ${
                    isBackendNotAvailable ? "text-orange-800" : "text-red-800"
                  }`}
                >
                  {isBackendNotAvailable
                    ? "Chatbot Feature Not Available"
                    : "Error Loading Chatbots"}
                </h3>
                <p
                  className={`text-sm ${
                    isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                  }`}
                >
                  {error.message}
                </p>
                {isBackendNotAvailable && (
                  <p className="text-orange-500 text-sm mt-2">
                    This feature is currently being developed. Please check back
                    later or contact your administrator.
                  </p>
                )}
              </div>
            </div>
            {!isBackendNotAvailable && (
              <RefreshButton
                onRefresh={handleRefresh}
                label="Try Again"
                className="mt-4 border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${user?.organizationName}`}
      subtitle="Manage your AI chatbots"
      activePath="/chatbots"
    >
      <div className="space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Chatbots
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Create and manage AI chatbots for your organization
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            />
            <Button
              onClick={() => navigate("/chatbots/create")}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Chatbot
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list">All Chatbots</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading chatbots...</span>
              </div>
            ) : chatbots && chatbots.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {chatbots.map((chatbot) => (
                  <Card
                    key={chatbot.id}
                    className="hover:shadow-lg transition-all duration-200 border-gray-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                              {chatbot.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 truncate">
                              {chatbot.organization.organizationName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-50"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenChat(chatbot)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                                Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenIframe(chatbot)}
                              >
                                <Code className="w-4 h-4 mr-2 text-green-600" />
                                Get Embed Code
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/chatbots/${chatbot.id}/configure`)
                                }
                              >
                                <Edit className="w-4 h-4 mr-2 text-gray-600" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setChatbotToDelete(chatbot)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {chatbot.systemPrompt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {safeFormatDate(
                                  chatbot.updatedAt,
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </span>
                          </div>
                          {/* <Badge variant="outline" className="text-xs">
                            Active
                          </Badge> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No chatbots yet
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Create your first chatbot to start providing AI-powered
                    customer support.
                  </p>
                  <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
                    Note: This feature requires backend support. If you're
                    unable to create chatbots, the backend endpoints may not be
                    available yet.
                  </p>
                  <Button
                    onClick={() => navigate("/chatbots/create")}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Chatbot
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!chatbotToDelete}
          onOpenChange={() => setChatbotToDelete(null)}
        >
          <AlertDialogContent className="mx-4 sm:mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{chatbotToDelete?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChatbot}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Chatbot</DialogTitle>
              <DialogDescription>
                Update your chatbot configuration and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter chatbot name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-system_prompt"
                  className="text-sm font-medium"
                >
                  System Prompt
                </Label>
                <Textarea
                  id="edit-systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  placeholder="Enter the system prompt for your chatbot..."
                  rows={6}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateChatbot}
                disabled={
                  updateChatbot.isPending ||
                  !formData.name ||
                  !formData.systemPrompt
                }
                className="w-full sm:w-auto"
              >
                {updateChatbot.isPending ? "Updating..." : "Update Chatbot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-4xl mx-4 sm:mx-auto h-[80vh] sm:h-[600px] flex flex-col bg-white">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Chat with {selectedChatbot?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col min-h-0">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
                {chatInterface?.messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation with {selectedChatbot?.name}</p>
                  </div>
                ) : (
                  chatInterface?.messages.map((message) => (
                    <MemoizedChatMessage key={message.id} message={message} />
                  ))
                )}
                {chatInterface?.isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-end gap-2 p-4 border-t bg-white flex-shrink-0">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 resize-none min-h-[40px] max-h-32"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || chatInterface?.isLoading}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Iframe Modal */}
        <Dialog open={showIframeModal} onOpenChange={setShowIframeModal}>
          <DialogContent className="max-w-4xl mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Embeddable Iframe Code for {selectedChatbot?.name}
              </DialogTitle>
              <DialogDescription>
                Copy and paste this code into your website to embed the chatbot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">HTML Code:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedChatbot &&
                      copyToClipboard(generateIframeCode(selectedChatbot))
                    }
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  <code>
                    {selectedChatbot && generateIframeCode(selectedChatbot)}
                  </code>
                </pre>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Instructions:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copy the HTML code above</li>
                  <li>
                    2. Paste it into your website's HTML, preferably before the
                    closing &lt;/body&gt; tag
                  </li>
                  <li>
                    3. The chatbot will appear as a floating button in the
                    bottom-right corner
                  </li>
                  <li>
                    4. Users can click the button to start chatting with your AI
                    assistant
                  </li>
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowIframeModal(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
