// Built-in commands (shell chrome, theme) plus the manifest-driven entity commands, the
// palette wiring and the keybindings help modal. Extension commands come from the registry;
// everything here is what an extension cannot reach (rail state, theme history).
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BaseGroup,
  BaseModal,
  BaseStack,
  BaseText,
  TexoCommandPalette,
  TexoKeys,
  keysOf,
  useHotkeys,
  type HotkeyCommand,
  type TexoPaletteItem,
} from '@texo/ui';

import type { Manifest } from '../admin/client';
import type { CommandContribution } from '../extensions';

export interface ShellCommandHost {
  activeRail: string | null;
  setRail: (id: string | null) => void;
  railIds: string[];
  toggleColorScheme: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** Commands only the shell can implement. `keys` here are the app-wide defaults. */
export function shellCommands(host: ShellCommandHost, ui: { openPalette: () => void; openHelp: () => void }): CommandContribution[] {
  const cycleRail = (dir: 1 | -1) => {
    const ids = host.railIds;
    const at = host.activeRail ? ids.indexOf(host.activeRail) : -1;
    if (at === -1) host.setRail(dir === 1 ? ids[0] : ids[ids.length - 1]);
    else {
      const next = at + dir;
      host.setRail(next < 0 || next >= ids.length ? null : ids[next]);
    }
  };
  return [
    { id: 'shell.palette', label: 'Command palette', keys: 'mod+k', group: 'Shell', run: ui.openPalette },
    { id: 'shell.help', label: 'Keyboard shortcuts', keys: ['?', 'shift+/'], group: 'Shell', run: ui.openHelp },
    { id: 'shell.rail.theme', label: 'Go to Theme', keys: 'g 1', group: 'Rail', run: () => host.setRail('theme') },
    { id: 'shell.rail.pages', label: 'Go to Pages', keys: 'g 2', group: 'Rail', run: () => host.setRail('pages') },
    { id: 'shell.rail.backend', label: 'Go to Backend', keys: 'g 3', group: 'Rail', run: () => host.setRail('backend') },
    { id: 'shell.rail.prev', label: 'Previous rail panel', keys: '[', group: 'Rail', run: () => cycleRail(-1) },
    { id: 'shell.rail.next', label: 'Next rail panel', keys: ']', group: 'Rail', run: () => cycleRail(1) },
    { id: 'shell.rail.close', label: 'Close rail panel', group: 'Rail', run: () => host.setRail(null) },
    { id: 'theme.toggle-scheme', label: 'Toggle color scheme', keys: 't', group: 'Theme', run: host.toggleColorScheme },
    { id: 'theme.undo', label: 'Undo theme change', keys: 'mod+z', group: 'Theme', when: () => host.canUndo, run: host.undo },
    { id: 'theme.redo', label: 'Redo theme change', keys: 'mod+shift+z', group: 'Theme', when: () => host.canRedo, run: host.redo },
  ];
}

/** One `Go to` and one `New` per content entity in the manifest. */
export function entityCommands(manifest: Manifest | undefined): CommandContribution[] {
  if (!manifest) return [];
  return manifest.entities
    .filter((e) => !manifest.system.includes(e.name))
    .flatMap((e) => [
      { id: `entity.${e.name}.go`, label: `Go to ${e.name}`, group: 'Entities', run: ({ navigate }) => navigate(`/admin/content/${e.name}`) },
      { id: `entity.${e.name}.new`, label: `New ${e.name}`, group: 'Entities', run: ({ navigate }) => navigate(`/admin/content/${e.name}?new=1`) },
    ]);
}

function HelpModal({ commands, onClose, opened }: { commands: CommandContribution[]; onClose: () => void; opened: boolean }) {
  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup: Record<string, CommandContribution[]> = {};
    for (const c of commands) {
      if (keysOf(c).length === 0) continue;
      const g = c.group ?? 'Commands';
      if (!byGroup[g]) {
        byGroup[g] = [];
        order.push(g);
      }
      byGroup[g].push(c);
    }
    return order.map((g) => ({ label: g, commands: byGroup[g] }));
  }, [commands]);
  return (
    <BaseModal onClose={onClose} opened={opened} size="md" title="Keyboard shortcuts">
      <BaseStack gap="md">
        {groups.map((group) => (
          <BaseStack gap={4} key={group.label}>
            <BaseText c="dimmed" fw={600} size="xs" tt="uppercase">
              {group.label}
            </BaseText>
            {group.commands.map((c) => (
              <BaseGroup justify="space-between" key={c.id} wrap="nowrap">
                <BaseText size="sm">{c.label}</BaseText>
                <BaseGroup gap="sm">
                  {keysOf(c).map((k) => (
                    <TexoKeys key={k} keys={k} />
                  ))}
                </BaseGroup>
              </BaseGroup>
            ))}
          </BaseStack>
        ))}
      </BaseStack>
    </BaseModal>
  );
}

/**
 * Binds every command's keys, owns the palette + help modal state, and renders both.
 * `commands` = registry commands + shell commands + entity commands, already flattened.
 */
export function useCommands(build: (ui: { openPalette: () => void; openHelp: () => void }) => CommandContribution[]) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [paletteOpened, setPaletteOpened] = useState(false);
  const [helpOpened, setHelpOpened] = useState(false);
  const ui = { openPalette: () => setPaletteOpened(true), openHelp: () => setHelpOpened(true) };
  const commands = build(ui);
  const ctx = { navigate, pathname };
  const visible = commands.filter((c) => c.when?.(ctx) ?? true);

  // The palette is the one binding that must reach through focused inputs (mod+k never
  // collides with typing); the contract has no such flag, so the shell decides here.
  const hotkeys: HotkeyCommand[] = commands.map((c) => ({
    id: c.id,
    keys: c.keys,
    inInputs: c.id === 'shell.palette',
    when: () => c.when?.(ctx) ?? true,
    run: () => void c.run(ctx),
  }));
  useHotkeys(hotkeys);

  const items: TexoPaletteItem[] = visible.map((c) => ({ id: c.id, label: c.label, group: c.group, keys: c.keys }));
  const overlays = (
    <>
      <TexoCommandPalette
        items={items}
        onClose={() => setPaletteOpened(false)}
        onRun={(item) => void commands.find((c) => c.id === item.id)?.run(ctx)}
        opened={paletteOpened}
      />
      <HelpModal commands={commands} onClose={() => setHelpOpened(false)} opened={helpOpened} />
    </>
  );
  return { commands, overlays };
}
