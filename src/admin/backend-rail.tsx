// The "Backend" rail: what the Strapi-style admin knew, rendered as Texo sidebar sections
// that honor config.sidebar. Entity items come from the manifest; static items (New entity,
// System) come from the extension registry's nav contributions with section "Backend/<sub>".
import { IconDatabase, IconSearch, IconTable } from '@tabler/icons-react';
import { TexoNavItem, TexoNavSection, BaseStack, BaseText, BaseTextInput } from '@texo/ui';
import { useNavigate } from 'react-router-dom';

import type { NavContribution } from '../../experiments/contracts-spike/contracts/extension';
import type { Manifest } from './client';

export function BackendSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <BaseTextInput
      aria-label="Search backend"
      leftSection={<IconSearch size={14} />}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder="Search backend"
      size="xs"
      styles={{ root: { width: '100%' }, input: { background: 'transparent', border: 0 } }}
      value={value}
      variant="unstyled"
    />
  );
}

export function BackendNav({ manifest, nav, pathname, query }: { manifest: Manifest | undefined; nav: NavContribution[]; pathname: string; query: string }) {
  const navigate = useNavigate();
  const q = query.trim().toLowerCase();
  const hit = (label: string) => !q || label.toLowerCase().includes(q);
  const statics = (sub: string) => nav.filter((n) => n.section === `Backend/${sub}` && hit(n.label));
  const item = (n: NavContribution) => (
    <TexoNavItem active={pathname === n.path} icon={n.icon} key={n.path} label={n.label} onClick={() => navigate(n.path)} />
  );

  if (!manifest) {
    return (
      <BaseText c="dimmed" px="sm" size="sm">
        Host not reachable on :4321
      </BaseText>
    );
  }

  const content = manifest.entities.filter((e) => !manifest.system.includes(e.name) && hit(e.name));
  const schemaStatics = statics('Schema');
  const settings = statics('Settings');

  return (
    <BaseStack gap={2}>
      {content.length > 0 && (
        <TexoNavSection label="Content">
          {content.map((e) => (
            <TexoNavItem
              active={pathname === `/admin/content/${e.name}`}
              icon={<IconTable size={16} />}
              key={e.name}
              label={e.name}
              onClick={() => navigate(`/admin/content/${e.name}`)}
            />
          ))}
        </TexoNavSection>
      )}
      {(content.length > 0 || schemaStatics.length > 0) && (
        <TexoNavSection label="Schema">
          {content.map((e) => (
            <TexoNavItem
              active={pathname === `/admin/schema/${e.name}`}
              icon={<IconDatabase size={16} />}
              key={e.name}
              label={e.name}
              onClick={() => navigate(`/admin/schema/${e.name}`)}
            />
          ))}
          {schemaStatics.map(item)}
        </TexoNavSection>
      )}
      {settings.length > 0 && <TexoNavSection label="Settings">{settings.map(item)}</TexoNavSection>}
      {q && content.length === 0 && schemaStatics.length === 0 && settings.length === 0 && (
        <BaseText c="dimmed" px="sm" size="sm">
          No matches
        </BaseText>
      )}
    </BaseStack>
  );
}
