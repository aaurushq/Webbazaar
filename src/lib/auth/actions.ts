"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  sellerApplicationSchema,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ProfileUpdateInput,
  SellerApplicationInput,
} from "./schemas";

/**
 * Sanitizes redirect destination to prevent open redirects
 */
export async function sanitizeRedirect(url?: string | null): Promise<string> {
  if (!url) return "/dashboard/buyer";
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return "/dashboard/buyer";
}

export async function signInAction(input: LoginInput, nextUrl?: string | null) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid credentials format" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes("email not confirmed") || (error as any).code === "email_not_confirmed") {
      return {
        error: "Your email address has not been confirmed yet. Please check your inbox for the verification link.",
        isEmailUnconfirmed: true,
        email: parsed.data.email,
      };
    }
    if (errorMsg.includes("invalid login credentials") || (error as any).code === "invalid_credentials") {
      return {
        error: "Invalid email or password. Please verify your credentials and try again.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  const destination = await sanitizeRedirect(nextUrl);
  redirect(destination);
}

export async function signUpAction(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid registration format" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${appUrl}/auth/confirm?next=/dashboard/buyer`,
    },
  });

  if (error) {
    if (
      error.message.includes("rate limit") ||
      (error as any).code === "over_email_send_rate_limit" ||
      (error as any).status === 429
    ) {
      return {
        error:
          "Email send limit reached for this hour on Supabase free tier (3 emails/hour). If you have already registered, check your spam/inbox or wait for the cooldown.",
      };
    }
    if (error.message.includes("User already registered")) {
      return {
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }
    return { error: error.message };
  }

  // If email confirmation is required by Supabase
  if (data?.user && !data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      email: parsed.data.email,
      message: `Registration successful! A confirmation email has been sent to ${parsed.data.email}. Please click the link inside to activate your account.`,
    };
  }

  // If Supabase has email confirmation disabled and returned an immediate session
  revalidatePath("/", "layout");
  redirect("/dashboard/buyer");
}

export async function resendVerificationEmailAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Please provide a valid email address to resend confirmation." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm?next=/dashboard/buyer`,
    },
  });

  if (error) {
    if (
      error.message.includes("rate limit") ||
      (error as any).code === "over_email_send_rate_limit" ||
      (error as any).status === 429
    ) {
      return {
        error:
          "Email rate limit exceeded. Please wait a few minutes before requesting another confirmation email.",
      };
    }
    return { error: error.message };
  }

  return {
    success: true,
    message: `A new confirmation email has been dispatched to ${email}.`,
  };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(input: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid email format" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    if (
      error.message.includes("rate limit") ||
      (error as any).code === "over_email_send_rate_limit" ||
      (error as any).status === 429
    ) {
      return {
        error: "Password reset email rate limit exceeded. Please try again after a few minutes.",
      };
    }
    return { error: error.message };
  }

  return {
    success: true,
    message: `Password reset link sent to ${parsed.data.email}! Please check your email inbox and spam folder.`,
  };
}

export async function resetPasswordAction(input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid password format" };
  }

  const supabase = createClient();

  // Verify that an active session exists (established via /auth/confirm token exchange)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Your password reset link is invalid, expired, or you are not in an active recovery session. Please request a new link from the forgot password page.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Your password has been successfully updated! You may now sign in with your new password.",
  };
}

export async function updateProfileAction(input: ProfileUpdateInput) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid profile data" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      phone: parsed.data.phone || null,
      avatar_path: parsed.data.avatarPath || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/buyer");
  return { success: true, message: "Profile updated successfully." };
}

export async function submitSellerApplicationAction(input: SellerApplicationInput) {
  const parsed = sellerApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid application format" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit a seller application." };
  }

  const { data: existing } = await (supabase as any)
    .from("seller_applications")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.status === "approved") {
      return { error: "You are already an approved verified seller!" };
    }
    if (existing.status === "submitted" || existing.status === "under_review") {
      return { error: "You already have an active application under review." };
    }
  }

  const { error: insertErr } = await (supabase as any).from("seller_applications").insert({
    user_id: user.id,
    store_name: parsed.data.storeName,
    seller_type: parsed.data.sellerType,
    portfolio_url: parsed.data.portfolioUrl,
    professional_bio: parsed.data.professionalBio,
    product_categories: parsed.data.productCategories,
    country: parsed.data.country,
    contact_email: parsed.data.contactEmail,
    terms_agreed: true,
    status: "submitted",
  });

  if (insertErr) {
    return { error: insertErr.message };
  }

  await (supabase as any).from("user_roles").upsert(
    {
      user_id: user.id,
      role: "SELLER_APPLICANT",
    },
    { onConflict: "user_id,role" }
  );

  await (supabase as any).from("seller_verification_events").insert({
    event_type: "submitted",
    actor_id: user.id,
    notes: "Seller application submitted by user",
  });

  revalidatePath("/dashboard/seller");
  revalidatePath("/become-a-seller");
  return { success: true, message: "Seller application submitted successfully! Our team will review your credentials." };
}

export async function adminReviewSellerApplicationAction(
  applicationId: string,
  newStatus: "approved" | "rejected" | "under_review" | "suspended",
  reason?: string
) {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc("admin_process_seller_application", {
    target_app_id: applicationId,
    new_status: newStatus,
    admin_reason: reason || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/seller");
  return { success: true, data };
}
