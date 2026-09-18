"use client";
import { createContext, useContext, useState, useEffect } from "react";

export const COLOR_PRESETS = [
  { id:"orange",  label:"Sunset Orange",  primary:"#f97316", dark:"#ea6b08", light:"#fff7ed", ring:"#fdba74" },
  { id:"violet",  label:"Royal Violet",   primary:"#7c3aed", dark:"#6d28d9", light:"#f5f3ff", ring:"#c4b5fd" },
  { id:"cyan",    label:"Ocean Cyan",     primary:"#0891b2", dark:"#0e7490", light:"#ecfeff", ring:"#67e8f9" },
  { id:"rose",    label:"Blush Rose",     primary:"#e11d48", dark:"#be123c", light:"#fff1f2", ring:"#fda4af" },
  { id:"emerald", label:"Forest Green",   primary:"#059669", dark:"#047857", light:"#ecfdf5", ring:"#6ee7b7" },
  { id:"amber",   label:"Golden Amber",   primary:"#d97706", dark:"#b45309", light:"#fffbeb", ring:"#fcd34d" },
  { id:"indigo",  label:"Deep Indigo",    primary:"#4f46e5", dark:"#4338ca", light:"#eef2ff", ring:"#a5b4fc" },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark]       = useState(false);
  const [accentId, setAccentId]   = useState("orange");
  const [customColor, setCustomColor] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hrms_theme");
      if (saved) {
        const { dark, accent, custom } = JSON.parse(saved);
        if (dark   !== undefined) setIsDark(dark);
        if (accent !== undefined) setAccentId(accent);
        if (custom !== undefined) setCustomColor(custom);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("hrms_theme", JSON.stringify({ dark: isDark, accent: accentId, custom: customColor }));
  }, [isDark, accentId, customColor]);

  const preset = COLOR_PRESETS.find(p => p.id === accentId) ?? COLOR_PRESETS[0];
  const accent = customColor
    ? { primary: customColor, dark: customColor, light: customColor + "22", ring: customColor + "88" }
    : preset;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, accentId, setAccentId, customColor, setCustomColor, accent, presets: COLOR_PRESETS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);