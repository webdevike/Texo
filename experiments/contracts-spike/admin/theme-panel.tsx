// Texo's real theme configurator: preset picker, undo/redo, and the four inspector tabs.
// Every committed change persists through the Store via ThemedProvider(persist).
import { ActionIcon, Group, Select, Stack, Tabs, Text, TextInput } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useState } from "react";
import { TEXO_THEME_PRESETS, useTexoTheme } from "../theme/texo-theme-provider";
import { ThemeControls } from "../theme/theme-controls";
import { host } from "../ui/client";
import type { PersistedTheme } from "../ui/theme";

export function ThemePanel({ appName, onAppName }: { appName: string; onAppName: (n: string) => void }) {
  const { applyPreset, canRedo, canUndo, preset, redo, undo } = useTexoTheme();
  const [tab, setTab] = useState<string | null>("colors");

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="sm">
        <Select
          label="Preset"
          w={200}
          data={[...TEXO_THEME_PRESETS.map((p) => ({ value: p.value, label: p.label })), ...(preset === "custom" ? [{ value: "custom", label: "Custom" }] : [])]}
          value={preset}
          onChange={(v) => v && v !== "custom" && applyPreset(v)}
        />
        <Group gap={4} pb={4}>
          <ActionIcon variant="default" disabled={!canUndo} onClick={undo} aria-label="Undo"><IconArrowBackUp size={16} /></ActionIcon>
          <ActionIcon variant="default" disabled={!canRedo} onClick={redo} aria-label="Redo"><IconArrowForwardUp size={16} /></ActionIcon>
        </Group>
        <TextInput
          label="App name"
          w={200}
          value={appName}
          onChange={(e) => onAppName(e.currentTarget.value)}
          onBlur={async () => {
            const t = await host.getSetting<Partial<PersistedTheme>>("theme");
            await host.putSetting("theme", { ...t, appName });
          }}
        />
      </Group>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="colors">Colors</Tabs.Tab>
          <Tabs.Tab value="typography">Typography</Tabs.Tab>
          <Tabs.Tab value="other">Other</Tabs.Tab>
          <Tabs.Tab value="generate">Generate</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <ThemeControls tab={tab} />
      <Text c="dimmed" size="xs">Every change is persisted to the <code>_setting</code> entity through the Store contract and applied to the app on next load.</Text>
    </Stack>
  );
}
