// The "Backend" rail: what the Strapi-style admin knew, rendered as Texo sidebar sections
// that honor config.sidebar. Reads only the manifest; names no entity or adapter (P5).
import { IconDatabase, IconPlus, IconSearch, IconSettings, IconTable } from '@tabler/icons-react';
import { TexoNavItem, TexoNavSection, BaseStack, BaseText, BaseTextInput } from '@texo/ui';
import { useNavigate } from 'react-router-dom';

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

export function BackendNav({ manifest, pathname, query }: { manifest: Manifest | undefined; pathname: string; query: string }) {
  const navigate = useNavigate();
  const q = query.trim().toLowerCase();
  const hit = (label: string) => !q || label.toLowerCase().includes(q);

  if (!manifest) {
    return (
      <BaseText c="dimmed" px="sm" size="sm">
        Host not reachable on :4321
      </BaseText>
    );
  }

  const content = manifest.entities.filter((e) => !manifest.system.includes(e.name) && hit(e.name));
  const showNew = hit('new entity');
  const showSystem = hit('system');

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
      {(content.length > 0 || showNew) && (
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
          {showNew && (
            <TexoNavItem
              active={pathname === '/admin/schema/new'}
              icon={<IconPlus size={16} />}
              label="New entity"
              onClick={() => navigate('/admin/schema/new')}
            />
          )}
        </TexoNavSection>
      )}
      {showSystem && (
        <TexoNavSection label="Settings">
          <TexoNavItem
            active={pathname === '/admin/system'}
            icon={<IconSettings size={16} />}
            label="System"
            onClick={() => navigate('/admin/system')}
          />
        </TexoNavSection>
      )}
      {q && content.length === 0 && !showNew && !showSystem && (
        <BaseText c="dimmed" px="sm" size="sm">
          No matches
        </BaseText>
      )}
    </BaseStack>
  );
}
