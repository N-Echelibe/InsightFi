"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/states";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellRing,
  Briefcase,
  Bus,
  Camera,
  Car,
  Check,
  CreditCard,
  Download,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  Plus,
  Receipt,
  Shield,
  ShoppingBag,
  Tag,
  Trash2,
  User,
  Utensils,
  Wallet,
  Wifi,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Account = {
  id: string | number;
  name: string;
  type: string;
  currency?: string;
  balance?: number | string;
};

type CategoryRecord = {
  id: string;
  name: string;
  type?: "income" | "expense" | "transfer" | string;
  icon?: string;
  color?: string;
  user_id?: string | null;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  avatarUrl: string;
  dateFormat: string;
};

const emptyProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  university: "",
  avatarUrl: "",
  dateFormat: "mdy",
};

const currencies = ["NGN", "USD", "EUR", "GBP", "JPY"];

const categoryIconOptions: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  keywords: string[];
}> = [
  {
    value: "utensils",
    label: "Food",
    icon: Utensils,
    color: "bg-orange-100 text-orange-700",
    keywords: ["food", "dining", "meal", "restaurant", "grocer"],
  },
  {
    value: "car",
    label: "Transport",
    icon: Car,
    color: "bg-blue-100 text-blue-700",
    keywords: ["transport", "car", "ride", "taxi", "fuel", "uber"],
  },
  {
    value: "bus",
    label: "Transit",
    icon: Bus,
    color: "bg-cyan-100 text-cyan-700",
    keywords: ["bus", "train", "commute", "transit"],
  },
  {
    value: "shopping-bag",
    label: "Shopping",
    icon: ShoppingBag,
    color: "bg-pink-100 text-pink-700",
    keywords: ["shopping", "clothes", "retail", "store"],
  },
  {
    value: "home",
    label: "Home",
    icon: Home,
    color: "bg-violet-100 text-violet-700",
    keywords: ["home", "rent", "housing", "apartment"],
  },
  {
    value: "wifi",
    label: "Bills",
    icon: Wifi,
    color: "bg-sky-100 text-sky-700",
    keywords: ["bill", "utility", "internet", "subscription", "wifi"],
  },
  {
    value: "wallet",
    label: "Income",
    icon: Wallet,
    color: "bg-success/10 text-success",
    keywords: ["income", "salary", "pay", "allowance"],
  },
  {
    value: "briefcase",
    label: "Work",
    icon: Briefcase,
    color: "bg-emerald-100 text-emerald-700",
    keywords: ["work", "business", "office", "client"],
  },
  {
    value: "laptop",
    label: "Freelance",
    icon: Laptop,
    color: "bg-indigo-100 text-indigo-700",
    keywords: ["freelance", "software", "tech", "laptop"],
  },
  {
    value: "graduation-cap",
    label: "School",
    icon: GraduationCap,
    color: "bg-amber-100 text-amber-700",
    keywords: ["school", "tuition", "education", "university", "book"],
  },
  {
    value: "heart",
    label: "Health",
    icon: Heart,
    color: "bg-rose-100 text-rose-700",
    keywords: ["health", "medical", "doctor", "care"],
  },
  {
    value: "gamepad-2",
    label: "Fun",
    icon: Gamepad2,
    color: "bg-fuchsia-100 text-fuchsia-700",
    keywords: ["fun", "game", "movie", "entertainment"],
  },
  {
    value: "receipt",
    label: "General",
    icon: Receipt,
    color: "bg-muted text-muted-foreground",
    keywords: ["misc", "general", "other", "receipt"],
  },
  {
    value: "tag",
    label: "Custom",
    icon: Tag,
    color: "bg-primary/10 text-primary",
    keywords: ["tag", "custom"],
  },
];

const notificationsToApi = (next: NotificationsState) => ({
  budget_alerts: next.budgetAlerts,
  savings_goals: next.savingsGoals,
  weekly_report: next.weeklyReport,
  transaction_alerts: next.transactionAlerts,
  market_updates: next.marketUpdates,
  newsletter: next.newsletter,
});

type NotificationsState = {
  budgetAlerts: boolean;
  savingsGoals: boolean;
  weeklyReport: boolean;
  transactionAlerts: boolean;
  marketUpdates: boolean;
  newsletter: boolean;
};

const defaultNotifications: NotificationsState = {
  budgetAlerts: true,
  savingsGoals: true,
  weeklyReport: true,
  transactionAlerts: false,
  marketUpdates: false,
  newsletter: false,
};

