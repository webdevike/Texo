// One page per entity: table + create/edit modal. Talks to the ClientStore contract only.
import { Button, Group, Modal, Stack, Title } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import type { Entity, Row } from "../../experiments/contracts-spike/contracts/entity";
import type { ClientStore } from "../../experiments/contracts-spike/contracts/store";
import { EntityForm } from "./entity-form";
import { EntityTable } from "./entity-table";

type Sort = { field: string; direction: "asc" | "desc" };

export function EntityPage({ entity, store }: { entity: Entity; store: ClientStore }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sort, setSort] = useState<Sort | undefined>();
  const [editing, setEditing] = useState<Row | "new" | undefined>();

  const refresh = useCallback(async () => {
    setRows(await store.list(entity, sort ? { orderBy: sort } : {}));
  }, [entity, store, sort]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toggleSort = (field: string) =>
    setSort((s) => (s?.field === field ? (s.direction === "asc" ? { field, direction: "desc" } : undefined) : { field, direction: "asc" }));

  const close = () => setEditing(undefined);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>{entity.name}</Title>
        <Button onClick={() => setEditing("new")}>New {entity.name}</Button>
      </Group>
      <EntityTable entity={entity} rows={rows} sort={sort} onSort={toggleSort} onSelect={setEditing} />
      <Modal opened={editing !== undefined} onClose={close} title={editing === "new" ? `New ${entity.name}` : String(editing?.[entity.title])}>
        {editing !== undefined && (
          <Stack gap="sm">
            <EntityForm
              key={editing === "new" ? "new" : editing.id}
              entity={entity}
              row={editing === "new" ? undefined : editing}
              onCancel={close}
              onSubmit={async (values) => {
                if (editing === "new") await store.create(entity, values);
                else await store.update(entity, editing.id, values);
                close();
                await refresh();
              }}
            />
            {editing !== "new" && (
              <Button variant="subtle" color="red" onClick={async () => { await store.remove(entity, editing.id); close(); await refresh(); }}>
                Delete
              </Button>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
