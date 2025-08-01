import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Upload } from "lucide-react";
import {
  mutateChatbotSchema,
  type MutateChatbotSchema,
} from "@/schemas/mutateChatbotSchema";
import type { Chatbot } from "@/types/chatbot";

interface ChatbotFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Chatbot>;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  showBackButton?: boolean;
}

export function ChatbotForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText,
  showBackButton = false,
}: ChatbotFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [fileErrors, setFileErrors] = useState<{
    logo?: string;
    image?: string;
  }>({});
  const [textPromptEn, setTextPromptEn] = useState("");
  const [textPromptEs, setTextPromptEs] = useState("");
  const [activeTab, setActiveTab] = useState("english");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<MutateChatbotSchema>({
    resolver: zodResolver(mutateChatbotSchema),
    defaultValues: {
      name: "",
      systemPrompt: "",
      textPrompt: "",
      sendButtonColor: "#0077B6",
      botTextColor: "#000000",
      userTextColor: "#000000",
      botMessageBubbleColor: "#F3F4F6",
      userMessageBubbleColor: "#0077B6",
      headerColor: "#0077B6",
    },
    mode: "onChange",
  });

  // Update form when initial data is provided (edit mode)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setValue("name", initialData.name || "");
      setValue("systemPrompt", initialData.systemPrompt || "");

      // Handle text prompt structure - account for snake_case to camelCase conversion
      // The data might come in as textPrompt (camelCase) or text_prompt (snake_case)
      const textPromptSource =
        initialData.textPrompt ||
        (initialData as Record<string, any>).text_prompt; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (textPromptSource) {
        if (typeof textPromptSource === "string") {
          // Legacy format - put the string in English field
          setTextPromptEn(textPromptSource);
          setTextPromptEs("");
        } else if (typeof textPromptSource === "object") {
          // New format - extract text_prompt_en and text_prompt_es from the nested object
          const textPromptData = textPromptSource as {
            text_prompt_en?: string;
            text_prompt_es?: string;
            textPromptEn?: string; // Also check camelCase versions
            textPromptEs?: string;
          };
          setTextPromptEn(
            textPromptData.text_prompt_en || textPromptData.textPromptEn || ""
          );
          setTextPromptEs(
            textPromptData.text_prompt_es || textPromptData.textPromptEs || ""
          );
        }
      } else {
        setTextPromptEn("");
        setTextPromptEs("");
      }

      setValue("sendButtonColor", initialData.sendButtonColor || "#0077B6");
      setValue("botTextColor", initialData.botTextColor || "#000000");
      setValue("userTextColor", initialData.userTextColor || "#000000");
      setValue(
        "botMessageBubbleColor",
        initialData.botMessageBubbleColor || "#F3F4F6"
      );
      setValue(
        "userMessageBubbleColor",
        initialData.userMessageBubbleColor || "#0077B6"
      );
      setValue("headerColor", initialData.headerColor || "#0077B6");

      // Trigger validation after setting all values to update isValid state
      trigger();

      // Just set preview images without creating file objects
      if (initialData.logo) {
        setLogoPreview(initialData.logo);
      }
      if (initialData.image) {
        setAvatarPreview(initialData.image);
      }
    }
  }, [initialData, mode, setValue, trigger]);

  // Separate effect for initial file validation in create mode
  useEffect(() => {
    if (mode === "create") {
      validateFiles();
    } else {
      // In edit mode, clear any existing file errors since files are optional
      setFileErrors({});
    }
  }, [mode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUploaded(true);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Re-validate files with the new file immediately
      validateFiles(file, avatarFile);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUploaded(true);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Re-validate files with the new file immediately
      validateFiles(logoFile, file);
    }
  };

  // Validate files based on mode
  const validateFiles = (
    currentLogoFile?: File | null,
    currentAvatarFile?: File | null
  ) => {
    const errors: { logo?: string; image?: string } = {};

    // Use provided files or fall back to state
    const logoToCheck =
      currentLogoFile !== undefined ? currentLogoFile : logoFile;
    const avatarToCheck =
      currentAvatarFile !== undefined ? currentAvatarFile : avatarFile;

    if (mode === "create") {
      if (!logoToCheck || logoToCheck.size === 0) {
        errors.logo = "Logo is required";
      }
      if (!avatarToCheck || avatarToCheck.size === 0) {
        errors.image = "Avatar image is required";
      }
    }

    setFileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (data: MutateChatbotSchema) => {
    // Validate files before submitting
    if (!validateFiles()) {
      return;
    }

    try {
      // Build FormData - the parent component handles the actual API call
      const formData = new FormData();

      formData.append("name", data.name || "");
      formData.append("systemPrompt", data.systemPrompt || "");

      // Build the text prompt JSON structure
      const textPromptData = {
        text_prompt_en: textPromptEn,
        text_prompt_es: textPromptEs,
      };
      formData.append("textPrompt", JSON.stringify(textPromptData));

      formData.append("sendButtonColor", data.sendButtonColor);
      formData.append("botTextColor", data.botTextColor);
      formData.append("userTextColor", data.userTextColor);
      formData.append("botMessageBubbleColor", data.botMessageBubbleColor);
      formData.append("userMessageBubbleColor", data.userMessageBubbleColor);
      formData.append("headerColor", data.headerColor);

      // For create mode, files are required and must be present
      // For edit mode, only append files if user uploaded new ones
      if (
        mode === "create" ||
        (logoFile && logoFile.size > 0 && logoUploaded)
      ) {
        formData.append("logo", logoFile!);
      }
      if (
        mode === "create" ||
        (avatarFile && avatarFile.size > 0 && avatarUploaded)
      ) {
        formData.append("image", avatarFile!);
      }

      await onSubmit(formData);
    } catch (error) {
      console.error(`Failed to ${mode} chatbot:`, error);
    }
  };

  const defaultSubmitText =
    mode === "create" ? "Create Chatbot" : "Save Changes";
  const loadingText = mode === "create" ? "Creating..." : "Saving...";

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Header */}
      {showBackButton && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Chat Name
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Chat name is required",
                  minLength: {
                    value: 1,
                    message: "Chat name cannot be empty",
                  },
                })}
                placeholder="Enter chatbot name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt
              </Label>
              <Textarea
                id="systemPrompt"
                {...register("systemPrompt", {
                  required: "System prompt is required",
                  minLength: {
                    value: 1,
                    message: "System prompt cannot be empty",
                  },
                })}
                placeholder="Enter the system prompt for your chatbot..."
                rows={8}
                className="mt-1 resize-none"
              />
              {errors.systemPrompt && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.systemPrompt.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Context Data</Label>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="spanish">Spanish</TabsTrigger>
                </TabsList>
                <TabsContent value="english" className="mt-3">
                  <Textarea
                    value={textPromptEn}
                    onChange={(e) => setTextPromptEn(e.target.value)}
                    placeholder="Enter context data for your chatbot in English (e.g., About Us section, FAQ, etc.). This will be used to create embeddings for better responses..."
                    rows={6}
                    className="resize-none"
                  />
                </TabsContent>
                <TabsContent value="spanish" className="mt-3">
                  <Textarea
                    value={textPromptEs}
                    onChange={(e) => setTextPromptEs(e.target.value)}
                    placeholder="Ingrese datos de contexto para su chatbot en español (por ejemplo, sección Acerca de nosotros, preguntas frecuentes, etc.). Esto se utilizará para crear embeddings para mejores respuestas..."
                    rows={6}
                    className="resize-none"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Brand Appearance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0077B6]">
              Brand Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Logo
                  {mode === "create" && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Organization Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src="/bml-logo.png"
                        alt="Default Logo"
                        className="w-24 h-24 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label
                        htmlFor="logo-upload"
                        className="cursor-pointer bg-[#0077B6] text-white hover:bg-[#005A8A] border-[#0077B6] px-4 py-2 rounded-md flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Label>
                    </div>
                    {fileErrors.logo && (
                      <p className="text-red-500 text-sm text-center">
                        {fileErrors.logo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chatbot Avatar Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Chatbot Avatar
                  {mode === "create" && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Image</Label>
                    <div className="mt-2 flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Chatbot Avatar"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-cyan-400 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Label
                            htmlFor="avatar-upload"
                            className="cursor-pointer bg-[#0077B6] text-white hover:bg-[#005A8A] border-[#0077B6] px-3 py-1 rounded-md flex items-center text-sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Label>
                        </div>
                        {fileErrors.image && (
                          <p className="text-red-500 text-sm text-center">
                            {fileErrors.image}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Colors
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("sendButtonColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      Send Button Color
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("headerColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      Header Color
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("botTextColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      Bot Text Color
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("userTextColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      User Text Color
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("botMessageBubbleColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      Bot Message Bubble Color
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register("userMessageBubbleColor")}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Label className="text-sm text-gray-600 flex-1">
                      User Message Bubble Color
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={
              isLoading || !isValid || Object.keys(fileErrors).length > 0
            }
            className="flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? loadingText : submitButtonText || defaultSubmitText}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
