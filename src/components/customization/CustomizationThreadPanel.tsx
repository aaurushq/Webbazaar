"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Edit3,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  cancelCustomizationRequestAction,
  markRequestDiscussingAction,
  respondToQuoteAction,
  withdrawSellerQuoteAction,
} from "@/lib/customization/actions";
import type {
  CustomizationRequestRecord,
  CustomizationRequestStatus,
  QuoteRecord,
  QuoteStatus,
} from "@/lib/customization/types";
import { formatINR } from "@/lib/utils";

interface CustomizationThreadPanelProps {
  requests: CustomizationRequestRecord[];
  isBuyer: boolean;
  isSeller: boolean;
  onOpenNewRequest: () => void;
  onEditRequest: (req: CustomizationRequestRecord) => void;
  onOpenSendQuote: (req: CustomizationRequestRecord) => void;
  onRefresh: () => void;
}

function getRequestStatusBadge(status: CustomizationRequestStatus) {
  switch (status) {
    case "submitted":
      return { variant: "outline" as const, label: "Submitted" };
    case "discussing":
      return { variant: "accent" as const, label: "Discussing" };
    case "quoted":
      return { variant: "default" as const, label: "Quoted" };
    case "closed":
      return { variant: "success" as const, label: "Accepted & Closed" };
    case "cancelled":
      return { variant: "secondary" as const, label: "Cancelled" };
  }
}

