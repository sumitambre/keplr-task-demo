import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@repo/ui/sonner";
import "./index.css";
import "./styles/globals.css";
import { UserPrefsProvider } from "./context/user-prefs";
// Apply theme preset and brand color at runtime
(() => {
  try {
    const preset = ((import.meta as any).env?.VITE_THEME_PRESET as string) ?? 'benchling';
    const tenantPrimary = ((import.meta as any).env?.VITE_TENANT_PRIMARY as string) || '#2a66f6';
    const adminSidebarEnv = ((import.meta as any).env?.VITE_ADMIN_SIDEBAR_BG as string) || '';
    document.documentElement.setAttribute('data-theme', preset);
    if (preset === 'benchling') {
      // Brand color (safe for both light/dark). Do NOT override background/card
      // tokens here, since that breaks dark mode by winning the cascade.
      document.documentElement.style.setProperty('--tenant-primary', tenantPrimary);
      // Derive admin sidebar background from env or primary
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
      const pickText = (bgHex: string) => {
        const { r, g, b } = toRgb(bgHex);
        // luminance heuristic
        const lum = 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
        return lum > 0.6 ? '#111111' : '#ffffff';
      };
      const mixWithBlack = (hex: string, ratio = 0.15) => {
        const { r, g, b } = toRgb(hex);
        const mix = (c:number) => Math.round(c * (1 - ratio) + 0 * ratio);
        return rgbToHex(mix(r), mix(g), mix(b));
      };
      const sidebarBg = adminSidebarEnv || mixWithWhite(tenantPrimary, 0.93);
      const sidebarFg = pickText(sidebarBg);
      document.documentElement.style.setProperty('--sidebar', sidebarBg);
      document.documentElement.style.setProperty('--sidebar-foreground', sidebarFg);
      document.documentElement.style.setProperty('--sidebar-border', 'oklch(0.92 0 0)');
      document.documentElement.style.setProperty('--sidebar-accent', mixWithWhite(tenantPrimary, 0.88));

      // Brand-derived tokens for UI accents
      const primaryFg = pickText(tenantPrimary);
      const secondaryBg = mixWithWhite(tenantPrimary, 0.85);
      const secondaryFg = pickText(secondaryBg);
      const accentBg = mixWithWhite(tenantPrimary, 0.92);
      const accentFg = pickText(accentBg);
      const accent1Bg = mixWithWhite(tenantPrimary, 0.75);
      const accent2Bg = mixWithBlack(tenantPrimary, 0.2);

      document.documentElement.style.setProperty('--primary-foreground', primaryFg);
      document.documentElement.style.setProperty('--secondary', secondaryBg);
      document.documentElement.style.setProperty('--secondary-foreground', secondaryFg);
      document.documentElement.style.setProperty('--accent', accentBg);
      document.documentElement.style.setProperty('--accent-foreground', accentFg);
      document.documentElement.style.setProperty('--accent1', accent1Bg);
      document.documentElement.style.setProperty('--accent2', accent2Bg);
    }
  } catch {}
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UserPrefsProvider>
          <App />
          <Toaster position="top-right" richColors />
        </UserPrefsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);





