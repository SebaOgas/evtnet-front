import { writable, type Writable } from "svelte/store";
import { browser } from '$app/environment';
import type DTOPreferenciaPago from "./dtos/usuarios/DTOPreferenciaPago";
import type DTOPago from "./dtos/usuarios/DTOPago";
import type DTOPagoCompleto from "./dtos/usuarios/DTOPagoCompleto";

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
export const username : Writable<string> = createPersistentStore('username', "");
export const vinculadoMP : Writable<boolean> = createPersistentStore('vinculadoMP', false);
export const user : Writable<{
        nombre: string,
        apellido: string,
        roles: string[]
    } | null> = createPersistentStore('user', null);


export const preferences : Writable<DTOPreferenciaPago[]> = createPersistentStore('preferences', []);
export const pagoCompleto : Writable<DTOPagoCompleto | null> = createPersistentStore('pagoCompleto', null);



export const debugPagos : Writable<boolean> = writable(true);