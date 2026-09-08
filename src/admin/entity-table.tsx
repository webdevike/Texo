// Table rendered from entity.fields. Sort by clicking a header; click a row to edit.
import { Badge, Table, Text } from "@mantine/core";
import type { Entity, FieldSpec, Row } from "../../experiments/contracts-spike/contracts/entity";

function Cell({ field, value }: { field: FieldSpec; value: unknown }) {
  if (value === undefined || value === null) return <Text c="dimmed" size="sm">–</Text>;
  if (field.kind === "boolean") return <Badge variant="light" color={value ? "green" : "gray"}>{value ? "yes" : "no"}</Badge>;
  if (field.kind === "enum") return <Badge variant="outline">{String(value)}</Badge>;
  if (field.kind === "relation") return <Text size="sm" lineClamp={1}>{typeof value === "object" && value !== null && "title" in value ? String((value as { title?: unknown }).title ?? "") : Array.isArray(value) ? `${value.length} linked` : String(value)}</Text>;
  if (field.kind === "group") return <Text c="dimmed" size="sm">{Array.isArray(value) ? `${value.length} items` : "1 item"}</Text>;
  return <Text size="sm" lineClamp={1}>{String(value)}</Text>;
}

export function EntityTable({ entity, rows, sort, onSort, onSelect }: {
  entity: Entity;
  rows: Row[];
  sort?: { field: string; direction: "asc" | "desc" };
  onSort: (field: string) => void;
  onSelect: (row: Row) => void;
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
              <Table.Td key={f.name}><Cell field={f} value={row[f.name]} /></Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
