import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import {
  BaseBadge,
  BaseButton,
  BaseDrawer,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTextInput,
  BaseTitle,
  TexoDataTable,
  type TexoDataTableColumn,
} from '@texo/ui';
import { ListPageLayout } from '../list-page-layout';
import classes from '../list-page-layout.module.css';

export const page = { id: 'customers', label: 'Customers' };

type Customer = {
  id: string;
  name: string;
  industry: string;
  status: 'Active' | 'Needs attention' | 'Onboarding';
  plan: string;
  owner: string;
  seats: number;
  contact: string;
  email: string;
  notes: string;
};

// Local sample records for the page-layout experiment.
const customers: Customer[] = [
  {
    id: 'greenleaf',
    name: 'GreenLeaf',
    industry: 'Retail',
    status: 'Active',
    plan: 'Growth',
    owner: 'Maya Chen',
    seats: 42,
    contact: 'Alex Morgan',
    email: 'alex@greenleaf.example',
    notes:
      'Using customer reporting across three regional teams. Next check-in will cover adding the new store managers.',
  },
  {
    id: 'northstar',
    name: 'Northstar Studio',
    industry: 'Design services',
    status: 'Needs attention',
    plan: 'Growth',
    owner: 'Eli Brooks',
    seats: 18,
    contact: 'Sam Rivera',
    email: 'sam@northstar.example',
    notes:
      'The team needs help completing its data import. Confirm the remaining fields before the next onboarding session.',
  },
  {
    id: 'orbit',
    name: 'Orbit Labs',
    industry: 'Software',
    status: 'Onboarding',
    plan: 'Starter',
    owner: 'Maya Chen',
    seats: 12,
    contact: 'Jordan Lee',
    email: 'jordan@orbit.example',
    notes:
      'Workspace is ready. Invite the operations team and walk through their first customer workflow.',
  },
  {
    id: 'cedar',
    name: 'Cedar & Co.',
    industry: 'Professional services',
    status: 'Active',
    plan: 'Scale',
    owner: 'Nina Patel',
    seats: 86,
    contact: 'Taylor Quinn',
    email: 'taylor@cedar.example',
    notes:
      'Expanding into a second workspace. Their account owner is collecting requirements for regional reporting.',
  },
  {
    id: 'fieldwork',
    name: 'Fieldwork',
    industry: 'Logistics',
    status: 'Active',
    plan: 'Growth',
    owner: 'Eli Brooks',
    seats: 35,
    contact: 'Casey Reed',
    email: 'casey@fieldwork.example',
    notes:
      'Daily operations are running smoothly. Review team permissions before adding the dispatch group.',
  },
  {
    id: 'arc',
    name: 'Arc Health',
    industry: 'Healthcare',
    status: 'Needs attention',
    plan: 'Scale',
    owner: 'Nina Patel',
    seats: 64,
    contact: 'Jamie Park',
    email: 'jamie@arc.example',
    notes:
      'Account review is due. The customer requested a walkthrough of the reporting workflow for their new operations lead.',
  },
  {
    id: 'bright',
    name: 'Bright Supply',
    industry: 'Wholesale',
    status: 'Onboarding',
    plan: 'Growth',
    owner: 'Eli Brooks',
    seats: 24,
    contact: 'Riley Adams',
    email: 'riley@bright.example',
    notes:
      'Preparing the initial customer import. Review their column mapping together before bringing in the full dataset.',
  },
  {
    id: 'atlas',
    name: 'Atlas Works',
    industry: 'Manufacturing',
    status: 'Active',
    plan: 'Starter',
    owner: 'Maya Chen',
    seats: 9,
    contact: 'Drew Ellis',
    email: 'drew@atlas.example',
    notes:
      'The pilot team has completed setup. Gather feedback on their first week before inviting the rest of the business.',
  },
];
const filters = [
  'All customers',
  'Active',
  'Needs attention',
  'Onboarding',
] as const;
const columns: TexoDataTableColumn[] = [
  { key: 'name', label: 'Customer', width: 'minmax(220px, 2fr)' },
  { key: 'status', label: 'Status', width: 'minmax(160px, 1fr)' },
  { key: 'plan', label: 'Plan', width: 'minmax(100px, 1fr)' },
  { key: 'owner', label: 'Account owner', width: 'minmax(140px, 1fr)' },
  { key: 'seats', label: 'Seats', align: 'right', width: 80 },
];

