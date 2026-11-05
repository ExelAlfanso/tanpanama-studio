import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#20211e" : "#f1f0e9");
  }, [theme]);

  return null;
}
