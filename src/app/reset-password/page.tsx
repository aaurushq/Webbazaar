"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/auth/schemas";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(!!code);

  React.useEffect(() => {
    if (code) {
      const exchangeCode = async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setServerError("The password reset link is invalid or expired. Please request a new one.");
          }
        } catch {
          setServerError("Could not verify recovery link.");
        } finally {
          setIsVerifyingCode(false);
        }
      };
      exchangeCode();
    }
  }, [code]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await resetPasswordAction(values);
    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccessInfo(result.message);
      setIsLoading(false);
    }
  };

  if (isVerifyingCode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">Verifying your recovery link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-lg">
              W
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Web<span className="text-primary-600">Bazaar</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set new password
          </h1>
          <p className="text-xs text-slate-500">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{serverError}</span>
              <div className="mt-1">
                <Link href="/forgot-password" className="font-semibold underline">
                  Request a new reset link
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successInfo ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Password Updated</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{successInfo}</p>
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/login">Proceed to Sign In</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
                  className="pl-9 h-10 text-sm"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Repeat your new password"
                  className="pl-9 h-10 text-sm"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold gap-1.5"
              disabled={isLoading || isVerifyingCode}
            >
              {isLoading ? (
                <span>Updating password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
