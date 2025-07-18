import { writable, type Writable } from "svelte/store";
import { browser } from '$app/environment';

function createPersistentStore(key : string, initialValue : any) {
  
  let startValue = initialValue;
  if (browser) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        startValue = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored value:', e);
      }
    }
  }

  const { subscribe, set, update } = writable(startValue);

  return {
    subscribe,
    set: (value : any) => {
      if (browser) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      set(value);
    },
    update: (fn : (val: any) => any) => {
      update((value) => {
        const newValue = fn(value);
        if (browser) {
          localStorage.setItem(key, JSON.stringify(newValue));
        }
        return newValue;
      });
    },
    // Load from localStorage on initialization
    load: () => {
      if (browser) {
        const stored = localStorage.getItem(key);
        if (stored) {
          set(JSON.parse(stored));
        }
      }
    },
    clear: () => {
      if (browser) {
        localStorage.removeItem(key);
      }
      set(initialValue);
    }
  };
}

export const loading : Writable<boolean> = writable(false);

export const token : Writable<string> = createPersistentStore('token', "");
export const permisos : Writable<string[]> = createPersistentStore('permisos', []);