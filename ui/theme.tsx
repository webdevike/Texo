// Applies persisted ThemeSettings to Mantine. Shared by the app and the admin.
import { createTheme, MantineProvider } from "@mantine/core";
import { type ReactNode, useEffect, useState } from "react";
import { defaultTheme } from "../host/settings";
import { host, type ThemeSettings } from "./client";

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  useEffect(() => { host.getSetting<ThemeSettings>("theme").then(setTheme); }, []);
  return [theme, setTheme] as const;
}

export function ThemedProvider({ theme, children }: { theme: ThemeSettings; children: ReactNode }) {
  return (
    <MantineProvider
      forceColorScheme={theme.colorScheme}
      theme={createTheme({ primaryColor: theme.primaryColor, defaultRadius: theme.radius, fontFamily: theme.fontFamily })}
    >
      {children}
    </MantineProvider>
  );
}
