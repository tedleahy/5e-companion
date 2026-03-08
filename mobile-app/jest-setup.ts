import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useLocalSearchParams: () => ({}),
    Redirect: ({ href }: { href: string }) => null,
    Stack: () => null,
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
            signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
            signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
        },
    },
}));
