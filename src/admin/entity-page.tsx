// One page per entity: table + create/edit modal. Talks to the ClientStore contract only.
import { Button, Group, Modal, Stack, Title } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import type { Entity, FieldSpec, Row } from "../../experiments/contracts-spike/contracts/entity";
import type { ClientStore } from "../../experiments/contracts-spike/contracts/store";
import { EntityForm } from "./entity-form";
import { EntityTable } from "./entity-table";

type Sort = { field: string; direction: "asc" | "desc" };

// W1Relations: `resolveEntity` lets relation pickers find their target; single relations are included on list.
const singleRelations = (fields: FieldSpec[]) => fields.filter((f) => f.kind === "relation" && !f.many).map((f) => f.name);

export function EntityPage({ entity, store, resolveEntity = () => undefined }: { entity: Entity; store: ClientStore; resolveEntity?: (name: string) => Entity | undefined }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sort, setSort] = useState<Sort | undefined>();
  const [editing, setEditing] = useState<Row | "new" | undefined>();

  const refresh = useCallback(async () => {
    setRows((await store.list(entity, { orderBy: sort, limit: 500, include: singleRelations(entity.fields) })).rows); // W1Relations
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
              store={store} // W1Relations
              resolveEntity={resolveEntity} // W1Relations
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
