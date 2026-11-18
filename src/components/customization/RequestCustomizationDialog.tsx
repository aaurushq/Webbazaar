"use client";

import * as React from "react";
import { SlidersHorizontal, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CUSTOMIZATION_FEATURE_OPTIONS,
} from "@/lib/customization/schemas";
import {
  createCustomizationRequestAction,
  updateCustomizationRequestAction,
} from "@/lib/customization/actions";
import type { CustomizationRequestRecord } from "@/lib/customization/types";
import { cn } from "@/lib/utils";

interface RequestCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  listingTitle: string;
  editingRequest?: CustomizationRequestRecord | null;
  onSuccess: () => void;
}

export function RequestCustomizationDialog({
  open,
  onOpenChange,
  conversationId,
  listingTitle,
  editingRequest,
  onSuccess,
}: RequestCustomizationDialogProps) {
  const isEditing = Boolean(editingRequest);

  const [title, setTitle] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [optionalBudget, setOptionalBudget] = React.useState("");
  const [desiredDeliveryDate, setDesiredDeliveryDate] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (editingRequest) {
        setTitle(editingRequest.title);
        setRequirements(editingRequest.requirements);
        setSelectedFeatures(editingRequest.requested_features || []);
        setOptionalBudget(
          editingRequest.optional_budget !== null ? String(editingRequest.optional_budget) : ""
        );
        setDesiredDeliveryDate(editingRequest.desired_delivery_date || "");
      } else {
        setTitle(`Customize ${listingTitle}`.slice(0, 120));
        setRequirements("");
        setSelectedFeatures(["Brand Colors & Logo", "Custom Domain & Deployment"]);
        setOptionalBudget("");
        setDesiredDeliveryDate("");
      }
    }
  }, [open, editingRequest, listingTitle]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((item) => item !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let parsedBudget: number | null = null;
    if (optionalBudget.trim() !== "") {
      const numeric = Number(optionalBudget.trim());
      if (!Number.isInteger(numeric) || numeric < 0) {
        setErrorMsg("Optional budget must be a non-negative whole INR amount.");
        return;
      }
      parsedBudget = numeric;
    }

    setSubmitting(true);

    const payload = {
      title,
      requirements,
      requestedFeatures: selectedFeatures,
      optionalBudget: parsedBudget,
      desiredDeliveryDate: desiredDeliveryDate.trim() !== "" ? desiredDeliveryDate.trim() : null,
    };

    const res =
      isEditing && editingRequest
        ? await updateCustomizationRequestAction(editingRequest.id, payload)
        : await createCustomizationRequestAction({
            conversationId,
            ...payload,
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
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <DialogTitle className="text-base font-bold text-brand-dark">
                {isEditing ? "Edit Customization Request" : "Request Website / App Customization"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#58607D]">
                Share your requirements for <strong className="text-brand-dark">{listingTitle}</strong> so the seller can send a structured quotation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cust-title" className="text-xs font-semibold text-brand-dark">
              Request Title
            </label>
            <Input
              id="cust-title"
              data-testid="cust-request-title"
              type="text"
              required
              minLength={5}
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rebrand with custom menu, GST invoicing & domain setup"
              className="text-sm border-brand-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-brand-dark">
              Requested Changes (select all that apply)
            </span>
            <div className="flex flex-wrap gap-2">
              {CUSTOMIZATION_FEATURE_OPTIONS.map((feat) => {
                const selected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-brand-primary bg-[#F2F0FF] text-brand-primary font-semibold"
                        : "border-brand-border bg-white text-[#4B526E] hover:bg-brand-canvas"
                    )}
                  >
                    {selected && <Check className="size-3" aria-hidden="true" />}
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cust-req" className="text-xs font-semibold text-brand-dark">
              Detailed Requirements
            </label>
            <textarea
              id="cust-req"
              data-testid="cust-request-requirements"
              rows={4}
              required
              minLength={15}
              maxLength={4000}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe your brand colors, pages needed, integrations, or any workflow adjustments..."
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-[#8890AD] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cust-budget" className="text-xs font-semibold text-brand-dark">
                Optional Budget (INR ₹)
              </label>
              <Input
                id="cust-budget"
                data-testid="cust-request-budget"
                type="number"
                min={0}
                step={1}
                value={optionalBudget}
                onChange={(e) => setOptionalBudget(e.target.value)}
                placeholder="e.g., 25000"
                className="text-sm border-brand-border tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cust-date" className="text-xs font-semibold text-brand-dark">
                Preferred Delivery Date (Optional)
              </label>
              <Input
                id="cust-date"
                data-testid="cust-request-date"
                type="date"
                value={desiredDeliveryDate}
                onChange={(e) => setDesiredDeliveryDate(e.target.value)}
                className="text-sm border-brand-border"
              />
            </div>
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
              data-testid="cust-request-submit"
              className="bg-brand-primary hover:bg-primary-700 text-white font-semibold gap-1.5"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              <span>{isEditing ? "Save Changes" : "Submit Request"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
