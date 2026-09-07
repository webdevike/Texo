// Admin shell. Every panel reads the manifest; nothing here names an entity or an adapter (P5).
import { AppShell, Badge, Code, Group, NavLink, Stack, Table, Text, Title } from "@mantine/core";
import { IconDatabase, IconPalette, IconPlus, IconSettings, IconTable } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createHttpStore } from "../adapters/store-http";
import { entitiesOf, host, type Manifest } from "../ui/client";
import { EntityPage } from "../ui/entity-page";
import { defaultPersistedTheme, type PersistedTheme, ThemedProvider } from "../ui/theme";
import { SchemaBuilder } from "./schema-builder";
import { ThemePanel } from "./theme-panel";

const store = createHttpStore("/api");

type View = { kind: "content"; name: string } | { kind: "schema"; name: string } | { kind: "schema-new" } | { kind: "theme" } | { kind: "system" };

function Admin() {
  const [appName, setAppName] = useState(defaultPersistedTheme.appName);
  const [m, setManifest] = useState<Manifest | undefined>();
  const [view, setView] = useState<View>({ kind: "system" });
  const reload = useCallback(() => host.manifest().then(setManifest), []);
  useEffect(() => { void reload(); }, [reload]);

  if (!m) return null;
  const entities = entitiesOf(m);
  const content = entities.filter((e) => !m.system.includes(e.name));
  const isActive = (v: View) => JSON.stringify(v) === JSON.stringify(view);

  return (
    <ThemedProvider persist onLoaded={(t: PersistedTheme) => setAppName(t.appName)}>
      <AppShell navbar={{ width: 240, breakpoint: 0 }} padding="lg">
        <AppShell.Navbar p="sm">
          <Stack gap={2}>
            <Text fw={600} px="sm" pb="xs">{appName} <Text span c="dimmed" size="xs">admin</Text></Text>
            <Text size="xs" c="dimmed" px="sm" pt="xs" tt="uppercase" fw={600}>Content</Text>
            {content.map((e) => (
              <NavLink key={e.name} label={e.name} leftSection={<IconTable size={16} />} active={isActive({ kind: "content", name: e.name })} onClick={() => setView({ kind: "content", name: e.name })} />
            ))}
            <Text size="xs" c="dimmed" px="sm" pt="md" tt="uppercase" fw={600}>Schema</Text>
            {content.map((e) => (
              <NavLink key={e.name} label={e.name} leftSection={<IconDatabase size={16} />} active={isActive({ kind: "schema", name: e.name })} onClick={() => setView({ kind: "schema", name: e.name })} />
            ))}
            <NavLink label="New entity" leftSection={<IconPlus size={16} />} active={isActive({ kind: "schema-new" })} onClick={() => setView({ kind: "schema-new" })} />
            <Text size="xs" c="dimmed" px="sm" pt="md" tt="uppercase" fw={600}>Settings</Text>
            <NavLink label="Theme" leftSection={<IconPalette size={16} />} active={isActive({ kind: "theme" })} onClick={() => setView({ kind: "theme" })} />
            <NavLink label="System" leftSection={<IconSettings size={16} />} active={isActive({ kind: "system" })} onClick={() => setView({ kind: "system" })} />
            <NavLink label="Open app" component="a" href="/" mt="md" />
          </Stack>
        </AppShell.Navbar>
        <AppShell.Main>
          {view.kind === "content" && <EntityPage key={view.name} entity={entities.find((e) => e.name === view.name)!} store={store} />}
          {view.kind === "schema" && (
            <Stack>
              <Title order={3}>Schema: {view.name}</Title>
              <SchemaBuilder key={view.name} spec={m.entities.find((e) => e.name === view.name)!} isNew={false} onSaved={reload} onDeleted={async () => { await reload(); setView({ kind: "system" }); }} />
            </Stack>
          )}
          {view.kind === "schema-new" && (
            <Stack>
              <Title order={3}>New entity</Title>
              <SchemaBuilder key="new" spec={{ name: "", title: "", fields: [{ name: "name", kind: "string", min: 1 }] }} isNew onSaved={async () => { await reload(); }} onDeleted={reload} />
            </Stack>
          )}
          {view.kind === "theme" && (<Stack><Title order={3}>Theme</Title><ThemePanel appName={appName} onAppName={setAppName} /></Stack>)}
          {view.kind === "system" && (
            <Stack>
              <Title order={3}>System</Title>
              <Table withTableBorder maw={600}>
                <Table.Tbody>
                  <Table.Tr><Table.Td>Store adapter</Table.Td><Table.Td><Code>{m.adapters.store}</Code></Table.Td></Table.Tr>
                  <Table.Tr><Table.Td>Transport</Table.Td><Table.Td><Code>{m.adapters.transport}</Code></Table.Td></Table.Tr>
                  <Table.Tr><Table.Td>Entities</Table.Td><Table.Td><Group gap={4}>{content.map((e) => <Badge key={e.name} variant="light">{e.name}</Badge>)}</Group></Table.Td></Table.Tr>
                  <Table.Tr><Table.Td>System entities</Table.Td><Table.Td><Group gap={4}>{m.system.map((n) => <Badge key={n} variant="outline" color="gray">{n}</Badge>)}</Group></Table.Td></Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
          )}
        </AppShell.Main>
      </AppShell>
    </ThemedProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Admin />);
