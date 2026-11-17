"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/auth/schemas";
import { signUpAction, resendVerificationEmailAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<{ message: string; email: string } | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signUpAction(values);
    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.requiresEmailConfirmation) {
      setSuccessInfo({
        message: result.message,
        email: result.email || values.email,
      });
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!successInfo?.email) return;
    setIsResending(true);
    setResendStatus(null);

    const result = await resendVerificationEmailAction(successInfo.email);
    if (result.error) {
      setResendStatus(`Error: ${result.error}`);
    } else {
      setResendStatus(result.message || "New confirmation email dispatched!");
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
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
            Create your account
          </h1>
          <p className="text-xs text-slate-500">
            Join the India-first digital marketplace for websites, code, and online businesses.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Registration Issue</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Confirmation Success Screen */}
        {successInfo ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-4 animate-in fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">Verify Your Email</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent an activation link to:
              </p>
              <p className="text-xs font-semibold text-emerald-900 bg-emerald-100/60 py-1 px-2 rounded inline-block">
                {successInfo.email}
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Click the link inside to activate your account. If you don&apos;t see it within a couple minutes, please check your Spam or Junk folder.
            </p>

            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isResending}
                onClick={handleResend}
                className="w-full text-xs gap-1.5 border-emerald-300 hover:bg-emerald-100 text-emerald-900"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Resending..." : "Resend Verification Email"}</span>
              </Button>
              {resendStatus && (
                <p className="text-[11px] font-medium text-emerald-900">{resendStatus}</p>
              )}

              <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="pl-9 h-10 text-sm"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-red-600 mt-1">{errors.fullName.message}</p>
              )}
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Repeat your password"
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
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
