import { z } from "zod";

export const mutateChatbotSchema = z.object({
  name: z.string().min(1, "Chatbot name is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  textPrompt: z.string().optional(),
  temperature: z
    .number()
    .min(0, "Temperature must be at least 0")
    .max(1, "Temperature must be at most 1"),
  sendButtonColor: z.string().min(1, "Send button color is required"),
  botTextColor: z.string().min(1, "Bot text color is required"),
  userTextColor: z.string().min(1, "User text color is required"),
  botMessageBubbleColor: z
    .string()
    .min(1, "Bot message bubble color is required"),
  userMessageBubbleColor: z
    .string()
    .min(1, "User message bubble color is required"),
  headerColor: z.string().min(1, "Header color is required"),
});

export type MutateChatbotSchema = z.infer<typeof mutateChatbotSchema>;
