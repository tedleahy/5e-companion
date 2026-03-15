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

jest.mock('react-native-pager-view', () => ({
    __esModule: true,
    default: require('react').forwardRef(function MockPagerView(props: any, ref: any) {
        const { children, initialPage, onPageSelected, style, ...rest } = props;
        const React = require('react');
        const { View } = require('react-native');
        void initialPage;
        void onPageSelected;
        React.useImperativeHandle(ref, () => ({
            setPage: jest.fn(),
            setPageWithoutAnimation: jest.fn(),
        }));
        return React.createElement(View, { ...rest, style }, children);
    }),
}));

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardProvider: ({ children }: any) => children,
    KeyboardAwareScrollView: require('react').forwardRef(function MockKeyboardAwareScrollView(props: any, ref: any) {
        const { bottomOffset, ...restProps } = props;
        const React = require('react');
        const { ScrollView } = require('react-native');
        void bottomOffset;
        return React.createElement(ScrollView, { ...restProps, ref }, props.children);
    }),
}));
