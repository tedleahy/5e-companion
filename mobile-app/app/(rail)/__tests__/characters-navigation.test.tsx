jest.unmock('expo-router');

import React from 'react';
import 'react-native-gesture-handler/jestSetup';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Drawer } from 'expo-router/drawer';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

/**
 * Test-only root stack that mirrors the app-level structure relevant to this regression.
 */
function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(rail)" options={{ animation: 'none' }} />
        </Stack>
    );
}

/**
 * Test-only rail drawer that mirrors the live drawer route structure.
 */
function RailLayout() {
    return (
        <Drawer initialRouteName="characters" screenOptions={{ headerShown: false }}>
            <Drawer.Screen name="characters" />
            <Drawer.Screen name="character/[id]" />
        </Drawer>
    );
}

/**
 * Minimal characters screen used to open a dynamic character route.
 */
function CharactersScreen() {
    const router = useRouter();

    return (
        <Pressable onPress={() => router.push('/character/char-1')} testID="open-character">
            <Text>Open character</Text>
        </Pressable>
    );
}

/**
 * Minimal dynamic character route used by the back-navigation regression test.
 */
function CharacterByIdScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();

    return (
        <Text>{`Character ${id ?? 'unknown'}`}</Text>
    );
}

describe('Characters navigation regression', () => {
    it('returns to /characters with a single back action from /character/[id]', () => {
        renderRouter(
            {
                _layout: RootLayout,
                '(rail)/_layout': RailLayout,
                '(rail)/characters': CharactersScreen,
                '(rail)/character/[id]': CharacterByIdScreen,
            },
            { initialUrl: '/characters' },
        );

        expect(screen).toHavePathname('/characters');
        expect(screen.getByTestId('open-character')).toBeTruthy();

        fireEvent.press(screen.getByTestId('open-character'));

        expect(screen).toHavePathname('/character/char-1');
        expect(screen.getByText('Character char-1')).toBeTruthy();

        testRouter.back('/characters');

        expect(screen).toHavePathname('/characters');
        expect(screen.getByTestId('open-character')).toBeTruthy();
    });
});
