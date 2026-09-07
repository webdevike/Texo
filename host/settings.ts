// Framework-owned settings persist through the SAME Store contract as app data (P6).
// The theme is one row of the `_setting` entity, keyed by name.
import { defineEntity } from "../contracts/entity";
import type { Store } from "../contracts/store";

export const setting = defineEntity({
  name: "_setting",
  title: "key",
  fields: [
    { name: "key", kind: "string", min: 1 },
    { name: "value", kind: "string", long: true },
  ],
});

export async function readSetting<T>(store: Store, key: string, fallback: T): Promise<T> {
  const [row] = await store.list(setting, { where: { key } });
  if (!row) return fallback;
  return { ...fallback, ...(JSON.parse(String(row.value)) as Partial<T>) };
}

export async function writeSetting(store: Store, key: string, value: unknown): Promise<void> {
  const [row] = await store.list(setting, { where: { key } });
  const serialized = JSON.stringify(value);
  if (row) await store.update(setting, row.id, { value: serialized });
  else await store.create(setting, { key, value: serialized });
}
