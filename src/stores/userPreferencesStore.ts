import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeVariant = "light" | "dark";

export type ThemeName = 
  | "default" 
  | "ocean" 
  | "forest" 
  | "sunset" 
  | "lavender" 
  | "rose" 
  | "midnight" 
  | "ember" 
  | "mint" 
  | "slate";

export type LanguageCode = 
  | "en" 
  | "es" 
  | "fr" 
  | "de" 
  | "it" 
  | "pt" 
  | "zh" 
  | "ja" 
  | "ko" 
  | "ar";

export const THEMES: Record<ThemeName, { name: string; primary: string; preview: string }> = {
  default: { name: "Default Blue", primary: "221 83% 53%", preview: "#3B82F6" },
  ocean: { name: "Ocean", primary: "199 89% 48%", preview: "#0EA5E9" },
  forest: { name: "Forest", primary: "142 71% 45%", preview: "#22C55E" },
  sunset: { name: "Sunset", primary: "25 95% 53%", preview: "#F97316" },
  lavender: { name: "Lavender", primary: "262 83% 58%", preview: "#8B5CF6" },
  rose: { name: "Rose", primary: "340 82% 52%", preview: "#E11D48" },
  midnight: { name: "Midnight", primary: "240 84% 60%", preview: "#4F46E5" },
  ember: { name: "Ember", primary: "0 84% 60%", preview: "#EF4444" },
  mint: { name: "Mint", primary: "172 66% 50%", preview: "#2DD4BF" },
  slate: { name: "Slate", primary: "215 16% 47%", preview: "#64748B" },
};

export const LANGUAGES: Record<LanguageCode, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  ko: { name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
};

interface UserPreferences {
  theme: ThemeName;
  themeVariant: ThemeVariant;
  language: LanguageCode;
}

interface UserPreferencesState {
  preferences: Record<string, UserPreferences>;
  getPreferences: (userId: string) => UserPreferences;
  setTheme: (userId: string, theme: ThemeName) => void;
  setThemeVariant: (userId: string, variant: ThemeVariant) => void;
  setLanguage: (userId: string, language: LanguageCode) => void;
}

const defaultPreferences: UserPreferences = {
  theme: "default",
  themeVariant: "light",
  language: "en",
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      preferences: {},

      getPreferences: (userId: string) => {
        return get().preferences[userId] || defaultPreferences;
      },

      setTheme: (userId: string, theme: ThemeName) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [userId]: {
              ...state.getPreferences(userId),
              theme,
            },
          },
        }));
        applyTheme(theme, get().getPreferences(userId).themeVariant);
      },

      setThemeVariant: (userId: string, variant: ThemeVariant) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [userId]: {
              ...state.getPreferences(userId),
              themeVariant: variant,
            },
          },
        }));
        applyTheme(get().getPreferences(userId).theme, variant);
      },

      setLanguage: (userId: string, language: LanguageCode) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [userId]: {
              ...state.getPreferences(userId),
              language,
            },
          },
        }));
      },
    }),
    {
      name: "user-preferences-storage",
    }
  )
);

export function applyTheme(theme: ThemeName, variant: ThemeVariant) {
  const root = document.documentElement;
  const themeConfig = THEMES[theme];
  
  // Apply primary color
  root.style.setProperty("--primary", themeConfig.primary);
  root.style.setProperty("--ring", themeConfig.primary);
  root.style.setProperty("--sidebar-primary", themeConfig.primary);
  root.style.setProperty("--sidebar-ring", themeConfig.primary);
  
  // Apply light/dark mode
  if (variant === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}