import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TextSize = "normal" | "large" | "xlarge";

type UiPreferences = {
  textSize: TextSize;
};

type UserPrefsState = {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
};

const Ctx = createContext<UserPrefsState | undefined>(undefined);

const STORAGE_KEY = "keplr-ui-preferences";
const LEGACY_STORAGE_KEY = "keplr-font-scale";

const DEFAULT_PREFS: UiPreferences = {
  textSize: "normal",
};

const TEXT_SIZE_CLASSES: Record<TextSize, string> = {
  normal: "text-size-normal",
  large: "text-size-large",
  xlarge: "text-size-xlarge",
};

const isTextSize = (value: unknown): value is TextSize =>
  value === "normal" || value === "large" || value === "xlarge";

const loadPreferences = (): UiPreferences => {
  if (typeof window === "undefined") return DEFAULT_PREFS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as
        | Partial<UiPreferences> & { uiPreferences?: Partial<UiPreferences> }
        | null;
      const candidate =
        parsed && typeof parsed === "object" && "uiPreferences" in parsed && parsed.uiPreferences
          ? parsed.uiPreferences
          : parsed;
      if (candidate && isTextSize(candidate.textSize)) {
        return { textSize: candidate.textSize };
      }
    }

    // Legacy fallback: original fontScale storage (md|lg)
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "lg") {
      return { textSize: "large" };
    }
  } catch {
    // noop - fall through to defaults
  }

  return DEFAULT_PREFS;
};

const persistPreferences = (prefs: UiPreferences) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ uiPreferences: prefs }),
    );
  } catch {
    // Ignore persistence issues (e.g., storage quota, privacy mode)
  }
};

const applyTextSizeClass = (textSize: TextSize) => {
  if (typeof document === "undefined") return;
  const targets: (HTMLElement | HTMLHtmlElement | HTMLBodyElement | null)[] = [
    document.documentElement,
    document.body,
  ];

  const classes = Object.values(TEXT_SIZE_CLASSES);
  const className = TEXT_SIZE_CLASSES[textSize];

  targets.forEach((target) => {
    if (!target) return;
    target.classList.remove(...classes);
    target.classList.add(className);
    target.setAttribute("data-text-size", textSize);
  });
};

export function UserPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UiPreferences>(() => {
    const initial = loadPreferences();
    applyTextSizeClass(initial.textSize);
    return initial;
  });

  useEffect(() => {
    persistPreferences(prefs);
  }, [prefs]);

  useEffect(() => {
    applyTextSizeClass(prefs.textSize);
  }, [prefs.textSize]);

  const setTextSize = useCallback((size: TextSize) => {
    setPrefs((prev) => {
      if (prev.textSize === size) return prev;
      return { ...prev, textSize: size };
    });
  }, []);

  const value = useMemo(
    () => ({
      textSize: prefs.textSize,
      setTextSize,
    }),
    [prefs.textSize, setTextSize],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUserPrefs = () => {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useUserPrefs must be used within UserPrefsProvider");
  }
  return ctx;
};
