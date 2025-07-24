import { z } from "zod";

export const pipedreamIntegrationConfigSchema = z.object({
  url: z.string().url({ message: "Must be a valid URL" }),
  secret: z.string().min(6, { message: "Secret must be at least 6 characters" }),
});

export const pipedreamIntegrationSchema = z.object({
  is_active: z.boolean(),
  config_blob: pipedreamIntegrationConfigSchema,
});

export type PipedreamIntegrationConfigInput = z.infer<typeof pipedreamIntegrationConfigSchema>;
export type PipedreamIntegrationInput = z.infer<typeof pipedreamIntegrationSchema>; 