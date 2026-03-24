import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import {
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_700Bold,
} from '@expo-google-fonts/spectral';
import apolloClient from './apolloClient';
import { buildFantasyTheme, fantasyTokens } from '../theme/fantasyTheme';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = buildFantasyTheme(colorScheme);
    const [fontsLoaded] = useFonts({
        Spectral_400Regular,
        Spectral_500Medium,
        Spectral_600SemiBold,
        Spectral_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.gestureRoot}>
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    <ApolloProvider client={apolloClient}>
                        <PaperProvider theme={theme}>
                            <KeyboardProvider>
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        contentStyle: { backgroundColor: fantasyTokens.colors.night },
                                        animation: 'fade_from_bottom',
                                        animationDuration: fantasyTokens.motion.standard,
                                    }}
                                >
                                    <Stack.Screen name="(rail)" options={{ animation: 'none' }} />
                                    <Stack.Screen
                                        name="characters/create"
                                        options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                                    />
                                    <Stack.Screen
                                        name="spells/[id]"
                                        options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                                    />
                                </Stack>
                            </KeyboardProvider>
                        </PaperProvider>
                    </ApolloProvider>
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