function getQuoteStatusBadge(status: QuoteStatus, isExpiredByClock: boolean) {
  if (status === "sent" && isExpiredByClock) {
    return { variant: "secondary" as const, label: "Expired" };
  }
  switch (status) {
    case "draft":
      return { variant: "secondary" as const, label: "Draft" };
    case "sent":
      return { variant: "default" as const, label: "Quote Sent" };
    case "accepted":
      return { variant: "success" as const, label: "Accepted" };
    case "declined":
      return { variant: "destructive" as const, label: "Declined" };
    case "withdrawn":
      return { variant: "secondary" as const, label: "Withdrawn" };
    case "expired":
      return { variant: "secondary" as const, label: "Expired" };
  }
}

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CustomizationThreadPanel({
  requests,
  isBuyer,
  isSeller,
  onOpenNewRequest,
  onEditRequest,
  onOpenSendQuote,
  onRefresh,
}: CustomizationThreadPanelProps) {
  const [expanded, setExpanded] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [clockMs, setClockMs] = React.useState<number>(0);

  React.useEffect(() => {
    setClockMs(new Date().getTime());
  }, [requests]);

  const handleMarkDiscussing = async (reqId: string) => {
    setActionError(null);
    setBusyKey(`discussing-${reqId}`);
    const res = await markRequestDiscussingAction(reqId);
    setBusyKey(null);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    onRefresh();
  };

  const handleCancelRequest = async (reqId: string) => {
    setActionError(null);
    setBusyKey(`cancel-${reqId}`);
    const res = await cancelCustomizationRequestAction(reqId);
    setBusyKey(null);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    onRefresh();
  };

  const handleQuoteDecision = async (quoteId: string, decision: "accepted" | "declined") => {
    setActionError(null);
    setBusyKey(`${decision}-${quoteId}`);
    const res = await respondToQuoteAction({ quoteId, decision });
    setBusyKey(null);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    onRefresh();
  };

  const handleWithdrawQuote = async (quoteId: string) => {
    setActionError(null);
    setBusyKey(`withdraw-${quoteId}`);
    const res = await withdrawSellerQuoteAction(quoteId);
    setBusyKey(null);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    onRefresh();
  };

  return (
    <div
      data-testid="customization-thread-panel"
      className="border-b border-brand-border bg-brand-canvas/70 shrink-0"
    >
      {/* Compact Header Strip */}
      <div className="px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-dark hover:text-brand-primary transition-colors"
        >
          <SlidersHorizontal className="size-3.5 text-brand-primary" aria-hidden="true" />
          <span>Customization &amp; Quotations</span>
          <span className="rounded-full bg-[#ECEAFE] px-2 py-0.5 text-xs font-semibold text-[#5146D6] tabular-nums">
            {requests.length}
          </span>
          {expanded ? (
            <ChevronUp className="size-3.5 text-[#646B88]" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5 text-[#646B88]" aria-hidden="true" />
          )}
        </button>

        {isBuyer && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="open-request-customization-btn"
            onClick={onOpenNewRequest}
            className="gap-1.5 bg-white border-[#C5C0FA] text-brand-primary hover:bg-[#F4F3FF] text-xs font-semibold"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            <span>Request Customization</span>
          </Button>
        )}
      </div>

      {actionError && (
        <div
          role="alert"
          className="mx-4 mb-2.5 sm:mx-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Expanded Cards Region */}
      {expanded && requests.length > 0 && (
        <div className="px-4 pb-3.5 sm:px-6 max-h-[290px] overflow-auto flex flex-col gap-3">
          {requests.map((req) => {
            const reqBadge = getRequestStatusBadge(req.status);
            const canBuyerEdit = isBuyer && (req.status === "submitted" || req.status === "discussing");
            const canBuyerCancel =
              isBuyer &&
              (req.status === "submitted" || req.status === "discussing" || req.status === "quoted");
            const canSellerQuote =
              isSeller &&
              (req.status === "submitted" || req.status === "discussing" || req.status === "quoted");

            return (
              <div
                key={req.id}
                data-testid={`customization-request-card-${req.id}`}
                className="rounded-xl border border-brand-border bg-white p-4 flex flex-col gap-3 shadow-[0_4px_14px_-8px_rgba(16,21,43,0.10)]"
              >
                {/* Request Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        Customization Request
                      </span>
                      <Badge variant={reqBadge.variant}>{reqBadge.label}</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-brand-dark">{req.title}</h3>
                  </div>

                  {/* Role-specific Request Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {canBuyerEdit && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEditRequest(req)}
                        className="gap-1 border-brand-border text-xs"
                      >
                        <Edit3 className="size-3" aria-hidden="true" />
                        <span>Edit</span>
                      </Button>
                    )}
                    {canBuyerCancel && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === `cancel-${req.id}`}
                        onClick={() => handleCancelRequest(req.id)}
                        className="text-xs text-[#646B88] hover:text-red-600"
                      >
                        Cancel
                      </Button>
                    )}
                    {isSeller && req.status === "submitted" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyKey === `discussing-${req.id}`}
                        onClick={() => handleMarkDiscussing(req.id)}
                        data-testid={`mark-discussing-${req.id}`}
                        className="gap-1 border-brand-border text-xs"
                      >
                        <MessageSquare className="size-3" aria-hidden="true" />
                        <span>Mark Discussing</span>
                      </Button>
                    )}
                    {canSellerQuote && (
                      <Button
                        type="button"
                        size="sm"
                        data-testid={`send-quote-btn-${req.id}`}
                        onClick={() => onOpenSendQuote(req)}
                        className="gap-1 bg-brand-primary hover:bg-primary-700 text-white text-xs font-semibold"
                      >
                        <FileText className="size-3.5" aria-hidden="true" />
                        <span>
                          {req.quotes.length > 0 ? "Send Revised Quote" : "Send Quote"}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Request Requirements & Meta */}
                <p className="text-xs text-[#4B526E] leading-relaxed whitespace-pre-wrap">
                  {req.requirements}
                </p>

                {req.requested_features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {req.requested_features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-full bg-brand-canvas border border-brand-border px-2.5 py-0.5 text-xs font-medium text-[#3C435E]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#646B88] tabular-nums">
                  {req.optional_budget !== null && (
                    <span>
                      Target budget: <strong className="text-brand-dark">{formatINR(req.optional_budget)}</strong>
                    </span>
                  )}
                  {req.desired_delivery_date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden="true" />
                      <span>Preferred by {formatDateShort(req.desired_delivery_date)}</span>
                    </span>
                  )}
                </div>

                {/* Nested Quotations for this Request */}
                {req.quotes.length > 0 && (
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-[#F0F1FA]">
                    {req.quotes.map((quote: QuoteRecord) => {
                      const isExpiredByClock =
                        clockMs > 0 && new Date(quote.expires_at).getTime() <= clockMs;
                      const qBadge = getQuoteStatusBadge(quote.status, isExpiredByClock);
                      const canBuyerRespond =
                        isBuyer && quote.status === "sent" && !isExpiredByClock;
                      const canSellerWithdraw =
                        isSeller && (quote.status === "sent" || quote.status === "draft");

                      return (
                        <div
                          key={quote.id}
                          data-testid={`quote-card-${quote.id}`}
                          className="rounded-xl border border-[#DFDDF7] bg-[#FAF9FF] p-3.5 flex flex-col gap-3"
                        >
                          {/* Quote Top Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-brand-primary" aria-hidden="true" />
                              <span className="text-xs font-bold text-brand-dark tabular-nums">
                                Quotation v{quote.version}
                              </span>
                              <Badge variant={qBadge.variant}>{qBadge.label}</Badge>
                              {quote.status === "accepted" && (
                                <span
                                  data-testid={`quote-immutable-badge-${quote.id}`}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#5146D6]"
                                >
                                  <Lock className="size-3" aria-hidden="true" />
                                  <span>Terms Locked</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#646B88] tabular-nums inline-flex items-center gap-1">
                              <Clock className="size-3.5" aria-hidden="true" />
                              <span>Valid until {formatDateShort(quote.expires_at)}</span>
                            </span>
                          </div>

                          {/* Price Breakdown */}
                          <div className="grid grid-cols-3 gap-2 rounded-lg bg-white border border-brand-border p-2.5 text-xs tabular-nums">
                            <div className="flex flex-col">
                              <span className="text-[#6B7290]">Base Product</span>
                              <span className="font-semibold text-brand-dark">
                                {formatINR(quote.base_product_price)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#6B7290]">Customization</span>
                              <span className="font-semibold text-brand-dark">
                                {formatINR(quote.customization_price)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#6B7290]">Total Quote</span>
                              <span
                                data-testid={`quote-total-${quote.id}`}
                                className="font-extrabold text-brand-primary"
                              >
                                {formatINR(quote.total_price)}
                              </span>
                            </div>
                          </div>

                          {/* Scope, Timeline & Terms */}
                          <div className="flex flex-col gap-1.5 text-xs text-[#4B526E]">
                            <p className="leading-relaxed whitespace-pre-wrap">
                              <strong className="text-brand-dark">Scope:</strong> {quote.scope_of_work}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#58607D]">
                              <span>
                                <strong className="text-brand-dark">Delivery:</strong>{" "}
                                {quote.estimated_delivery_days} days
                              </span>
                              <span>
                                <strong className="text-brand-dark">Revisions:</strong>{" "}
                                {quote.revision_policy}
                              </span>
                            </div>
                            <p className="text-[#58607D]">
                              <strong className="text-brand-dark">Payment terms:</strong>{" "}
                              {quote.payment_terms}
                            </p>
                          </div>

                          {/* Buyer Accept / Decline OR Seller Withdraw */}
                          {(canBuyerRespond || canSellerWithdraw) && (
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E6E4FA]">
                              {canSellerWithdraw && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={busyKey === `withdraw-${quote.id}`}
                                  onClick={() => handleWithdrawQuote(quote.id)}
                                  className="text-xs border-brand-border"
                                >
                                  Withdraw Quote
                                </Button>
                              )}
                              {canBuyerRespond && (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={Boolean(busyKey)}
                                    onClick={() => handleQuoteDecision(quote.id, "declined")}
                                    data-testid={`decline-quote-${quote.id}`}
                                    className="gap-1 text-xs border-brand-border text-[#4B526E] hover:text-red-600"
                                  >
                                    <XCircle className="size-3.5" aria-hidden="true" />
                                    <span>Decline</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={Boolean(busyKey)}
                                    onClick={() => handleQuoteDecision(quote.id, "accepted")}
                                    data-testid={`accept-quote-${quote.id}`}
                                    className="gap-1 bg-brand-primary hover:bg-primary-700 text-white text-xs font-semibold"
                                  >
                                    {busyKey === `accepted-${quote.id}` ? (
                                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                    )}
                                    <span>Accept Quote</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
