// Client: one page per entity, all driven by the same generic components.
import { Container, MantineProvider, Stack, Tabs } from "@mantine/core";
import { createRoot } from "react-dom/client";
import { createHttpStore } from "../adapters/store-http";
import { EntityPage } from "../ui/entity-page";
import { issue } from "./entities/issue";

const entities = [issue];
const store = createHttpStore("/api");

function App() {
  return (
    <MantineProvider>
      <Container py="xl">
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
      </Container>
    </MantineProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
