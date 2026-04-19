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

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({
            addListener: jest.fn(),
            dispatch: jest.fn(),
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
    };
});

// Mock Animated to run synchronously in tests.
// NOTE: We mutate RN.Animated in place instead of spreading ...RN, because the react-native
// index uses lazy getters (DevMenu, SettingsManager, etc.) that call TurboModuleRegistry.getEnforcing
// at access time and throw under Jest. Spreading triggers every getter and breaks the test suite.
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    const done = { finished: true };
    const syncAnim = {
        timing: (value: any, config: any) => ({
            start: (callback?: (result: { finished: boolean }) => void) => {
                value.setValue(config.toValue);
                callback?.(done);
            },
            stop: () => {},
            reset: () => {},
        }),
        parallel: (animations: any[]) => ({
            start: (callback?: (result: { finished: boolean }) => void) => {
                animations.forEach(anim => anim.start());
                callback?.(done);
            },
            stop: () => {},
            reset: () => {},
        }),
        spring: (value: any, config: any) => ({
            start: (callback?: (result: { finished: boolean }) => void) => {
                value.setValue(config.toValue);
                callback?.(done);
            },
            stop: () => {},
            reset: () => {},
        }),
        sequence: (animations: any[]) => ({
            start: (callback?: (result: { finished: boolean }) => void) => {
                animations.forEach(anim => anim.start());
                callback?.(done);
            },
            stop: () => {},
            reset: () => {},
        }),
        // Loop wraps an inner animation; the real impl reads _isUsingNativeDriver()
        // on it, which our mocked timing/spring don't expose. Return a no-op that
        // just fires the callback once so consumers like Paper's ActivityIndicator
        // don't crash.
        loop: (_animation: any, _config?: any) => ({
            start: (callback?: (result: { finished: boolean }) => void) => {
                callback?.(done);
            },
            stop: () => {},
            reset: () => {},
        }),
    };
    Object.assign(RN.Animated, syncAnim);
    return RN;
});

// BackHandler mocks are set up in beforeEach to allow per-test overrides
beforeEach(() => {
    const { BackHandler } = jest.requireActual('react-native');
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({ remove: jest.fn() }));
});

afterEach(() => {
    jest.clearAllMocks();
});
