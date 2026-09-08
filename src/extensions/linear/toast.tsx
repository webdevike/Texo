// Rejected optimistic writes surface here: a module-level queue any code can push to, rendered
// as stacked BaseNotifications in the corner by whichever page mounts <Toasts />.
import { BaseNotification, BaseStack } from '@texo/ui';
import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

let next = 1;
let toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();
const emit = () => listeners.forEach((fn) => fn(toasts));

export function notify(message: string, ttlMs = 4000) {
  const id = next++;
  toasts = [...toasts, { id, message }];
  emit();
  window.setTimeout(() => dismiss(id), ttlMs);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function Toasts() {
  const [items, setItems] = useState(toasts);
  useEffect(() => {
    listeners.add(setItems);
    return () => { listeners.delete(setItems); };
  }, []);
  if (!items.length) return null;
  return (
    <BaseStack data-toasts gap="xs" style={{ position: 'fixed', right: 16, bottom: 16, width: 320, zIndex: 400 }}>
      {items.map((t) => (
        <BaseNotification color="red" key={t.id} onClose={() => dismiss(t.id)} title="Change rejected" withBorder>
          {t.message}
        </BaseNotification>
      ))}
    </BaseStack>
  );
}