function Status({ value }: { value: Customer['status'] }) {
  return (
    <BaseBadge
      variant="light"
      color={
        value === 'Active'
          ? 'green'
          : value === 'Needs attention'
            ? 'orange'
            : 'gray'
      }
      tt="none"
      fw={500}
    >
      {value}
    </BaseBadge>
  );
}

export default function CustomersPage() {
  const [filter, setFilter] =
    useState<(typeof filters)[number]>('All customers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [opened, setOpened] = useState(false);
  const query = search.trim().toLowerCase();
  const rows = customers.filter(
    (customer) =>
      (filter === 'All customers' || customer.status === filter) &&
      (!query ||
        `${customer.name} ${customer.contact} ${customer.email}`
          .toLowerCase()
          .includes(query)),
  );

  return (
    <>
      <ListPageLayout
        title="Customers"
        description="Keep track of your customers, account health, and the people behind each business."
        filters={
          <BaseGroup justify="space-between" gap="md">
            <BaseGroup gap={6} role="group" aria-label="Quick filters">
              {filters.map((value) => (
                <BaseButton
                  key={value}
                  size="compact-sm"
                  variant={filter === value ? 'light' : 'subtle'}
                  color={filter === value ? undefined : 'gray'}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  data-target="filter"
                  data-target-label="Quick filter"
                  data-record={value}
                  data-record-label={value}
                >
                  {value}
                </BaseButton>
              ))}
            </BaseGroup>
            <BaseTextInput
              aria-label="Search customers"
              placeholder="Search customers"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              w={240}
              data-target="search"
              data-target-label="Search"
            />
          </BaseGroup>
        }
      >
        <div
          className={classes.table}
          data-target="table"
          data-target-label="Customer table"
        >
          <TexoDataTable
            columns={columns}
            rows={rows}
            onOpen={(customer) => {
              setSelected(customer);
              setOpened(true);
            }}
            renderCell={(column, value, customer) => {
              if (column.key === 'name')
                return (
                  <BaseText size="sm" fw={500} truncate>
                    {customer.name}
                  </BaseText>
                );
              if (column.key === 'status')
                return <Status value={customer.status} />;
              return (
                <BaseText size="sm" truncate>
                  {String(value)}
                </BaseText>
              );
            }}
            emptyLabel={
              <BaseStack gap="xs" align="center">
                <BaseText size="sm">No customers match these filters.</BaseText>
                <BaseButton
                  size="compact-sm"
                  variant="subtle"
                  onClick={() => {
                    setFilter('All customers');
                    setSearch('');
                  }}
                >
                  Clear filters
                </BaseButton>
              </BaseStack>
            }
          />
        </div>
        <BaseGroup justify="space-between">
          <BaseText size="xs" c="dimmed" role="status">
            {rows.length} of {customers.length} customers
          </BaseText>
          <BaseText size="xs" c="dimmed">
            Sample data
          </BaseText>
        </BaseGroup>
      </ListPageLayout>
      <BaseDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="md"
        padding="xl"
        title="Customer details"
        closeButtonProps={{ 'aria-label': 'Close customer details' }}
      >
        {selected && (
          <BaseStack gap="xl">
            <BaseStack gap={8}>
              <BaseTitle order={2} size="h3">
                {selected.name}
              </BaseTitle>
              <BaseText size="sm" c="dimmed">
                {selected.industry}
              </BaseText>
              <BaseGroup>
                <Status value={selected.status} />
              </BaseGroup>
            </BaseStack>
            <dl className={classes.details}>
              <div>
                <dt>Plan</dt>
                <dd>{selected.plan}</dd>
              </div>
              <div>
                <dt>Seats</dt>
                <dd>{selected.seats}</dd>
              </div>
              <div>
                <dt>Account owner</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>Primary contact</dt>
                <dd>{selected.contact}</dd>
              </div>
            </dl>
            <BaseStack gap={4}>
              <BaseText size="xs" c="dimmed">
                Contact email
              </BaseText>
              <BaseText size="sm">{selected.email}</BaseText>
            </BaseStack>
            <BaseStack gap={8}>
              <BaseTitle order={3} size="h5">
                Account notes
              </BaseTitle>
              <BaseText size="sm" lh={1.6}>
                {selected.notes}
              </BaseText>
            </BaseStack>
          </BaseStack>
        )}
      </BaseDrawer>
    </>
  );
}
