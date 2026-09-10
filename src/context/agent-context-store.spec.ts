import { describe, expect, it } from 'vitest';
import type { AgentCanvasContext, AgentPreviewContext } from './agent-context';
import { createAgentContextStore } from './agent-context-store';

const preview: AgentPreviewContext = {
  page: { status: 'ready', value: { id: 'customers', label: 'Customers', sourcePath: 'preview/src/pages/accounts.tsx', previewUrl: '/preview/pages/customers' } },
  targets: { status: 'ready', value: [] },
};

const canvas: AgentCanvasContext = {
  mode: 'design',
  selection: { status: 'ready', value: { instanceId: 'instance-1', componentId: 'customer-card', label: 'Customer card', props: { customer: { name: 'Original' } } } },
  requests: { status: 'ready', value: [] },
};

describe('workspace agent context', () => {
  it('keeps a sent snapshot detached when selection props or the active route change', () => {
    const source = structuredClone(canvas);
    const store = createAgentContextStore('/canvas', 'Canvas');
    store.publish('canvas', source);
    const sent = store.capture();
    if (source.selection.status !== 'ready' || !source.selection.value) throw new Error('Missing fixture selection');
    const customer = source.selection.value.props.customer;
    if (!customer || typeof customer !== 'object' || !('name' in customer)) throw new Error('Missing fixture customer');
    customer.name = 'Changed';
    store.setRoute('/theme', 'Theme');
    expect(sent.canvas?.selection).toEqual(canvas.selection);
    expect(sent.route).toBe('/canvas');
    expect(store.capture()).toMatchObject({ route: '/theme', surface: 'workspace' });
    expect(store.capture().canvas).toBeUndefined();
  });

  it('reads fresh preview state at capture rather than retaining stale rendered targets', () => {
    const store = createAgentContextStore('/pages/customers', 'Page preview');
    const changed: AgentPreviewContext = {
      ...preview,
      targets: { status: 'ready', value: [
        { key: 'page.table.row', label: 'Customer', record: 'one' },
        { key: 'page.table.row', label: 'Customer', record: 'two' },
      ] },
    };
    store.publish('preview', preview, () => changed);
    const snapshot = store.capture();
    expect(snapshot.preview?.targets).toEqual(changed.targets);
    expect(snapshot.preview?.page).toEqual(preview.page);
    expect(snapshot.label).toBe('Customers');
    expect(store.getSnapshot().preview?.targets).toEqual(changed.targets);
    store.setRoute('/canvas', 'Canvas');
    expect(store.capture().preview).toBeUndefined();
  });

  it('distinguishes an unavailable source from a known empty selection', () => {
    const store = createAgentContextStore('/canvas', 'Canvas');
    expect(store.capture().canvas?.selection.status).toBe('loading');
    store.publish('canvas', { ...canvas, selection: { status: 'ready', value: null } });
    expect(store.capture().canvas?.selection).toEqual({ status: 'ready', value: null });
    store.publish('canvas', { ...canvas, selection: { status: 'unavailable', reason: 'Canvas document failed to load.' } });
    expect(store.capture().canvas?.selection).toEqual({ status: 'unavailable', reason: 'Canvas document failed to load.' });
  });
});
