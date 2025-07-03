import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Settings,
  Users,
  Calendar,
  Clock,
  Upload,
  Bot,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import {
  useChatbots,
  useCreateChatbot,
  useUpdateChatbot,
  useDeleteChatbot,
  useChatInterface,
  useChatbotRefresh,
} from "@/hooks/useChatbotApi";
import type { CreateChatbotRequest, UpdateChatbotRequest, Chatbot } from "@/types/chatbot";

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, formatString);
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return 'Invalid date';
  }
};

export default function ChatbotsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);

  // API hooks
  const { data: chatbots, isLoading, error } = useChatbots();
  const createChatbot = useCreateChatbot();
  const updateChatbot = useUpdateChatbot();
  const deleteChatbot = useDeleteChatbot();
  const { refreshList } = useChatbotRefresh();

  // Form state
  const [formData, setFormData] = useState<CreateChatbotRequest>({
    name: "",
    system_prompt: "",
    conversation_limit: 50,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Chat interface
  const chatInterface = useChatInterface(selectedChatbot?.id || 0);
  const [chatMessage, setChatMessage] = useState("");

  const handleCreateChatbot = async () => {
    try {
      await createChatbot.mutateAsync({
        ...formData,
        logo: logoFile,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create chatbot:", error);
    }
  };

  const handleUpdateChatbot = async () => {
    if (!selectedChatbot) return;
    
    try {
      await updateChatbot.mutateAsync({
        id: selectedChatbot.id,
        ...formData,
        logo: logoFile,
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

  const handleEditChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setFormData({
      name: chatbot.name,
      system_prompt: chatbot.system_prompt,
      conversation_limit: chatbot.conversation_limit,
    });
    setShowEditModal(true);
  };

  const handleOpenChat = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowChatModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      system_prompt: "",
      conversation_limit: 50,
    });
    setLogoFile(null);
    setSelectedChatbot(null);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !chatInterface) return;
    
    await chatInterface.sendMessage(chatMessage);
    setChatMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (error) {
    const isBackendNotAvailable = error.message?.includes('not available on the backend');
    
    return (
      <DashboardLayout
        title="Chatbots"
        subtitle="Manage your AI chatbots"
        activePath="/chatbots"
      >
        <Card className={`${isBackendNotAvailable ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className={`h-5 w-5 ${isBackendNotAvailable ? 'text-orange-600' : 'text-red-600'}`} />
              <div>
                <h3 className={`font-semibold ${isBackendNotAvailable ? 'text-orange-800' : 'text-red-800'}`}>
                  {isBackendNotAvailable ? 'Chatbot Feature Not Available' : 'Error Loading Chatbots'}
                </h3>
                <p className={isBackendNotAvailable ? 'text-orange-600' : 'text-red-600'}>
                  {error.message}
                </p>
                {isBackendNotAvailable && (
                  <p className="text-orange-500 text-sm mt-2">
                    This feature is currently being developed. Please check back later or contact your administrator.
                  </p>
                )}
              </div>
            </div>
            {!isBackendNotAvailable && (
              <Button
                onClick={() => refreshList()}
                variant="outline"
                className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Chatbots"
      subtitle="Manage your AI chatbots"
      activePath="/chatbots"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
            <p className="text-gray-600">
              Create and manage AI chatbots for your organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => refreshList()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Chatbot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Chatbot</DialogTitle>
                  <DialogDescription>
                    Configure your AI chatbot with a name, system prompt, and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter chatbot name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="system_prompt">System Prompt</Label>
                    <Textarea
                      id="system_prompt"
                      value={formData.system_prompt}
                      onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                      placeholder="Enter the system prompt for your chatbot..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversation_limit">Conversation Limit</Label>
                    <Input
                      id="conversation_limit"
                      type="number"
                      value={formData.conversation_limit}
                      onChange={(e) => setFormData({ ...formData, conversation_limit: parseInt(e.target.value) || 50 })}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo (Optional)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                      {logoFile && (
                        <Badge variant="secondary">
                          {logoFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChatbot}
                    disabled={createChatbot.isPending || !formData.name || !formData.system_prompt}
                  >
                    {createChatbot.isPending ? "Creating..." : "Create Chatbot"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">All Chatbots</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading chatbots...</span>
              </div>
            ) : chatbots && chatbots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chatbots.map((chatbot) => (
                  <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {chatbot.organization.first_name} {chatbot.organization.last_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChat(chatbot)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditChatbot(chatbot)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChatbotToDelete(chatbot)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{chatbot.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteChatbot}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {chatbot.system_prompt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {chatbot.conversation_limit} limit
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {safeFormatDate(chatbot.updated_at, "MMM d, yyyy")}
                            </span>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first chatbot to start providing AI-powered customer support.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Note: This feature requires backend support. If you're unable to create chatbots, 
                    the backend endpoints may not be available yet.
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Chatbot
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Chatbot</DialogTitle>
              <DialogDescription>
                Update your chatbot configuration and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter chatbot name"
                />
              </div>
              <div>
                <Label htmlFor="edit-system_prompt">System Prompt</Label>
                <Textarea
                  id="edit-system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="Enter the system prompt for your chatbot..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit-conversation_limit">Conversation Limit</Label>
                <Input
                  id="edit-conversation_limit"
                  type="number"
                  value={formData.conversation_limit}
                  onChange={(e) => setFormData({ ...formData, conversation_limit: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="edit-logo">Logo (Optional)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoFile && (
                    <Badge variant="secondary">
                      {logoFile.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateChatbot}
                disabled={updateChatbot.isPending || !formData.name || !formData.system_prompt}
              >
                {updateChatbot.isPending ? "Updating..." : "Update Chatbot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-4xl h-[600px] flex flex-col">
            <DialogHeader>
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
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'BOT' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'BOT'
                            ? 'bg-white border border-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'BOT' ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {safeFormatDate(message.sent_at, 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {chatInterface?.isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 p-4 border-t">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || chatInterface?.isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 