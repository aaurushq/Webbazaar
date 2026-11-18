"use client";

import * as React from "react";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSellerQuoteAction } from "@/lib/customization/actions";
import type { CustomizationRequestRecord } from "@/lib/customization/types";
import { formatINR } from "@/lib/utils";

interface CreateQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CustomizationRequestRecord | null;
  defaultBasePriceINR: number;
  onSuccess: () => void;
}

export function CreateQuoteDialog({
  open,
  onOpenChange,
  request,
  defaultBasePriceINR,
  onSuccess,
}: CreateQuoteDialogProps) {
  const [basePrice, setBasePrice] = React.useState("");
  const [customPrice, setCustomPrice] = React.useState("");
  const [scopeOfWork, setScopeOfWork] = React.useState("");
  const [deliveryDays, setDeliveryDays] = React.useState("7");
  const [revisionPolicy, setRevisionPolicy] = React.useState("Up to 2 revision rounds included");
  const [paymentTerms, setPaymentTerms] = React.useState(
    "50% advance arranged directly with seller, 50% on final handover"
  );
  const [validDays, setValidDays] = React.useState("7");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const hasExistingSentQuote = Boolean(
    request?.quotes?.some((q) => q.status === "sent")
  );
  const nextVersion = (request?.quotes?.length || 0) + 1;

  React.useEffect(() => {
    if (open && request) {
      setErrorMsg(null);
      setBasePrice(String(Math.max(0, Math.round(defaultBasePriceINR || 0))));
      setCustomPrice("5000");
      setScopeOfWork("");
      setDeliveryDays("7");
      setRevisionPolicy("Up to 2 revision rounds included");
      setPaymentTerms("50% advance arranged directly with seller, 50% on final handover");
      setValidDays("7");
    }
  }, [open, request, defaultBasePriceINR]);

  const parsedBase = Number(basePrice);
  const parsedCustom = Number(customPrice);
  const computedTotal =
    Number.isInteger(parsedBase) &&
    parsedBase >= 0 &&
    Number.isInteger(parsedCustom) &&
    parsedCustom >= 0
      ? parsedBase + parsedCustom
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    setErrorMsg(null);

    if (!Number.isInteger(parsedBase) || parsedBase < 0) {
      setErrorMsg("Base product price must be a non-negative whole INR amount.");
      return;
    }
    if (!Number.isInteger(parsedCustom) || parsedCustom < 0) {
      setErrorMsg("Customization price must be a non-negative whole INR amount.");
      return;
    }

    const parsedDays = Number(deliveryDays);
    const parsedValid = Number(validDays);

    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      setErrorMsg("Estimated delivery days must be between 1 and 365.");
      return;
    }
    if (!Number.isInteger(parsedValid) || parsedValid < 1 || parsedValid > 90) {
      setErrorMsg("Quote validity must be between 1 and 90 days.");
      return;
    }

    setSubmitting(true);
    const res = await createSellerQuoteAction({
      customizationRequestId: request.id,
      baseProductPrice: parsedBase,
      customizationPrice: parsedCustom,
      scopeOfWork,
      estimatedDeliveryDays: parsedDays,
      revisionPolicy,
      paymentTerms,
      validDays: parsedValid,
      status: "sent",
    });
    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-brand-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary shrink-0">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <DialogTitle className="text-base font-bold text-brand-dark">
                {hasExistingSentQuote
                  ? `Send Revised Quotation (v${nextVersion})`
                  : `Send Structured Quotation (v${nextVersion})`}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#58607D]">
                For request: <strong className="text-brand-dark">{request?.title}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {hasExistingSentQuote && (
            <div className="rounded-lg border border-[#D7D3FE] bg-[#F4F3FF] px-3 py-2 text-xs text-[#5146D6]">
              Sending a revised quotation will automatically create version v{nextVersion} and withdraw your previous active offer.
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* INR Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="quote-base-price" className="text-xs font-semibold text-brand-dark">
                Base Product Price (INR ₹)
              </label>
              <Input
                id="quote-base-price"
                data-testid="quote-base-price"
                type="number"
                required
                min={0}
                step={1}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="text-sm border-brand-border tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="quote-custom-price" className="text-xs font-semibold text-brand-dark">
                Customization Price (INR ₹)
              </label>
              <Input
                id="quote-custom-price"
                data-testid="quote-custom-price"
                type="number"
                required
                min={0}
                step={1}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="text-sm border-brand-border tabular-nums"
              />
            </div>
          </div>

          {/* Server-Matched Total Preview */}
          <div className="rounded-xl border border-[#D7D3FE] bg-brand-canvas px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-brand-dark">Total Quoted Price (INR)</span>
              <span className="text-xs text-[#646B88]">
                Calculated &amp; locked server-side upon submission
              </span>
            </div>
            <span
              data-testid="quote-total-preview"
              className="text-lg font-extrabold text-brand-primary tabular-nums"
            >
              {computedTotal !== null ? formatINR(computedTotal) : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quote-scope" className="text-xs font-semibold text-brand-dark">
              Scope of Work &amp; Deliverables
            </label>
            <textarea
              id="quote-scope"
              data-testid="quote-scope-input"
              rows={4}
              required
              minLength={15}
              maxLength={4000}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="List exact deliverables, customization milestones, deployment steps, and what is included..."
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-[#8890AD] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="quote-days" className="text-xs font-semibold text-brand-dark">
                Estimated Delivery (Days)
              </label>
              <Input
                id="quote-days"
                data-testid="quote-delivery-days"
                type="number"
                required
                min={1}
                max={365}
                step={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="text-sm border-brand-border tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="quote-validity" className="text-xs font-semibold text-brand-dark">
                Quote Valid For (Days)
              </label>
              <Input
                id="quote-validity"
                data-testid="quote-valid-days"
                type="number"
                required
                min={1}
                max={90}
                step={1}
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                className="text-sm border-brand-border tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quote-revisions" className="text-xs font-semibold text-brand-dark">
              Revision Policy
            </label>
            <Input
              id="quote-revisions"
              data-testid="quote-revision-policy"
              type="text"
              required
              minLength={3}
              maxLength={500}
              value={revisionPolicy}
              onChange={(e) => setRevisionPolicy(e.target.value)}
              className="text-sm border-brand-border"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quote-payment-terms" className="text-xs font-semibold text-brand-dark">
              Direct Payment &amp; Handover Terms
            </label>
            <Input
              id="quote-payment-terms"
              data-testid="quote-payment-terms"
              type="text"
              required
              minLength={5}
              maxLength={1000}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="text-sm border-brand-border"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="border-brand-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="quote-submit-button"
              className="bg-brand-primary hover:bg-primary-700 text-white font-semibold gap-1.5"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              <span>Send Quotation</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
