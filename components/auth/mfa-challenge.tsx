"use client";

import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormMessage from "@/components/auth/form-message";
import { supabase } from "@/lib/supabase";

type MfaChallengeProps = {
  onVerified: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
};

export function MfaChallenge({
  onVerified,
  onCancel,
  cancelLabel = "Cancel",
}: MfaChallengeProps) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const loadFactor = async () => {
      setIsLoading(true);
      setMessage(null);

      const { data, error } = await (supabase.auth.mfa as any).listFactors();

      if (!active) {
        return;
      }

      if (error) {
        setMessage({ type: "error", text: error.message });
        setIsLoading(false);
        return;
      }

      const verifiedTotp = data?.totp?.find(
        (factor: any) => factor.status === "verified",
      );

      if (!verifiedTotp) {
        setMessage({
          type: "error",
          text: "No verified authenticator app was found for this account.",
        });
        setIsLoading(false);
        return;
      }

      setFactorId(verifiedTotp.id);
      setIsLoading(false);
    };

    loadFactor();

    return () => {
      active = false;
    };
  }, []);

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!factorId || !verificationCode.trim()) {
      setMessage({
        type: "error",
        text: "Enter the code from your authenticator app.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await (supabase.auth.mfa as any).challengeAndVerify({
      factorId,
      code: verificationCode.trim(),
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsLoading(false);
      return;
    }

    onVerified();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Two-factor authentication</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the six-digit code from your authenticator app to continue.
            </p>
          </div>
        </div>

        <form onSubmit={verifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-login-code">Verification code</Label>
            <Input
              id="mfa-login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              disabled={isLoading && !factorId}
            />
          </div>

          {message && <FormMessage type={message.type} message={message.text} />}

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isLoading && Boolean(factorId)}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !factorId}
            >
              {isLoading ? "Checking..." : "Verify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
