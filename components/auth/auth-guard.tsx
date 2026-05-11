"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getSupabaseSession } from "@/lib/api";
import { MfaChallenge } from "@/components/auth/mfa-challenge";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      setMfaRequired(false);

      if (!nextSession) {
        setIsLoading(false);
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsLoading(true);

      const { data, error } = await (supabase.auth.mfa as any)
        .getAuthenticatorAssuranceLevel();

      if (!active) return;

      if (error) {
        setIsLoading(false);
        return;
      }

      setMfaRequired(
        data?.nextLevel === "aal2" && data.nextLevel !== data.currentLevel,
      );
      setIsLoading(false);
    };

    getSupabaseSession().then((nextSession) => {
      checkSession(nextSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        checkSession(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (mfaRequired) {
    return (
      <MfaChallenge
        onVerified={() => setMfaRequired(false)}
        onCancel={async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        }}
        cancelLabel="Log out"
      />
    );
  }

  return <>{children}</>;
}
