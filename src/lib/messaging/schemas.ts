import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 2000;

export const startConversationSchema = z.object({
  listingId: z.string().uuid("Invalid listing identifier."),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation identifier."),
  body: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, {
      message: "Message cannot be empty.",
    })
    .refine((val) => val.length <= MAX_MESSAGE_LENGTH, {
      message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
    }),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
