"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
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
  Link2,
  Download,
  Trash2,
  Camera,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    savingsGoals: true,
    weeklyReport: true,
    transactionAlerts: false,
    marketUpdates: true,
    newsletter: false,
  });

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
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 py-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="connected" className="gap-2 py-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Connected</span>
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
                    <Select defaultValue="usd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                        setNotifications({ ...notifications, budgetAlerts: checked })
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
                        setNotifications({
                          ...notifications,
                          transactionAlerts: checked,
                        })
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
                      setNotifications({ ...notifications, savingsGoals: checked })
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
                        setNotifications({ ...notifications, weeklyReport: checked })
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
                        setNotifications({ ...notifications, marketUpdates: checked })
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
                        setNotifications({ ...notifications, newsletter: checked })
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

        {/* Connected Accounts Tab */}
        <TabsContent value="connected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage your connected bank accounts and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Chase Bank",
                  type: "Checking & Savings",
                  status: "connected",
                  lastSync: "2 hours ago",
                },
                {
                  name: "Ally Bank",
                  type: "Savings",
                  status: "connected",
                  lastSync: "1 day ago",
                },
                {
                  name: "Amex",
                  type: "Credit Card",
                  status: "connected",
                  lastSync: "3 hours ago",
                },
                {
                  name: "Fidelity",
                  type: "Investment",
                  status: "needs_attention",
                  lastSync: "7 days ago",
                },
              ].map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={
                          account.status === "connected" ? "default" : "destructive"
                        }
                        className={cn(
                          account.status === "connected" &&
                            "bg-success/10 text-success hover:bg-success/20"
                        )}
                      >
                        {account.status === "connected"
                          ? "Connected"
                          : "Needs Attention"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sync: {account.lastSync}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2 mt-4 bg-transparent">
                <Link2 className="h-4 w-4" />
                Connect New Account
              </Button>
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
