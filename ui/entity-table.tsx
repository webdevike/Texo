// Table rendered from entity.fields. Sort by clicking a header; click a row to edit.
import { Badge, Table, Text } from "@mantine/core";
import type { Entity, FieldMeta, Row } from "../contracts/entity";

function Cell({ field, value }: { field: FieldMeta; value: unknown }) {
  if (value === undefined || value === null) return <Text c="dimmed" size="sm">–</Text>;
  if (field.kind === "boolean") return <Badge variant="light" color={value ? "green" : "gray"}>{value ? "yes" : "no"}</Badge>;
  if (field.kind === "enum") return <Badge variant="outline">{String(value)}</Badge>;
  return <Text size="sm">{String(value)}</Text>;
}

export function EntityTable<E extends Entity>({ entity, rows, sort, onSort, onSelect }: {
  entity: E;
  rows: Row<E>[];
  sort?: { field: string; direction: "asc" | "desc" };
  onSort: (field: string) => void;
  onSelect: (row: Row<E>) => void;
}) {
  return (
    <Table highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          {entity.fields.map((f) => (
            <Table.Th key={f.name} style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort(f.name)}>
              {f.name}{sort?.field === f.name ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length === 0 && (
          <Table.Tr><Table.Td colSpan={entity.fields.length}><Text c="dimmed" size="sm">No {entity.name}s yet</Text></Table.Td></Table.Tr>
        )}
        {rows.map((row) => (
          <Table.Tr key={row.id} style={{ cursor: "pointer" }} onClick={() => onSelect(row)}>
            {entity.fields.map((f) => (
              <Table.Td key={f.name}><Cell field={f} value={(row as Record<string, unknown>)[f.name]} /></Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
