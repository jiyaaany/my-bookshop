/**
 * Minimal observable store built on React's `useSyncExternalStore`.
 *
 * Deliberately dependency-free (no zustand/redux) per the "가벼운 클라이언트 상태"
 * constraint. It gives us a single source of truth that the UI subscribes to,
 * and that the persistence layer (Repository ↔ SyncEngine) can hydrate/flush.
 */

import { useSyncExternalStore } from 'react';

export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState: Store<T>['setState'] = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

/** Subscribe a component to a slice of a store. */
export function useStore<T extends object, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
