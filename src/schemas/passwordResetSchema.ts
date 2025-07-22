import { z } from "zod";

export const passwordResetSchema = z
  .object({
    otp: z.string().min(1, "OTP is required").length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordResetSchema = z.infer<typeof passwordResetSchema>;