const resolveCategoryIcon = (iconName?: string) => {
  if (!iconName) {
    return Tag;
  }

  const normalized = iconName
    .trim()
    .replace(/[-_ ]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;

  return icons[normalized] || Tag;
};

const getRecommendedCategoryOption = (name: string, type: string) => {
  const normalized = name.trim().toLowerCase();

  if (!normalized && type === "income") {
    return categoryIconOptions.find((option) => option.value === "wallet")!;
  }

  return (
    categoryIconOptions.find((option) =>
      option.keywords.some((keyword) => normalized.includes(keyword)),
    ) ??
    categoryIconOptions.find((option) => option.value === "tag")!
  );
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [notifications, setNotifications] =
    useState<NotificationsState>(defaultNotifications);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] =
    useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("cash");
  const [newAccountCurrency, setNewAccountCurrency] = useState("NGN");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [newCategoryIcon, setNewCategoryIcon] = useState("tag");
  const [categoryIconLocked, setCategoryIconLocked] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mfa, setMfa] = useState<{
    enabled: boolean;
    factorId: string | null;
    qrCode: string | null;
    verificationCode: string;
    loading: boolean;
  }>({
    enabled: false,
    factorId: null,
    qrCode: null,
    verificationCode: "",
    loading: false,
  });

  const profileInitials = useMemo(() => {
    const first = profileForm.firstName.charAt(0);
    const last = profileForm.lastName.charAt(0);
    return `${first}${last}`.trim().toUpperCase() || "IF";
  }, [profileForm.firstName, profileForm.lastName]);

  const recommendedCategory = useMemo(
    () => getRecommendedCategoryOption(newCategory, newCategoryType),
    [newCategory, newCategoryType],
  );

  useEffect(() => {
    if (!categoryIconLocked) {
      setNewCategoryIcon(recommendedCategory.value);
    }
  }, [categoryIconLocked, recommendedCategory.value]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
      setBrowserNotificationsEnabled(false);
      return;
    }

    setBrowserPermission(Notification.permission);
    setBrowserNotificationsEnabled(
      Notification.permission === "granted" &&
        window.localStorage.getItem("insightfi-browser-notifications") === "true",
    );
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setHasError(false);
        setIsLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error("You need to sign in first.");
        }

        setCurrentUserId(user.id);
        setAuthEmail(user.email ?? "");

        const [
          profileResponse,
          preferencesResponse,
          accountsResponse,
          categoriesResponse,
          notificationsResponse,
          mfaResponse,
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
          supabase
            .from("user_preferences")
            .select("date_format")
            .eq("user_id", user.id)
            .maybeSingle(),
          api.get<{ accounts: Account[]; data?: Account[] }>("/accounts"),
          api.get<{ categories: CategoryRecord[] }>("/categories"),
          api.get<{ notifications: any }>("/settings/notifications"),
          (supabase.auth.mfa as any).listFactors(),
        ]);

        if (profileResponse.error) {
          throw new Error(profileResponse.error.message);
        }

        if (preferencesResponse.error) {
          throw new Error(preferencesResponse.error.message);
        }

        const profile = profileResponse.data;
        const metadata = user.user_metadata ?? {};

        setProfileForm({
          firstName:
            profile?.first_name ?? metadata.first_name ?? metadata.given_name ?? "",
          lastName:
            profile?.last_name ?? metadata.last_name ?? metadata.family_name ?? "",
          email: profile?.email ?? user.email ?? "",
          university: profile?.university ?? metadata.university ?? "",
          avatarUrl: profile?.avatar_url ?? metadata.avatar_url ?? "",
          dateFormat: preferencesResponse.data?.date_format ?? "mdy",
        });

        setAccounts(accountsResponse.accounts ?? accountsResponse.data ?? []);
        setCategoryRecords(categoriesResponse.categories ?? []);

        const nextNotifications = notificationsResponse.notifications ?? {};
        setNotifications({
          budgetAlerts: Boolean(
            nextNotifications.budget_alerts ?? defaultNotifications.budgetAlerts,
          ),
          savingsGoals: Boolean(
            nextNotifications.savings_goals ?? defaultNotifications.savingsGoals,
          ),
          weeklyReport: Boolean(
            nextNotifications.weekly_report ?? defaultNotifications.weeklyReport,
          ),
          transactionAlerts: Boolean(nextNotifications.transaction_alerts),
          marketUpdates: Boolean(nextNotifications.market_updates),
          newsletter: Boolean(nextNotifications.newsletter),
        });

        const verifiedFactor = mfaResponse?.data?.totp?.find(
          (factor: any) => factor.status === "verified",
        );
        setMfa((current) => ({
          ...current,
          enabled: Boolean(verifiedFactor),
          factorId: verifiedFactor?.id ?? null,
          qrCode: null,
          verificationCode: "",
        }));
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [reloadTick]);

  const updateProfileField = (key: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [key]: value }));
    setProfileMessage(null);
  };

  const saveProfile = async () => {
    if (!currentUserId) {
      return;
    }

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const email = profileForm.email.trim();
    const university = profileForm.university.trim();
    const avatarUrl = profileForm.avatarUrl.trim();

    if (!firstName || !lastName || !email) {
      setProfileMessage({
        type: "error",
        text: "First name, last name, and email are required.",
      });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const fullName = `${firstName} ${lastName}`.trim();

      if (email !== authEmail) {
        const { error } = await supabase.auth.updateUser({ email });

        if (error) {
          throw new Error(error.message);
        }
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          university,
          avatar_url: avatarUrl || null,
        },
      });

      if (metadataError) {
        throw new Error(metadataError.message);
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: currentUserId,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          email,
          university: university || null,
          avatar_url: avatarUrl || null,
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        throw new Error(profileError.message);
      }

      const { error: preferencesError } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: currentUserId,
            date_format: profileForm.dateFormat,
          },
          { onConflict: "user_id" },
        );

      if (preferencesError) {
        throw new Error(preferencesError.message);
      }

      setAuthEmail(email);
      setProfileMessage({
        type: "success",
        text:
          email === authEmail
            ? "Profile updated."
            : "Profile updated. Check your email to confirm the address change.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updateNotifications = async (
    key: keyof NotificationsState,
    checked: boolean,
  ) => {
    const previous = notifications;
    const next = { ...notifications, [key]: checked };
    setNotifications(next);
    setNotificationMessage(null);

    try {
      await api.patch("/settings/notifications", notificationsToApi(next));
    } catch (error) {
      setNotifications(previous);
      setNotificationMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not update notification settings.",
      });
    }
  };

  const updateBrowserNotifications = async (checked: boolean) => {
    setNotificationMessage(null);

    if (typeof window === "undefined" || !("Notification" in window)) {
      setBrowserPermission("unsupported");
      setBrowserNotificationsEnabled(false);
      setNotificationMessage({
        type: "error",
        text: "This browser does not support desktop notifications.",
      });
      return;
    }

    if (!checked) {
      window.localStorage.setItem("insightfi-browser-notifications", "false");
      setBrowserNotificationsEnabled(false);
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    setBrowserPermission(permission);

    if (permission !== "granted") {
      window.localStorage.setItem("insightfi-browser-notifications", "false");
      setBrowserNotificationsEnabled(false);
      setNotificationMessage({
        type: "error",
        text:
          permission === "denied"
            ? "Browser notifications are blocked in your browser settings."
            : "Browser notifications were not enabled.",
      });
      return;
    }

    window.localStorage.setItem("insightfi-browser-notifications", "true");
    setBrowserNotificationsEnabled(true);

    try {
      new Notification("InsightFi notifications enabled", {
        body: "You will receive browser alerts while InsightFi is open.",
        icon: "/icon-light-32x32.png",
      });
    } catch {
      setNotificationMessage({
        type: "success",
        text: "Browser notifications are enabled.",
      });
    }
  };

  const addAccount = async () => {
    const name = newAccountName.trim();
    const parsedBalance = newAccountBalance.trim()
      ? Number(newAccountBalance)
      : 0;

    if (!name) {
      setAccountMessage({ type: "error", text: "Enter an account name." });
      return;
    }

    if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
      setAccountMessage({
        type: "error",
        text: "Starting amount must be zero or higher.",
      });
      return;
    }

    setIsAddingAccount(true);
    setAccountMessage(null);

    try {
      const response = await api.post<{ account: Account }>("/accounts", {
        name,
        type: newAccountType,
        currency: newAccountCurrency,
        balance: parsedBalance,
      });
      setAccounts((current) => [response.account, ...current]);
      setNewAccountName("");
      setNewAccountType("cash");
      setNewAccountCurrency("NGN");
      setNewAccountBalance("");
      setAccountMessage({ type: "success", text: "Account created." });
    } catch (error) {
      setAccountMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not create account.",
      });
    } finally {
      setIsAddingAccount(false);
    }
  };

  const deleteAccount = async (id: string | number) => {
    const confirmed = window.confirm(
      "Delete this account? Transactions attached to it may prevent deletion.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/accounts/${id}`);
      setAccounts((current) => current.filter((account) => account.id !== id));
      setAccountMessage({ type: "success", text: "Account deleted." });
    } catch (error) {
      setAccountMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete account.",
      });
    }
  };

  const addCategory = async () => {
    const name = newCategory.trim();
    const duplicate = categoryRecords.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.type === newCategoryType,
    );

    if (!name) {
      setCategoryMessage({ type: "error", text: "Enter a category name." });
      return;
    }

    if (duplicate) {
      setCategoryMessage({
        type: "error",
        text: "That category already exists for this type.",
      });
      return;
    }

    const selectedOption =
      categoryIconOptions.find((option) => option.value === newCategoryIcon) ??
      recommendedCategory;

    setIsAddingCategory(true);
    setCategoryMessage(null);

    try {
      const response = await api.post<{ category: CategoryRecord }>("/categories", {
        name,
        type: newCategoryType,
        icon: selectedOption.value,
        color: selectedOption.color,
      });
      setCategoryRecords((current) => [...current, response.category]);
      setNewCategory("");
      setNewCategoryType("expense");
      setNewCategoryIcon("tag");
      setCategoryIconLocked(false);
      setCategoryMessage({ type: "success", text: "Category created." });
    } catch (error) {
      setCategoryMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not create category.",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const deleteCategory = async (category: CategoryRecord) => {
    const confirmed = window.confirm(`Delete ${category.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/categories/${category.id}`);
      setCategoryRecords((current) =>
        current.filter((item) => item.id !== category.id),
      );
      setCategoryMessage({ type: "success", text: "Category deleted." });
    } catch (error) {
      setCategoryMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not delete category.",
      });
    }
  };

  const updatePassword = async () => {
    if (!authEmail || !securityForm.currentPassword) {
      setSecurityMessage({
        type: "error",
        text: "Enter your current password before changing it.",
      });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setSecurityMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setSecurityMessage(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: securityForm.currentPassword,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const { error } = await supabase.auth.updateUser({
        password: securityForm.newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecurityMessage({ type: "success", text: "Password updated." });
    } catch (error) {
      setSecurityMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not update password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const startMfaEnrollment = async (checked: boolean) => {
    setSecurityMessage(null);

    if (!checked) {
      if (!mfa.factorId) {
        setMfa((current) => ({ ...current, enabled: false }));
        return;
      }

      const confirmed = window.confirm("Disable two-factor authentication?");

      if (!confirmed) {
        return;
      }

      setMfa((current) => ({ ...current, loading: true }));

      try {
        const { error } = await (supabase.auth.mfa as any).unenroll({
          factorId: mfa.factorId,
        });

        if (error) {
          throw new Error(error.message);
        }

        setMfa({
          enabled: false,
          factorId: null,
          qrCode: null,
          verificationCode: "",
          loading: false,
        });
        setSecurityMessage({ type: "success", text: "2FA disabled." });
      } catch (error) {
        setMfa((current) => ({ ...current, loading: false }));
        setSecurityMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Could not disable 2FA.",
        });
      }
      return;
    }

    setMfa((current) => ({ ...current, loading: true }));

    try {
      const { data, error } = await (supabase.auth.mfa as any).enroll({
        factorType: "totp",
        friendlyName: "InsightFi",
      });

      if (error) {
        throw new Error(error.message);
      }

      setMfa({
        enabled: false,
        factorId: data.id,
        qrCode: data.totp?.qr_code ?? null,
        verificationCode: "",
        loading: false,
      });
    } catch (error) {
      setMfa((current) => ({ ...current, loading: false }));
      setSecurityMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not start 2FA setup.",
      });
    }
  };

  const verifyMfa = async () => {
    if (!mfa.factorId || !mfa.verificationCode.trim()) {
      setSecurityMessage({
        type: "error",
        text: "Enter the code from your authenticator app.",
      });
      return;
    }

    setMfa((current) => ({ ...current, loading: true }));
    setSecurityMessage(null);

    try {
      const { error } = await (supabase.auth.mfa as any).challengeAndVerify({
        factorId: mfa.factorId,
        code: mfa.verificationCode.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      setMfa((current) => ({
        ...current,
        enabled: true,
        qrCode: null,
        verificationCode: "",
        loading: false,
      }));
      setSecurityMessage({ type: "success", text: "2FA enabled." });
    } catch (error) {
      setMfa((current) => ({ ...current, loading: false }));
      setSecurityMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not verify 2FA.",
      });
    }
  };

  const downloadMyData = async () => {
    if (!currentUserId) {
      return;
    }

    setIsDownloadingData(true);
    setSecurityMessage(null);

    try {
      const tables = [
        "profiles",
        "user_preferences",
        "notification_preferences",
        "accounts",
        "categories",
        "transactions",
        "budgets",
        "savings_buckets",
      ];

      const responses = await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq("user_id", currentUserId);

          if (error) {
            throw new Error(`${table}: ${error.message}`);
          }

          return [table, data] as const;
        }),
      );

      const payload = Object.fromEntries(responses);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "insightfi-data.json";
      link.click();
      URL.revokeObjectURL(url);
      setSecurityMessage({ type: "success", text: "Your data export is ready." });
    } catch (error) {
      setSecurityMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not export data.",
      });
    } finally {
      setIsDownloadingData(false);
    }
  };

  const deleteMyAccount = async () => {
    const confirmed = window.confirm(
      "Delete your InsightFi account? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setSecurityMessage(null);

    try {
      await api.delete("/settings/account");
      await supabase.auth.signOut();
      window.location.assign("/login");
    } catch (error) {
      setSecurityMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not delete your account.",
      });
    }
  };

  const messageClass = (type: "success" | "error") =>
    cn("text-sm", type === "success" ? "text-success" : "text-destructive");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-36 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
        </div>

        <div className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-muted p-1 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 rounded-sm bg-background/60" />
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-44 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-9 w-32 rounded-md bg-muted" />
                <div className="h-3 w-44 rounded-md bg-muted" />
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-24 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
        <ErrorState
          title="Failed to load settings"
          description="We couldn't load your settings. Please try again."
          onRetry={() => setReloadTick((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="gap-2 py-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2 py-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 py-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update the details used across your InsightFi account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileForm.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                    {profileInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="avatarUrl">Profile photo URL</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="avatarUrl"
                      value={profileForm.avatarUrl}
                      onChange={(event) =>
                        updateProfileField("avatarUrl", event.target.value)
                      }
                      placeholder="https://example.com/photo.jpg"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      updateProfileField("firstName", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      updateProfileField("lastName", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      updateProfileField("email", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={profileForm.university}
                    onChange={(event) =>
                      updateProfileField("university", event.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-2 md:max-w-sm">
                <Label>Date Format</Label>
                <Select
                  value={profileForm.dateFormat}
                  onValueChange={(value) => updateProfileField("dateFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profileMessage && (
                <p className={messageClass(profileMessage.type)}>
                  {profileMessage.text}
                </p>
              )}

              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Accounts</CardTitle>
              <CardDescription>
                Create accounts with their own currency and starting amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Account</h4>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_140px_180px_auto]">
                  <Input
                    placeholder="Account name"
                    value={newAccountName}
                    onChange={(event) => setNewAccountName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && addAccount()}
                  />
                  <Select value={newAccountType} onValueChange={setNewAccountType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newAccountCurrency}
                    onValueChange={setNewAccountCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Starting amount"
                    value={newAccountBalance}
                    onChange={(event) => setNewAccountBalance(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && addAccount()}
                  />
                  <Button
                    onClick={addAccount}
                    disabled={isAddingAccount}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingAccount ? "Adding..." : "Add"}
                  </Button>
                </div>
                {accountMessage && (
                  <p className={messageClass(accountMessage.type)}>
                    {accountMessage.text}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Your Accounts</h4>
                <div className="grid gap-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{account.name}</p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {account.type} account
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{account.currency ?? "NGN"}</Badge>
                        {account.balance !== undefined && (
                          <span className="hidden text-sm text-muted-foreground sm:inline">
                            {Number(account.balance).toLocaleString()}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAccount(account.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${account.name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Add categories with icons that make transactions easier to scan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Category</h4>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
                  <Input
                    placeholder="Category name"
                    value={newCategory}
                    onChange={(event) => {
                      setNewCategory(event.target.value);
                      setCategoryIconLocked(false);
                    }}
                    onKeyDown={(event) => event.key === "Enter" && addCategory()}
                  />
                  <Select
                    value={newCategoryType}
                    onValueChange={(value) => {
                      setNewCategoryType(value);
                      setCategoryIconLocked(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addCategory}
                    disabled={isAddingCategory}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingCategory ? "Adding..." : "Add"}
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">Icon</p>
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Recommended: {recommendedCategory.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {categoryIconOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = newCategoryIcon === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setNewCategoryIcon(option.value);
                            setCategoryIconLocked(true);
                          }}
                          className={cn(
                            "flex h-16 flex-col items-center justify-center gap-1 rounded-md border text-xs transition-colors hover:bg-muted",
                            selected && "border-primary bg-primary/5 text-primary",
                          )}
                          aria-label={`Use ${option.label} icon`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="max-w-full truncate px-1">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {categoryMessage && (
                  <p className={messageClass(categoryMessage.type)}>
                    {categoryMessage.text}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Your Categories</h4>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {categoryRecords.map((category) => {
                    const Icon = resolveCategoryIcon(category.icon);
                    const option =
                      categoryIconOptions.find(
                        (item) => item.value === category.icon,
                      ) ?? categoryIconOptions.at(-1)!;
                    const canDelete =
                      category.user_id === undefined ||
                      category.user_id === currentUserId;

                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between gap-3 rounded-lg border p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                              category.color || option.color,
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{category.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize">
                                {category.type ?? "expense"}
                              </Badge>
                              {category.user_id === null && (
                                <span className="text-xs text-muted-foreground">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCategory(category)}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete ${category.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what InsightFi should alert you about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <BellRing className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Browser Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Show desktop alerts while InsightFi is open
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Permission: {browserPermission}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={browserNotificationsEnabled}
                    disabled={browserPermission === "unsupported"}
                    onCheckedChange={updateBrowserNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Budget & Spending</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Budget Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you approach budget limits
                      </p>
                    </div>
                    <Switch
                      checked={notifications.budgetAlerts}
                      onCheckedChange={(checked) =>
                        updateNotifications("budgetAlerts", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Transaction Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notify me of large or unusual transactions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.transactionAlerts}
                      onCheckedChange={(checked) =>
                        updateNotifications("transactionAlerts", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Savings & Goals</h4>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">Savings Goals</p>
                    <p className="text-sm text-muted-foreground">
                      Updates on your savings goal progress
                    </p>
                  </div>
                  <Switch
                    checked={notifications.savingsGoals}
                    onCheckedChange={(checked) =>
                      updateNotifications("savingsGoals", checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Reports & Updates</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your finances
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) =>
                        updateNotifications("weeklyReport", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Market Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Investment and market news
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketUpdates}
                      onCheckedChange={(checked) =>
                        updateNotifications("marketUpdates", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Newsletter</p>
                      <p className="text-sm text-muted-foreground">
                        Financial tips and product updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newsletter}
                      onCheckedChange={(checked) =>
                        updateNotifications("newsletter", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {notificationMessage && (
                <p className={messageClass(notificationMessage.type)}>
                  {notificationMessage.text}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage password, 2FA, exports, and account access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Password</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(event) =>
                        setSecurityForm((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(event) =>
                        setSecurityForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(event) =>
                        setSecurityForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={updatePassword} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with a verification code
                    </p>
                  </div>
                  <Switch
                    checked={mfa.enabled || Boolean(mfa.qrCode)}
                    disabled={mfa.loading}
                    onCheckedChange={startMfaEnrollment}
                  />
                </div>

                {mfa.qrCode && (
                  <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-[160px_1fr]">
                    <img
                      src={mfa.qrCode}
                      alt="Authenticator QR code"
                      className="h-40 w-40 rounded-md border bg-white p-2"
                    />
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="mfaCode">Verification Code</Label>
                        <Input
                          id="mfaCode"
                          inputMode="numeric"
                          value={mfa.verificationCode}
                          onChange={(event) =>
                            setMfa((current) => ({
                              ...current,
                              verificationCode: event.target.value,
                            }))
                          }
                          placeholder="123456"
                        />
                      </div>
                      <Button onClick={verifyMfa} disabled={mfa.loading}>
                        {mfa.loading ? "Verifying..." : "Verify 2FA"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data & Privacy</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-transparent"
                    onClick={downloadMyData}
                    disabled={isDownloadingData}
                  >
                    <Download className="h-4 w-4" />
                    {isDownloadingData ? "Preparing Export..." : "Download My Data"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-transparent text-destructive hover:text-destructive"
                    onClick={deleteMyAccount}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>

              {securityMessage && (
                <p className={messageClass(securityMessage.type)}>
                  {securityMessage.text}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
