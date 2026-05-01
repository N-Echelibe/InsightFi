"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ErrorState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Download,
  Trash2,
  Camera,
  Sun,
  Moon,
  Monitor,
  Check,
  Tag,
  Plus,
  Edit,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Account = {
  id: string | number;
  name: string;
  type: string;
};

type CategoryRecord = {
  id: string;
  name: string;
  type?: string;
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setHasError(false);
        setIsLoading(true);

        const [accountsResponse, categoriesResponse, notificationsResponse] =
          await Promise.all([
            api.get<{ accounts: Account[]; data?: Account[] }>("/accounts"),
            api.get<{ categories: CategoryRecord[] }>("/categories"),
            api.get<{ notifications: any }>("/settings/notifications"),
          ]);

        setAccounts(accountsResponse.accounts ?? accountsResponse.data ?? []);
        setCategoryRecords(categoriesResponse.categories);
        setCategories(categoriesResponse.categories.map((category) => category.name));
        const nextNotifications = notificationsResponse.notifications;
        setNotifications({
          budgetAlerts: Boolean(nextNotifications.budget_alerts),
          savingsGoals: Boolean(nextNotifications.savings_goals),
          weeklyReport: Boolean(nextNotifications.weekly_report),
          transactionAlerts: Boolean(nextNotifications.transaction_alerts),
          marketUpdates: Boolean(nextNotifications.market_updates),
          newsletter: Boolean(nextNotifications.newsletter),
        });
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    savingsGoals: true,
    weeklyReport: true,
    transactionAlerts: false,
    marketUpdates: true,
    newsletter: false,
  });

  const updateNotifications = async (
    key: keyof typeof notifications,
    checked: boolean,
  ) => {
    const next = { ...notifications, [key]: checked };
    setNotifications(next);
    await api.patch("/settings/notifications", {
      budget_alerts: next.budgetAlerts,
      savings_goals: next.savingsGoals,
      weekly_report: next.weeklyReport,
      transaction_alerts: next.transactionAlerts,
      market_updates: next.marketUpdates,
      newsletter: next.newsletter,
    });
  };
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: "Cash", type: "cash" },
    { id: 2, name: "Savings Account", type: "savings" },
    { id: 3, name: "Current Account", type: "current" },
  ]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("cash");
  
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [categories, setCategories] = useState([
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Housing",
    "Subscriptions",
    "Income",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const addAccount = async () => {
    if (newAccountName.trim()) {
      const response = await api.post<{ account: Account }>("/accounts", {
        name: newAccountName.trim(),
        type: newAccountType,
        currency: "NGN",
        balance: 0,
      });
      setAccounts([response.account, ...accounts]);
      setNewAccountName("");
      setNewAccountType("cash");
    }
  };

  const deleteAccount = async (id: string | number) => {
    await api.delete(`/accounts/${id}`);
    setAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const addCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      const response = await api.post<{ category: CategoryRecord }>("/categories", {
        name: newCategory.trim(),
        type: "expense",
      });
      setCategoryRecords([...categoryRecords, response.category]);
      setCategories([...categories, response.category.name]);
      setNewCategory("");
    }
  };

  const deleteCategory = async (category: string) => {
    const record = categoryRecords.find((item) => item.name === category);
    if (record?.id) {
      await api.delete(`/categories/${record.id}`);
    }
    setCategoryRecords(categoryRecords.filter((item) => item.name !== category));
    setCategories(categories.filter((c) => c !== category));
  };

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

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <div className="h-5 w-28 rounded-md bg-muted" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="h-10 w-32 rounded-md bg-muted" />
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
          description="We couldn&apos;t load your settings. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="ngn">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngn">NGN (₦)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (&euro;)</SelectItem>
                        <SelectItem value="gbp">GBP (&pound;)</SelectItem>
                        <SelectItem value="jpy">JPY (&yen;)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mdy">
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
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Budget & Spending</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted",
                        theme === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      <option.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                      {theme === option.value && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Accounts</CardTitle>
              <CardDescription>
                Create and manage your bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Account */}
              <div className="space-y-4">
                <h4 className="font-medium">Add New Account</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Account name (e.g., My Savings)"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAccount()}
                  />
                  <Select value={newAccountType} onValueChange={setNewAccountType}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addAccount} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Accounts List */}
              <div className="space-y-3">
                <h4 className="font-medium">Your Accounts</h4>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {account.type} Account
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAccount(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Create and organize transaction categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Category */}
              <div className="space-y-4">
                <h4 className="font-medium">Add New Category</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Category name (e.g., Groceries)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCategory()}
                  />
                  <Button onClick={addCategory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Categories List */}
              <div className="space-y-2">
                <h4 className="font-medium">Your Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category} variant="secondary" className="gap-2 py-1.5">
                      {category}
                      <button
                        onClick={() => deleteCategory(category)}
                        className="hover:bg-background/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Password</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data & Privacy</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
