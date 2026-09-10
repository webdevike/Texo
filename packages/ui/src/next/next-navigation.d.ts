/**
 * Compile-time shim: `next` is not a dependency of this repository (it is a
 * large install for two hooks). Consumers resolve the real types from their
 * own `next`; the emitted declarations for ./index.tsx do not reference this
 * module.
 */
declare module 'next/navigation' {
  export function usePathname(): string;
  export function useRouter(): { push(href: string): void };
}
