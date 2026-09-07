// The app: one page per entity from the manifest, themed from settings. Nothing entity-specific.
import { Anchor, Container, Group, Stack, Tabs, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createHttpStore } from "../adapters/store-http";
import type { Entity } from "../contracts/entity";
import { entitiesOf, host } from "../ui/client";
import { EntityPage } from "../ui/entity-page";
import { defaultPersistedTheme, type PersistedTheme, ThemedProvider } from "../ui/theme";

const store = createHttpStore("/api");

function App() {
  const [appName, setAppName] = useState(defaultPersistedTheme.appName);
  const [entities, setEntities] = useState<Entity[]>([]);
  useEffect(() => { host.manifest().then((m) => setEntities(entitiesOf(m).filter((e) => !m.system.includes(e.name)))); }, []);

  return (
    <ThemedProvider onLoaded={(t: PersistedTheme) => setAppName(t.appName)}>
      <Container py="xl">
        <Group justify="space-between" mb="md">
          <Text fw={600}>{appName}</Text>
          <Anchor href="/admin" size="sm">admin</Anchor>
        </Group>
        {entities.length > 0 && (
          <Tabs defaultValue={entities[0]!.name}>
            <Tabs.List mb="md">
              {entities.map((e) => <Tabs.Tab key={e.name} value={e.name}>{e.name}</Tabs.Tab>)}
            </Tabs.List>
            {entities.map((e) => (
              <Tabs.Panel key={e.name} value={e.name}>
                <Stack><EntityPage entity={e} store={store} /></Stack>
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </Container>
    </ThemedProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
