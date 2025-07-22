import { z } from "zod";

export const adminProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  contactEmail: z.string().email("Please enter a valid email address"),
});

export const updateOrganizationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export type AdminProfileSchema = z.infer<typeof adminProfileSchema>;
export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;
