import { createClient, SupportedStorage } from '@supabase/supabase-js';
const isChromeExtension = typeof chrome !== "undefined" && !!chrome.storage?.local;
const storageAdapter: SupportedStorage = isChromeExtension
  ? {
      getItem: async (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            const value = result[key];
            resolve(typeof value === "string" ? value : null);
          });
        });
      },
      setItem: async (key: string, value: string): Promise<void> => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => resolve());
        });
      },
      removeItem: async (key: string): Promise<void> => {
        return new Promise((resolve) => {
          chrome.storage.local.remove([key], () => resolve());
        });
      },
    }
  : {
      getItem: async (key: string): Promise<string | null> =>
        Promise.resolve(localStorage.getItem(key)),
      setItem: async (key: string, value: string): Promise<void> => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: async (key: string): Promise<void> => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_API_KEY
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: storageAdapter,
    persistSession: true,
    autoRefreshToken: true,
  }
});