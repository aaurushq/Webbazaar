import { z } from "zod";

export const CUSTOMIZATION_FEATURE_OPTIONS = [
  "Brand Colors & Logo",
  "Custom Domain & Deployment",
  "Content & Copy Updates",
  "Additional Pages / Sections",
  "Payment Gateway Setup",
  "Authentication & Roles",
  "Third-Party API Integration",
  "SEO & Analytics Setup",
] as const;

export const createCustomizationRequestSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation identifier."),
  title: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 5, {
      message: "Request title must be at least 5 characters.",
    })
    .refine((v) => v.length <= 140, {
      message: "Request title cannot exceed 140 characters.",
    }),
  requirements: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 15, {
      message: "Please describe your customization requirements (at least 15 characters).",
    })
    .refine((v) => v.length <= 4000, {
      message: "Requirements cannot exceed 4,000 characters.",
    }),
  requestedFeatures: z
    .array(z.string().trim().min(1).max(80))
    .max(15, "Select up to 15 requested changes.")
    .default([]),
  optionalBudget: z
    .number()
    .int("Budget must be a whole INR amount.")
    .min(0, "Budget cannot be negative.")
    .max(100_000_000, "Budget exceeds allowed maximum.")
    .nullable()
    .optional(),
  desiredDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Preferred delivery date must be YYYY-MM-DD.")
    .nullable()
    .optional(),
});

export const updateCustomizationRequestSchema = createCustomizationRequestSchema.omit({
  conversationId: true,
});

export const createQuoteSchema = z.object({
  customizationRequestId: z.string().uuid("Invalid customization request identifier."),
  baseProductPrice: z
    .number()
    .int("Base product price must be a whole INR amount.")
    .min(0, "Base product price cannot be negative.")
    .max(100_000_000, "Base product price exceeds allowed maximum."),
  customizationPrice: z
    .number()
    .int("Customization price must be a whole INR amount.")
    .min(0, "Customization price cannot be negative.")
    .max(100_000_000, "Customization price exceeds allowed maximum."),
  scopeOfWork: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 15, {
      message: "Scope of work must be at least 15 characters.",
    })
    .refine((v) => v.length <= 4000, {
      message: "Scope of work cannot exceed 4,000 characters.",
    }),
  estimatedDeliveryDays: z
    .number()
    .int("Estimated delivery time must be whole days.")
    .min(1, "Estimated delivery time must be at least 1 day.")
    .max(365, "Estimated delivery time cannot exceed 365 days."),
  revisionPolicy: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 3, {
      message: "Revision policy must be at least 3 characters.",
    })
    .refine((v) => v.length <= 500, {
      message: "Revision policy cannot exceed 500 characters.",
    }),
  paymentTerms: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 5, {
      message: "Payment terms must be at least 5 characters.",
    })
    .refine((v) => v.length <= 1000, {
      message: "Payment terms cannot exceed 1,000 characters.",
    }),
  validDays: z
    .number()
    .int("Quote validity must be whole days.")
    .min(1, "Validity must be at least 1 day.")
    .max(90, "Validity cannot exceed 90 days.")
    .default(7),
  status: z.enum(["draft", "sent"]).default("sent"),
});

export const respondQuoteSchema = z.object({
  quoteId: z.string().uuid("Invalid quotation identifier."),
  decision: z.enum(["accepted", "declined"]),
});

export type CreateCustomizationRequestInput = z.infer<typeof createCustomizationRequestSchema>;
export type UpdateCustomizationRequestInput = z.infer<typeof updateCustomizationRequestSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type RespondQuoteInput = z.infer<typeof respondQuoteSchema>;
