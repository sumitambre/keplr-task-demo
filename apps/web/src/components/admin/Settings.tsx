import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Switch } from "@repo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { ThemeToggle } from "@repo/ui";
import { Textarea } from "@repo/ui";
import { Slider } from "@repo/ui";
import { Badge } from "@repo/ui";
import { RadioGroup, RadioGroupItem } from "@repo/ui";
import { cn } from "@repo/ui";
import { Upload, Palette, Globe, Shield, Bell, MoonStar, Type } from "lucide-react";
import { useUserPrefs, type TextSize } from "../../context/user-prefs";

export function Settings() {
  const [tenantSettings, setTenantSettings] = useState({
    name: 'TechService Pro',
    logo: null,
    primaryColor: '#030213'
  });

  const [localizationSettings, setLocalizationSettings] = useState({
    language: 'EN',
    rtlDefault: false,
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    webPush: true,
    email: true,
    whatsapp: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionLength: 8,
    auditLogRetention: 90
  });

  const { textSize, setTextSize } = useUserPrefs();

  const textSizeTokens = useMemo(
    () => ({
      normal: {
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        lineHeightSm: 1.45,
        lineHeightBase: 1.5,
      },
      large: {
        sm: "1rem",
        base: "1.125rem",
        lg: "1.25rem",
        lineHeightSm: 1.5,
        lineHeightBase: 1.55,
      },
      xlarge: {
        sm: "1.0625rem",
        base: "1.25rem",
        lg: "1.375rem",
        lineHeightSm: 1.55,
        lineHeightBase: 1.6,
      },
    } satisfies Record<TextSize, {
      sm: string;
      base: string;
      lg: string;
      lineHeightSm: number;
      lineHeightBase: number;
    }>),
    [],
  );

  const textSizeOptions = useMemo(
    () => [
      {
        value: "normal" as TextSize,
        label: "Normal",
        description: "Default sizing tuned for quick scanning and data density.",
        badge: "Base",
      },
      {
        value: "large" as TextSize,
        label: "Large",
        description: "Adds breathing room for longer sessions and shared screens.",
        badge: "+12%",
      },
      {
        value: "xlarge" as TextSize,
        label: "Extra Large",
        description: "Maximum readability for accessibility and zoomed-out displays.",
        badge: "+24%",
      },
    ],
    [],
  );

  const handleTextSizeChange = (value: string) => {
    if (value === "normal" || value === "large" || value === "xlarge") {
      setTextSize(value);
    }
  };

  const handleColorChange = (color: string) => {
    setTenantSettings(prev => ({...prev, primaryColor: color}));
    // Update core brand tokens
    document.documentElement.style.setProperty('--primary', color);
    // Keep tenant-scoped variable in sync so CSS that derives from it updates too
    document.documentElement.style.setProperty('--tenant-primary', color);
    // Also tune admin sidebar variables from the chosen primary
    const toRgb = (hex: string) => {
      const h = hex.replace('#','');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    };
    const rgbToHex = (r:number,g:number,b:number) => '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
    const mixWithWhite = (hex: string, ratio = 0.92) => {
      const { r, g, b } = toRgb(hex);
      const mix = (c:number) => Math.round(c * (1 - ratio) + 255 * ratio);
      return rgbToHex(mix(r), mix(g), mix(b));
    };
    const mixWithBlack = (hex: string, ratio = 0.15) => {
      const { r, g, b } = toRgb(hex);
      const mix = (c:number) => Math.round(c * (1 - ratio) + 0 * ratio);
      return rgbToHex(mix(r), mix(g), mix(b));
    };
    const pickText = (bgHex: string) => {
      const { r, g, b } = toRgb(bgHex);
      const lum = 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
      return lum > 0.6 ? '#111111' : '#ffffff';
    };
    const sidebarBg = mixWithWhite(color, 0.93);
    const sidebarFg = pickText(sidebarBg);
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--sidebar', sidebarBg);
    document.documentElement.style.setProperty('--sidebar-foreground', sidebarFg);
    if (isDark) {
      // In dark mode, keep the navbar/active state neutral dark, not brand color
      document.documentElement.style.setProperty('--sidebar-primary', 'oklch(.269 0 0)');
      document.documentElement.style.setProperty('--sidebar-accent', 'oklch(.269 0 0)');
    } else {
      document.documentElement.style.setProperty('--sidebar-primary', color);
      document.documentElement.style.setProperty('--sidebar-accent', mixWithWhite(color, 0.88));
    }

    // Update accent tokens derived from primary
    const primaryFg = pickText(color);
    const secondaryBg = mixWithWhite(color, 0.85);
    const secondaryFg = pickText(secondaryBg);
    const accentBg = mixWithWhite(color, 0.92);
    const accentFg = pickText(accentBg);
    const accent1Bg = mixWithWhite(color, 0.75);
    const accent2Bg = mixWithBlack(color, 0.2);
    document.documentElement.style.setProperty('--primary-foreground', primaryFg);
    document.documentElement.style.setProperty('--secondary', secondaryBg);
    document.documentElement.style.setProperty('--secondary-foreground', secondaryFg);
    document.documentElement.style.setProperty('--accent', accentBg);
    document.documentElement.style.setProperty('--accent-foreground', accentFg);
    document.documentElement.style.setProperty('--accent1', accent1Bg);
    document.documentElement.style.setProperty('--accent2', accent2Bg);
  };

  return (
    <div className="p-6 space-y-6">
      <h1>Settings</h1>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-5 md:gap-0">
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tenant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tenant Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tenant-name">Company Name</Label>
                <Input
                  id="tenant-name"
                  value={tenantSettings.name}
                  onChange={(e) => setTenantSettings(prev => ({...prev, name: e.target.value}))}
                />
              </div>

              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 space-y-2">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div>
                <Label>Primary Color</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={tenantSettings.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={tenantSettings.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#030213"
                      className="flex-1"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {['#030213', '#1f2937', '#7c3aed', '#2563eb', '#059669', '#dc2626'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{backgroundColor: color}}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Button>Save Branding Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Text Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Adjust typography across the admin console to match your accessibility needs. Changes apply instantly and are stored per user.
              </p>
              <RadioGroup
                value={textSize}
                onValueChange={handleTextSizeChange}
                className="grid gap-4 md:grid-cols-3"
              >
                {textSizeOptions.map((option) => {
                  const optionId = `text-size-${option.value}`;
                  const preview = textSizeTokens[option.value];
                  const isActive = textSize === option.value;
                  return (
                    <div key={option.value} className="space-y-3">
                      <RadioGroupItem
                        value={option.value}
                        id={optionId}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={optionId}
                        className={cn(
                          "group relative flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/40",
                          isActive
                            ? "border-primary ring-2 ring-primary/30 shadow-primary/10"
                            : "hover:border-primary/40 hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {option.badge}
                          </Badge>
                        </div>
                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-3 transition-colors group-hover:border-primary/50">
                          <p
                            className="font-medium"
                            style={{
                              fontSize: preview.base,
                              lineHeight: preview.lineHeightBase,
                            }}
                          >
                            Task Overview
                          </p>
                          <p
                            className="mt-2 text-muted-foreground"
                            style={{
                              fontSize: preview.sm,
                              lineHeight: preview.lineHeightSm,
                            }}
                          >
                            Upcoming visits and sync status use this size.
                          </p>
                          <span
                            className="mt-3 inline-flex rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-primary"
                            style={{
                              fontSize: preview.sm,
                              lineHeight: preview.lineHeightSm,
                            }}
                          >
                            Badge Preview
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Preference is saved locally as <code>uiPreferences.textSize</code> so the scale stays put after refresh or sign-in.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonStar className="h-5 w-5" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Light &amp; Dark</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark modes without leaving the page.
                </p>
              </div>
              <ThemeToggle />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Language</Label>
                <Select 
                  value={localizationSettings.language} 
                  onValueChange={(value) => setLocalizationSettings(prev => ({...prev, language: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English (EN)</SelectItem>
                    <SelectItem value="AR">العربية (AR)</SelectItem>
                    <SelectItem value="ES">Español (ES)</SelectItem>
                    <SelectItem value="FR">Français (FR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rtl">Right-to-Left (RTL) Default</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable RTL layout by default for Arabic and other RTL languages
                  </p>
                </div>
                <Switch
                  id="rtl"
                  checked={localizationSettings.rtlDefault}
                  onCheckedChange={(checked) => setLocalizationSettings(prev => ({...prev, rtlDefault: checked}))}
                />
              </div>

              <div>
                <Label>Timezone</Label>
                <Select 
                  value={localizationSettings.timezone} 
                  onValueChange={(value) => setLocalizationSettings(prev => ({...prev, timezone: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                    <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                    <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                    <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="UTC+3">UTC+3 (Arab Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date Format</Label>
                <Select 
                  value={localizationSettings.dateFormat} 
                  onValueChange={(value) => setLocalizationSettings(prev => ({...prev, dateFormat: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>Save Localization Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="web-push">Web Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications for important updates
                  </p>
                </div>
                <Switch
                  id="web-push"
                  checked={notificationSettings.webPush}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, webPush: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts for task updates and system notifications
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, email: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send updates via WhatsApp (coming soon)
                  </p>
                  <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                </div>
                <Switch
                  id="whatsapp"
                  checked={notificationSettings.whatsapp}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, whatsapp: checked}))}
                  disabled
                />
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Password Policy</Label>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">Minimum Password Length: {securitySettings.passwordMinLength}</Label>
                    <Slider
                      value={[securitySettings.passwordMinLength]}
                      onValueChange={([value]) => setSecuritySettings(prev => ({...prev, passwordMinLength: value}))}
                      max={20}
                      min={6}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="special-chars">Require Special Characters</Label>
                    <Switch
                      id="special-chars"
                      checked={securitySettings.passwordRequireSpecial}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({...prev, passwordRequireSpecial: checked}))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Session Settings</Label>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">Session Length: {securitySettings.sessionLength} hours</Label>
                    <Slider
                      value={[securitySettings.sessionLength]}
                      onValueChange={([value]) => setSecuritySettings(prev => ({...prev, sessionLength: value}))}
                      max={24}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Audit Log Settings</Label>
                <div className="mt-4">
                  <Label className="text-sm">Retention Period: {securitySettings.auditLogRetention} days</Label>
                  <Slider
                    value={[securitySettings.auditLogRetention]}
                    onValueChange={([value]) => setSecuritySettings(prev => ({...prev, auditLogRetention: value}))}
                    max={365}
                    min={30}
                    step={30}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes to security settings will affect all users. Ensure you communicate policy changes to your team.
                </p>
              </div>

              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
