import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Please enter a valid age').optional().nullable(),
  dob: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  securityQuestion: z.string().min(1, 'Please select a security question'),
  securityAnswer: z.string().min(1, 'Please provide an answer to the security question')
}).refine((data: { password?: string; confirmPassword?: string }) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetSecuritySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  securityAnswer: z.string().min(1, 'Security answer is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data: { newPassword?: string; confirmPassword?: string }) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ResetSecurityInput = z.infer<typeof resetSecuritySchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data: { password?: string; confirmPassword?: string }) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
