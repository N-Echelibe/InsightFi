"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { getSupabaseSession } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function TopNav() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{
    fullName: string;
    avatarUrl: string;
  }>({
    fullName: "",
    avatarUrl: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    const applyProfile = async (nextUser: SupabaseUser | null) => {
      if (!active) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile({ fullName: "", avatarUrl: "" });
        return;
      }

      const metadata = nextUser.user_metadata ?? {};
      const profileResponse = await supabase
        .from("profiles")
        .select("full_name, first_name, last_name, avatar_url")
        .eq("user_id", nextUser.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      const profileData = profileResponse.data;
      const firstName = profileData?.first_name ?? metadata.first_name ?? metadata.given_name ?? "";
      const lastName = profileData?.last_name ?? metadata.last_name ?? metadata.family_name ?? "";
      const fullName =
        profileData?.full_name ??
        metadata.full_name ??
        `${firstName} ${lastName}`.trim();

      setProfile({
        fullName,
        avatarUrl: profileData?.avatar_url ?? metadata.avatar_url ?? "",
      });
    };

    const loadProfile = async () => {
      const session = await getSupabaseSession();
      await applyProfile(session?.user ?? null);
    };

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        applyProfile(nextSession?.user ?? null);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const displayName = profile.fullName || user?.email || "User";
  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarFallback = (
    <AvatarFallback className="bg-primary text-primary-foreground">
      {initials || <User className="h-4 w-4" />}
    </AvatarFallback>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    router.push(query ? `/transactions?search=${encodeURIComponent(query)}` : "/transactions");
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-[300px] pl-9 bg-muted/50"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => router.push("/transactions")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {profile.avatarUrl && (
                    <AvatarImage src={profile.avatarUrl} alt={displayName} />
                  )}
                  {avatarFallback}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  {profile.avatarUrl && (
                    <AvatarImage src={profile.avatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials || <User className="h-3.5 w-3.5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
