import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Minimal async storage contract expected by Supabase auth.
 */
type SupabaseStorageAdapter = {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
};

/**
 * Returns true when browser-only storage APIs are available.
 */
function canUseWebStorage(): boolean {
    return Platform.OS === 'web'
        && typeof window !== 'undefined'
        && typeof window.localStorage !== 'undefined';
}

/**
 * Minimal async storage shim for server-side web rendering.
 */
const noopStorage: SupabaseStorageAdapter = {
    async getItem() {
        return null;
    },
    async setItem() {
    },
    async removeItem() {
    },
};

/**
 * Web storage adapter backed by localStorage when running in the browser.
 */
const webStorage: SupabaseStorageAdapter = {
    async getItem(key: string) {
        if (!canUseWebStorage()) return null;
        return window.localStorage.getItem(key);
    },
    async setItem(key: string, value: string) {
        if (!canUseWebStorage()) return;
        window.localStorage.setItem(key, value);
    },
    async removeItem(key: string) {
        if (!canUseWebStorage()) return;
        window.localStorage.removeItem(key);
    },
};

/**
 * Supabase stores different keys:
 *  - `sb-<project>-auth-token` (large)
 *  - refresh/metadata keys (small)
 *
 * We route large blobs to AsyncStorage because they're too big for SecureStorage's 2Kb limit
 */
const nativeStorage: SupabaseStorageAdapter = {
    getItem: async (key: string) => key.includes('auth-token')
        ? AsyncStorage.getItem(key)
        : SecureStore.getItemAsync(key),

    setItem: async (key: string, value: string) => key.includes('auth-token')
        ? AsyncStorage.setItem(key, value)
        : SecureStore.setItemAsync(key, value),

    removeItem: async (key: string) => key.includes('auth-token')
        ? AsyncStorage.removeItem(key)
        : SecureStore.deleteItemAsync(key),
};

/**
 * Chooses the correct auth storage for the current runtime.
 */
function createSupabaseStorage(): SupabaseStorageAdapter {
    if (Platform.OS === 'web') {
        return canUseWebStorage() ? webStorage : noopStorage;
    }

    return nativeStorage;
}

/** Runtime-specific storage passed into the Supabase auth client. */
const supabaseStorage = createSupabaseStorage();

/** Session persistence should only run when a real client-side storage exists. */
const shouldPersistSession = Platform.OS !== 'web' || canUseWebStorage();

/** Token refresh should only run in client runtimes that can hold a session. */
const shouldAutoRefreshToken = Platform.OS !== 'web' || canUseWebStorage();

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
        auth: {
            storage: supabaseStorage,
            persistSession: shouldPersistSession,
            autoRefreshToken: shouldAutoRefreshToken,
            detectSessionInUrl: false,
        },
    }
);
