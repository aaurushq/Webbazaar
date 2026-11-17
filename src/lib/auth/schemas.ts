import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  phone: z.string().optional(),
  avatarPath: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const sellerApplicationSchema = z.object({
  storeName: z.string().min(3, "Store / brand name must be at least 3 characters"),
  sellerType: z.enum(["individual", "developer", "agency", "business"]),
  portfolioUrl: z.string().url("Please enter a valid URL (e.g. https://github.com/yourhandle)"),
  professionalBio: z
    .string()
    .min(30, "Please provide a bio of at least 30 characters explaining your technical expertise"),
  productCategories: z
    .array(z.string())
    .min(1, "Please select at least one product category"),
  country: z.string().min(2, "Please enter your country"),
  contactEmail: z.string().email("Please enter a valid contact email"),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the WebBazaar Seller Terms",
  }),
});

export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
