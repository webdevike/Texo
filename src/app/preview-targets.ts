import type { AgentTarget } from '../context/agent-context';

export function describePreviewTarget(element: Element, content: Element) {
  const keys: string[] = [];
  let node: Element | null = element;
  while (node && node !== content) {
    const key = (node as HTMLElement).dataset.target;
    if (key) keys.unshift(key);
    node = node.parentElement;
  }
  const data = (element as HTMLElement).dataset;
  return {
    target: keys.join('.'),
    targetLabel: data.targetLabel ?? keys[keys.length - 1] ?? 'Element',
    record: data.record ?? null,
    recordLabel: data.record ? (data.recordLabel ?? data.record) : null,
    template: data.recordTemplate !== undefined,
  };
}

/** Read at send time: preview interactions need not rerender the host app. */
export function collectPreviewTargets(frame: HTMLIFrameElement | null): AgentTarget[] {
  const document = frame?.contentDocument;
  const view = document?.defaultView;
  if (!document?.body || !view) return [];
  const seen = new Set<string>();
  const targets: AgentTarget[] = [];
  for (const element of document.body.querySelectorAll<HTMLElement>('[data-target]')) {
    const rect = element.getBoundingClientRect();
    if (
      !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) ||
      rect.width <= 0 || rect.height <= 0 ||
      rect.bottom <= 0 || rect.right <= 0 ||
      rect.top >= view.innerHeight || rect.left >= view.innerWidth
    ) continue;
    const target = describePreviewTarget(element, document.body);
    const identity = JSON.stringify([target.target, target.record]);
    if (!target.target || seen.has(identity)) continue;
    seen.add(identity);
    targets.push({
      key: target.target,
      label: target.targetLabel,
      record: target.record ?? undefined,
      recordLabel: target.recordLabel ?? undefined,
    });
  }
  return targets;
}
