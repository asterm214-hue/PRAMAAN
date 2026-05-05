import { useState, useEffect } from "react";
import { apiJson } from "../lib/api";
import {
  User, Mail, Phone, Shield, Bell, Globe,
  Lock, AlertCircle, Save, Camera, CheckCircle2, LogOut, Flower2
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { motion, AnimatePresence } from "motion/react";

export function Profile() {
  const [formData, setFormData] = useState({
    name: "Anonymous User",
    email: "user@example.com",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    twoFactor: true,
    dataBackup: true,
  });

  const [language, setLanguage] = useState("english");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiJson<{ name: string; email: string }>("/api/auth/me");
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
        }));
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingToggle = (setting: string) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold mb-1">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and privacy preferences
          </p>
        </motion.div>

        {/* Profile Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <Card className="p-5 bg-gradient-to-r from-primary/10 to-secondary/20 border-primary/15">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/40 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{formData.name}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary">Account secured with 2FA</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 font-medium">Active</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Display Name (Optional)
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="rounded-xl mt-1.5 h-10 text-sm bg-input-background"
                  placeholder="You can remain anonymous"
                />
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Flower2 className="h-3 w-3 text-primary" />
                  You can remain completely anonymous if you prefer
                </p>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 rounded-xl h-10 text-sm bg-input-background"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Phone Number (Optional)
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 rounded-xl h-10 text-sm bg-input-background"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-5"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Emergency Contact
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              This person will not have access to your testimony. Used only for safety purposes.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact Name
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="rounded-xl mt-1.5 h-10 text-sm bg-input-background"
                  placeholder="Trusted person's name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  className="rounded-xl mt-1.5 h-10 text-sm bg-input-background"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-5"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Privacy & Security
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: "twoFactor",
                  label: "Two-Factor Authentication",
                  desc: "Add an extra layer of security to your account",
                  key: "twoFactor" as const,
                },
                {
                  id: "dataBackup",
                  label: "Automatic Encrypted Backup",
                  desc: "Securely backup your testimony data automatically",
                  key: "dataBackup" as const,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <Label htmlFor={item.id} className="cursor-pointer text-sm font-medium">
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={settings[item.key]}
                    onCheckedChange={() => handleSettingToggle(item.key)}
                  />
                </div>
              ))}

              <Separator />

              <Button variant="outline" className="w-full rounded-xl h-9 text-sm border-primary/20 text-primary hover:bg-primary/5">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-5"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: "notifications",
                  label: "Push Notifications",
                  desc: "Receive notifications about your testimony progress",
                  key: "notifications" as const,
                },
                {
                  id: "emailAlerts",
                  label: "Email Alerts",
                  desc: "Get email updates when someone views your shared content",
                  key: "emailAlerts" as const,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <Label htmlFor={item.id} className="cursor-pointer text-sm font-medium">
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={settings[item.key]}
                    onCheckedChange={() => handleSettingToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-5"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Language & Region
            </h3>
            <div>
              <Label htmlFor="language" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Preferred Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="rounded-xl mt-1.5 h-10 text-sm bg-input-background">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="english">🇺🇸 English</SelectItem>
                  <SelectItem value="spanish">🇪🇸 Español</SelectItem>
                  <SelectItem value="french">🇫🇷 Français</SelectItem>
                  <SelectItem value="hindi">🇮🇳 हिंदी</SelectItem>
                  <SelectItem value="mandarin">🇨🇳 普通话</SelectItem>
                  <SelectItem value="arabic">🇸🇦 العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-5"
        >
          <AnimatePresence mode="wait">
            {savedSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Settings saved successfully!</span>
              </motion.div>
            ) : (
              <motion.div key="button">
                <Button size="lg" className="w-full rounded-2xl shadow-md shadow-primary/20 text-base" onClick={handleSave}>
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Log Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="mb-5"
        >
          <Button variant="outline" size="lg" className="w-full rounded-2xl text-base border-border text-muted-foreground hover:text-destructive hover:border-destructive/30">
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <Card className="p-5 border-destructive/15">
            <h3 className="font-semibold text-sm text-destructive mb-1">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-4">
              These actions are irreversible. Please proceed with extreme caution.
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full rounded-xl h-9 text-sm border-destructive/30 text-destructive hover:bg-destructive/8"
              >
                Export All My Data
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-9 text-sm border-destructive/30 text-destructive hover:bg-destructive/8"
              >
                Delete Account Permanently
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
