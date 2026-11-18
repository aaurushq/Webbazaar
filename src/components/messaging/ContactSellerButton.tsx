"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, AlertCircle, Store } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const handleContactSeller = async () => {
    setErrorMsg(null);

    // Anonymous visitor -> redirect safely to login and return to this listing
    if (!currentUserId) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingSlug}`)}`);
      return;
    }

    setIsSubmitting(true);
    const result = await startConversationAction(listingId);

    if (!result.success) {
      if (result.code === "UNAUTHENTICATED") {
        router.push(`/login?next=${encodeURIComponent(`/listings/${listingSlug}`)}`);
        return;
      }
      setErrorMsg(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/dashboard/messages/${result.data.conversationId}`);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        size="lg"
        disabled={isSubmitting || !authChecked}
        onClick={handleContactSeller}
        data-testid="contact-seller-button"
        className="w-full justify-center gap-2 bg-brand-primary hover:bg-primary-700 text-white font-semibold"
      >
        {isSubmitting ? (
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

      <p className="text-xs text-[#646B88] text-center">
        {currentUserId
          ? "Start a direct real-time chat to discuss demo details and customization."
          : "Sign in to message the seller directly about this project."}
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
