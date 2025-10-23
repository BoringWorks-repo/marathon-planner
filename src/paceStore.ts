// pacesStore.ts
import { useSyncExternalStore } from "react";

export type Unit = "mi" | "km";
export type Paces = {
  unit: Unit;
  unitLabel: string;   // e.g., "min/mi" | "min/km"
  MP?: string;
  LT?: string;
  GA?: string;
  LR?: string;
  // add others if you compute them
};

let current: Paces | null = null;
const listeners = new Set<() => void>();

export function setPaces(p: Paces | null) {
  current = p;
  listeners.forEach((l) => l());
}

export function getPaces(): Paces | null {
  return current;
}

// React subscription so components re-render when setPaces() runs
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePaces(): Paces | null {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
