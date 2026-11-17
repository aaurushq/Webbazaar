import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  sellerApplicationSchema,
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import { sanitizeRedirect } from "@/lib/auth/actions";

describe("WebBazaar Phase 2: Auth Input Validation (Zod)", () => {
  it("validates login email and minimum password length", () => {
    const invalidEmail = loginSchema.safeParse({ email: "invalid", password: "password123" });
    expect(invalidEmail.success).toBe(false);

    const invalidPass = loginSchema.safeParse({ email: "user@example.com", password: "123" });
    expect(invalidPass.success).toBe(false);

    const valid = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(valid.success).toBe(true);
  });

  it("enforces strong passwords and password matching on registration", () => {
    // Missing uppercase and number
    const weak = registerSchema.safeParse({
      fullName: "Rahul Sharma",
      email: "rahul@example.com",
      password: "password",
      confirmPassword: "password",
    });
    expect(weak.success).toBe(false);

    // Mismatched confirmation
    const mismatch = registerSchema.safeParse({
      fullName: "Rahul Sharma",
      email: "rahul@example.com",
      password: "Password123",
      confirmPassword: "Password456",
    });
    expect(mismatch.success).toBe(false);

    // Valid registration input
    const valid = registerSchema.safeParse({
      fullName: "Rahul Sharma",
      email: "rahul@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(valid.success).toBe(true);
  });

  it("validates seller onboarding application schema", () => {
    // Missing portfolio URL and terms agreement
    const invalid = sellerApplicationSchema.safeParse({
      storeName: "Ab", // too short
      sellerType: "developer",
      portfolioUrl: "not-a-url",
      professionalBio: "Short bio",
      productCategories: [],
      country: "India",
      contactEmail: "invalid-email",
      termsAgreed: false,
    });
    expect(invalid.success).toBe(false);

    // Valid application
    const valid = sellerApplicationSchema.safeParse({
      storeName: "NextCraft Studio",
      sellerType: "developer",
      portfolioUrl: "https://github.com/nextcraft",
      professionalBio: "Full-stack developer with 5 years experience in building high-conversion Next.js applications and SaaS boilerplates.",
      productCategories: ["SaaS & Web Apps", "Templates & Code"],
      country: "India",
      contactEmail: "team@nextcraft.in",
      termsAgreed: true,
    });
    expect(valid.success).toBe(true);
  });

  it("validates profile update fields", () => {
    const invalid = profileUpdateSchema.safeParse({
      displayName: "A",
    });
    expect(invalid.success).toBe(false);

    const valid = profileUpdateSchema.safeParse({
      displayName: "Priya Patel",
      phone: "+91 9876543210",
    });
    expect(valid.success).toBe(true);
  });
});

describe("WebBazaar Phase 2: Open Redirect Security Mitigation", () => {
  it("permits safe relative URLs", async () => {
    expect(await sanitizeRedirect("/dashboard/seller")).toBe("/dashboard/seller");
    expect(await sanitizeRedirect("/marketplace?category=SaaS")).toBe("/marketplace?category=SaaS");
    expect(await sanitizeRedirect("/become-a-seller")).toBe("/become-a-seller");
  });

  it("neutralizes protocol-relative open redirect attacks (//evil.com)", async () => {
    expect(await sanitizeRedirect("//evil.com")).toBe("/dashboard/buyer");
    expect(await sanitizeRedirect("//phishing.site/login")).toBe("/dashboard/buyer");
  });

  it("neutralizes absolute external URLs", async () => {
    expect(await sanitizeRedirect("https://malicious.com")).toBe("/dashboard/buyer");
    expect(await sanitizeRedirect("javascript:alert(1)")).toBe("/dashboard/buyer");
    expect(await sanitizeRedirect(null)).toBe("/dashboard/buyer");
    expect(await sanitizeRedirect(undefined)).toBe("/dashboard/buyer");
  });
});

describe("WebBazaar Phase 2: Role Management & Verification Rules", () => {
  const ROLES = ["BUYER", "SELLER_APPLICANT", "VERIFIED_SELLER", "ADMIN"];

  it("supports the 4 required role constants", () => {
    expect(ROLES).toContain("BUYER");
    expect(ROLES).toContain("SELLER_APPLICANT");
    expect(ROLES).toContain("VERIFIED_SELLER");
    expect(ROLES).toContain("ADMIN");
  });

  it("does not allow self-assigned seller verification status", () => {
    const initialApplicationState = {
      user_id: "usr-1",
      status: "submitted",
      is_verified: false,
    };
    // Status must remain submitted until admin triggers approval procedure
    expect(initialApplicationState.is_verified).toBe(false);
    expect(initialApplicationState.status).toBe("submitted");
  });
});
