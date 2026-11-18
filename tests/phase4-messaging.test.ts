import { describe, it, expect } from "vitest";
import {
  startConversationSchema,
  sendMessageSchema,
  MAX_MESSAGE_LENGTH,
} from "@/lib/messaging/schemas";

describe("WebBazaar Phase 4: Messaging Validation (Zod)", () => {
  const validUuid = "abd1a8ff-5acd-44b4-ab50-d3a23aeb958a";

  it("validates listing UUID on conversation initiation", () => {
    expect(startConversationSchema.safeParse({ listingId: "not-a-uuid" }).success).toBe(false);
    expect(startConversationSchema.safeParse({ listingId: "" }).success).toBe(false);
    expect(startConversationSchema.safeParse({ listingId: validUuid }).success).toBe(true);
  });

  it("rejects empty and whitespace-only messages", () => {
    expect(
      sendMessageSchema.safeParse({ conversationId: validUuid, body: "" }).success
    ).toBe(false);
    expect(
      sendMessageSchema.safeParse({ conversationId: validUuid, body: "   \n\t  " }).success
    ).toBe(false);
  });

  it("rejects messages exceeding maximum allowed length", () => {
    const tooLong = "a".repeat(MAX_MESSAGE_LENGTH + 1);
    const res = sendMessageSchema.safeParse({
      conversationId: validUuid,
      body: tooLong,
    });
    expect(res.success).toBe(false);
  });

  it("trims outer whitespace and accepts valid messages", () => {
    const res = sendMessageSchema.safeParse({
      conversationId: validUuid,
      body: "  Hi! Can you customize the Razorpay checkout and add our logo?  ",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.body).toBe(
        "Hi! Can you customize the Razorpay checkout and add our logo?"
      );
    }
  });
});
