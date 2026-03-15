import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, HelperText, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import TextField from '@/components/TextField';
import { supabase } from '@/lib/supabase';
import useSessionGuard from '@/hooks/useSessionGuard';
import { styles } from '../../styles/authStyles';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [invalidLogin, setInvalidLogin] = useState(false);
    const router = useRouter();
    const { checkSession } = useSessionGuard({
        runOnMount: false,
        shouldRedirectOnInvalidSession: false,
    });

    async function handleSignIn() {
        if (!email || !password) return;

        await supabase.auth.signInWithPassword({ email, password });
        const hasValidSession = await checkSession();

        if (!hasValidSession) {
            setInvalidLogin(true);
            return;
        }

        router.replace('/');
    }

    return (
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>
                    Sign in
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Welcome back, adventurer.
                </Text>
            </View>

            <Card style={styles.card} mode="outlined">
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Sign into your account
                    </Text>
                    <Divider style={styles.divider} />

                    <TextField
                        label="Email"
                        value={email}
                        onChangeText={(text: string) => {
                            setEmail(text);
                            setInvalidLogin(false);
                        }}
                        keyboardType="email-address"
                    />

                    <TextField
                        label="Password"
                        value={password}
                        onChangeText={(text: string) => {
                            setPassword(text);
                            setInvalidLogin(false);
                        }}
                        secureTextEntry
                    />

                    <HelperText
                        style={styles.errorText}
                        type="error"
                        visible={invalidLogin}
                    >
                        Invalid email or password. Please try again.
                    </HelperText>

                    <Button
                        mode="contained"
                        style={styles.primaryButton}
                        contentStyle={styles.primaryButtonContent}
                        buttonColor={fantasyTokens.colors.crimson}
                        textColor={fantasyTokens.colors.parchment}
                        onPress={handleSignIn}
                    >
                        Sign In
                    </Button>
                    <Button
                        mode="outlined"
                        style={styles.secondaryButton}
                        textColor={fantasyTokens.colors.goldDark}
                        onPress={() => router.push('/(auth)/sign-up')}
                    >
                        Forge a new account
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}
