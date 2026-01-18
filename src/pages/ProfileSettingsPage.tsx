import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserPreferencesStore, THEMES, LANGUAGES, ThemeName, LanguageCode, applyTheme } from "@/stores/userPreferencesStore";
import { db } from "@/lib/db/database";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Check, Pencil, Sun, Moon, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { getPreferences, setTheme, setThemeVariant, setLanguage } = useUserPreferencesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const prefs = user ? getPreferences(user.id) : null;
  
  const [editName, setEditName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user && prefs) {
      applyTheme(prefs.theme, prefs.themeVariant);
    }
  }, [user, prefs?.theme, prefs?.themeVariant]);

  if (!user || !prefs) return null;

  const handleSaveName = () => {
    if (editName.trim() && editName !== user.name) {
      db.updateUser(user.id, { name: editName.trim() });
      toast({ title: "Name updated" });
    }
    setIsEditingName(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    db.updateUser(user.id, { avatarUrl: url });
    toast({ title: "Avatar updated" });
  };

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(user.id, theme);
    toast({ title: `Theme changed to ${THEMES[theme].name}` });
  };

  const handleVariantChange = (isDark: boolean) => {
    setThemeVariant(user.id, isDark ? "dark" : "light");
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(user.id, lang);
    toast({ title: `Language changed to ${LANGUAGES[lang].name}` });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your profile, appearance, and language preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                      {avatarPreview || user.avatarUrl ? (
                        <img 
                          src={avatarPreview || user.avatarUrl} 
                          alt={user.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div 
                          className="h-full w-full flex items-center justify-center text-2xl font-bold text-white"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">Click the button to upload a new avatar</p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      />
                      <Button onClick={handleSaveName}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditingName(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 border rounded-md bg-muted/50">{user.name}</div>
                      <Button variant="outline" size="icon" onClick={() => {
                        setEditName(user.name);
                        setIsEditingName(true);
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-2 border rounded-md bg-muted/50 text-muted-foreground">{user.email}</div>
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-sm font-medium",
                      user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Light/Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {prefs.themeVariant === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.themeVariant === "dark"}
                    onCheckedChange={handleVariantChange}
                  />
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(Object.entries(THEMES) as [ThemeName, typeof THEMES[ThemeName]][]).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => handleThemeChange(key)}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                          prefs.theme === key ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div 
                          className="h-8 w-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: theme.preview }}
                        />
                        <p className="text-xs font-medium text-center">{theme.name}</p>
                        {prefs.theme === key && (
                          <div className="absolute top-1 right-1">
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

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language for the interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(Object.entries(LANGUAGES) as [LanguageCode, typeof LANGUAGES[LanguageCode]][]).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                        prefs.language === code ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl block text-center mb-1">{lang.flag}</span>
                      <p className="text-xs font-medium text-center">{lang.nativeName}</p>
                      {prefs.language === code && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}