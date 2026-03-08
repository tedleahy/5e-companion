/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['./jest-setup.ts'],
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/.expo/',
    ],
    moduleNameMapper: {
        '^@expo/vector-icons$': '<rootDir>/test-mocks/expo-vector-icons.tsx',
        '^@expo/vector-icons/(.*)$': '<rootDir>/test-mocks/expo-vector-icons.tsx',
        '^react-native-vector-icons/(.*)$': '<rootDir>/test-mocks/expo-vector-icons.tsx',
        '^@/(.*)$': '<rootDir>/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-paper|react-native-vector-icons|@expo/vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-async-storage/async-storage|react-native-url-polyfill|@supabase/.*|rxjs)',
    ],
};
