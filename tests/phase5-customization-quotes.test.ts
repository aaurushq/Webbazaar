import { describe, it, expect } from "vitest";
import {
  createCustomizationRequestSchema,
  createQuoteSchema,
  respondQuoteSchema,
} from "@/lib/customization/schemas";

describe("WebBazaar Phase 5: Customization Requests & Quotations Validation (Zod)", () => {
  const validUuid = "e2728eb2-6139-493d-a4d5-1e4be59e6fc8";

  it("validates customization request input and rejects short titles or negative budgets", () => {
    const shortTitle = createCustomizationRequestSchema.safeParse({
      conversationId: validUuid,
      title: "Fix",
      requirements: "Please update branding colors and configure our custom domain.",
      requestedFeatures: ["Brand Colors & Logo"],
    });
    expect(shortTitle.success).toBe(false);

    const negativeBudget = createCustomizationRequestSchema.safeParse({
      conversationId: validUuid,
      title: "Custom Brand & Domain Setup",
      requirements: "Please update branding colors and configure our custom domain.",
      requestedFeatures: ["Brand Colors & Logo"],
      optionalBudget: -5000,
    });
    expect(negativeBudget.success).toBe(false);

    const floatBudget = createCustomizationRequestSchema.safeParse({
      conversationId: validUuid,
      title: "Custom Brand & Domain Setup",
      requirements: "Please update branding colors and configure our custom domain.",
      requestedFeatures: ["Brand Colors & Logo"],
      optionalBudget: 15000.5,
    });
    expect(floatBudget.success).toBe(false);

    const valid = createCustomizationRequestSchema.safeParse({
      conversationId: validUuid,
      title: "Custom Brand & Domain Setup",
      requirements: "Please update branding colors, upload our logo, and connect our custom domain.",
      requestedFeatures: ["Brand Colors & Logo", "Custom Domain & Deployment"],
      optionalBudget: 25000,
      desiredDeliveryDate: "2026-12-05",
    });
    expect(valid.success).toBe(true);
  });

  it("validates seller quotation prices as non-negative integer INR and rejects invalid delivery days", () => {
    const negPrice = createQuoteSchema.safeParse({
      customizationRequestId: validUuid,
      baseProductPrice: 15999,
      customizationPrice: -100,
      scopeOfWork: "Complete rebranding, logo placement, and Vercel deployment setup.",
      estimatedDeliveryDays: 5,
      revisionPolicy: "2 rounds of revisions included",
      paymentTerms: "50% upfront, 50% on handover",
      validDays: 7,
    });
    expect(negPrice.success).toBe(false);

    const floatPrice = createQuoteSchema.safeParse({
      customizationRequestId: validUuid,
      baseProductPrice: 15999.99,
      customizationPrice: 4000,
      scopeOfWork: "Complete rebranding, logo placement, and Vercel deployment setup.",
      estimatedDeliveryDays: 5,
      revisionPolicy: "2 rounds of revisions included",
      paymentTerms: "50% upfront, 50% on handover",
      validDays: 7,
    });
    expect(floatPrice.success).toBe(false);

    const zeroDays = createQuoteSchema.safeParse({
      customizationRequestId: validUuid,
      baseProductPrice: 15999,
      customizationPrice: 4000,
      scopeOfWork: "Complete rebranding, logo placement, and Vercel deployment setup.",
      estimatedDeliveryDays: 0,
      revisionPolicy: "2 rounds of revisions included",
      paymentTerms: "50% upfront, 50% on handover",
      validDays: 7,
    });
    expect(zeroDays.success).toBe(false);

    const valid = createQuoteSchema.safeParse({
      customizationRequestId: validUuid,
      baseProductPrice: 15999,
      customizationPrice: 4001,
      scopeOfWork: "Complete rebranding, logo placement, and Vercel deployment setup.",
      estimatedDeliveryDays: 5,
      revisionPolicy: "2 rounds of revisions included",
      paymentTerms: "50% upfront, 50% on handover",
      validDays: 7,
      status: "sent",
    });
    expect(valid.success).toBe(true);
  });

  it("validates buyer quote response decisions strictly", () => {
    expect(
      respondQuoteSchema.safeParse({ quoteId: validUuid, decision: "accepted" }).success
    ).toBe(true);
    expect(
      respondQuoteSchema.safeParse({ quoteId: validUuid, decision: "declined" }).success
    ).toBe(true);
    expect(
      respondQuoteSchema.safeParse({ quoteId: validUuid, decision: "withdrawn" }).success
    ).toBe(false);
  });
});
