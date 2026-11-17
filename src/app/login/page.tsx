"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/auth/schemas";
import { signInAction, resendVerificationEmailAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [serverError, setServerError] = React.useState<string | null>(urlError);
  const [serverMessage, setServerMessage] = React.useState<string | null>(urlMessage);
  const [unconfirmedEmail, setUnconfirmedEmail] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setServerError(null);
    setServerMessage(null);
    setUnconfirmedEmail(null);
    setResendStatus(null);

    const result = await signInAction(values, nextParam);
    if (result?.error) {
      setServerError(result.error);
      if (result.isEmailUnconfirmed && result.email) {
        setUnconfirmedEmail(result.email);
      }
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unconfirmedEmail) return;
    setIsResending(true);
    setResendStatus(null);

    const result = await resendVerificationEmailAction(unconfirmedEmail);
    if (result.error) {
      setResendStatus(`Error: ${result.error}`);
    } else {
      setResendStatus(result.message || "Verification email sent!");
    }
    setIsResending(false);
  };

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
            Sign in to your account
          </h1>
          <p className="text-xs text-slate-500">
            Access your purchased code, seller dashboard, or business inquiries.
          </p>
        </div>

        {/* Informational Message Banner */}
        {serverMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{serverMessage}</span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Unconfirmed Email Action Box */}
        {unconfirmedEmail && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-xs text-amber-900">
            <p className="font-semibold">Haven&apos;t received your confirmation email?</p>
            <p className="text-amber-800 text-[11px]">
              Check your Spam/Junk folder, or click below to request a new verification link.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isResending}
              onClick={handleResend}
              className="w-full text-xs gap-1.5 border-amber-300 hover:bg-amber-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
              <span>{isResending ? "Sending..." : "Resend Verification Email"}</span>
            </Button>
            {resendStatus && (
              <p className="text-[11px] font-medium text-amber-950 mt-1">{resendStatus}</p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                placeholder="name@example.com"
                className="pl-9 h-10 text-sm"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-9 h-10 text-sm"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm font-semibold gap-1.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
