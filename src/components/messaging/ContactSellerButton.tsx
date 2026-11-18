"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, AlertCircle, Store, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { startConversationAction } from "@/lib/messaging/actions";

interface ContactSellerButtonProps {
  listingId: string;
  listingSlug: string;
  sellerId: string;
  isDemo: boolean;
  listingStatus?: string;
}

export function ContactSellerButton({
  listingId,
  listingSlug,
  sellerId,
  isDemo,
  listingStatus = "approved",
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<"chat" | "customize" | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setCurrentUserId(user?.id || null);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrentUserId(session?.user?.id || null);
      setAuthChecked(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Unapproved or demo listings cannot initiate real buyer-seller conversations
  if (isDemo || listingStatus !== "approved") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled
          variant="outline"
          className="w-full justify-center gap-2 border-brand-border text-[#707896] cursor-not-allowed"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          <span>
            {isDemo ? "Demo Listing (Messaging Disabled)" : "Listing Not Approved for Inquiry"}
          </span>
        </Button>
        <p className="text-xs text-[#6B7290] text-center">
          {isDemo
            ? "Illustrative demo item. Contact Seller is enabled on approved live listings."
            : "Public inquiries open once this listing is approved."}
        </p>
      </div>
    );
  }

  // Seller viewing their own listing cannot message themselves
  if (authChecked && currentUserId && currentUserId === sellerId) {
    return (
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          disabled
          variant="outline"
          data-testid="contact-seller-own-listing"
          className="w-full justify-center gap-2 border-brand-border bg-brand-canvas text-[#58607D] cursor-not-allowed"
        >
          <Store className="size-4" aria-hidden="true" />
          <span>Your Listing</span>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full justify-center gap-1.5 border-brand-border text-brand-primary hover:bg-brand-canvas">
          <Link href="/dashboard/messages">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            <span>Open Buyer Inquiries</span>
          </Link>
        </Button>
      </div>
    );
  }

  const handleContactSeller = async (mode: "chat" | "customize") => {
    setErrorMsg(null);

    // Anonymous visitor -> redirect safely to login and return to this listing
    if (!currentUserId) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingSlug}`)}`);
      return;
    }

    setIsSubmitting(mode);
    const result = await startConversationAction(listingId);

    if (!result.success) {
      if (result.code === "UNAUTHENTICATED") {
        router.push(`/login?next=${encodeURIComponent(`/listings/${listingSlug}`)}`);
        return;
      }
      setErrorMsg(result.error);
      setIsSubmitting(null);
      return;
    }

    const suffix = mode === "customize" ? "?action=request-customization" : "";
    router.push(`/dashboard/messages/${result.data.conversationId}${suffix}`);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        size="lg"
        disabled={Boolean(isSubmitting) || !authChecked}
        onClick={() => handleContactSeller("chat")}
        data-testid="contact-seller-button"
        className="w-full justify-center gap-2 bg-brand-primary hover:bg-primary-700 text-white font-semibold"
      >
        {isSubmitting === "chat" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Opening Conversation...</span>
          </>
        ) : (
          <>
            <MessageSquare className="size-4" aria-hidden="true" />
            <span>Contact Seller</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={Boolean(isSubmitting) || !authChecked}
        onClick={() => handleContactSeller("customize")}
        data-testid="request-customization-listing-btn"
        className="w-full justify-center gap-2 border-[#C5C0FA] text-brand-primary hover:bg-[#F4F3FF] font-semibold"
      >
        {isSubmitting === "customize" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Opening Request Form...</span>
          </>
        ) : (
          <>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span>Request Customization</span>
          </>
        )}
      </Button>

      <p className="text-xs text-[#646B88] text-center">
        {currentUserId
          ? "Chat directly or submit a customization request to receive a structured quote."
          : "Sign in to contact the seller or request customizations for this project."}
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
