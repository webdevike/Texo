// Theme settings persisted through the Store contract (P6). Applied live via ThemedProvider.
import { Button, ColorSwatch, Group, SegmentedControl, Select, Stack, Text, TextInput } from "@mantine/core";
import { DEFAULT_THEME } from "@mantine/core";
import { useState } from "react";
import { host, type ThemeSettings } from "../ui/client";

const COLORS = Object.keys(DEFAULT_THEME.colors).filter((c) => c !== "dark" && c !== "gray");

export function ThemePanel({ theme, onChange }: { theme: ThemeSettings; onChange: (t: ThemeSettings) => void }) {
  const [saved, setSaved] = useState(true);
  const set = (patch: Partial<ThemeSettings>) => { onChange({ ...theme, ...patch }); setSaved(false); };

  return (
    <Stack gap="md" maw={520}>
      <TextInput label="App name" value={theme.appName} onChange={(e) => set({ appName: e.currentTarget.value })} />
      <Stack gap={4}>
        <Text size="sm" fw={500}>Primary color</Text>
        <Group gap={6}>
          {COLORS.map((c) => (
            <ColorSwatch key={c} color={DEFAULT_THEME.colors[c]![6]} size={26} style={{ cursor: "pointer", outline: theme.primaryColor === c ? "2px solid var(--mantine-color-text)" : undefined, outlineOffset: 2 }} onClick={() => set({ primaryColor: c })} />
          ))}
        </Group>
      </Stack>
      <Stack gap={4}>
        <Text size="sm" fw={500}>Radius</Text>
        <SegmentedControl data={["xs", "sm", "md", "lg", "xl"]} value={theme.radius} onChange={(v) => set({ radius: v as ThemeSettings["radius"] })} />
      </Stack>
      <Stack gap={4}>
        <Text size="sm" fw={500}>Color scheme</Text>
        <SegmentedControl data={["light", "dark"]} value={theme.colorScheme} onChange={(v) => set({ colorScheme: v as ThemeSettings["colorScheme"] })} />
      </Stack>
      <Select label="Font" data={["system-ui, sans-serif", "Inter, sans-serif", "Georgia, serif", "ui-monospace, monospace"]} value={theme.fontFamily} onChange={(v) => v && set({ fontFamily: v })} />
      <Group justify="flex-end">
        <Button disabled={saved} onClick={async () => { await host.putSetting("theme", theme); setSaved(true); }}>Save theme</Button>
      </Group>
    </Stack>
  );
}
