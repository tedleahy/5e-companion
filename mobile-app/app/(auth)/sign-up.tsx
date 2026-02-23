import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, HelperText, Snackbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import TextField from '@/components/TextField';
import { styles } from '../../styles/authStyles';
import { supabase } from '@/lib/supabase';
import useSessionGuard from '@/hooks/useSessionGuard';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();
    const { checkSession } = useSessionGuard({
        runOnMount: false,
        shouldRedirectOnInvalidSession: false,
    });

    const [showSignUpFailed, setShowSignUpFailed] = useState(false);

    const passwordsMatch = password.length > 0 && password === confirmPassword;

    async function handleSignUp() {
        if (!email || !passwordsMatch) return;

        await supabase.auth.signUp({ email, password });
        const hasValidSession = await checkSession();

        if (!hasValidSession) {
            setShowSignUpFailed(true);
            return;
        }

        router.replace('/');
    }

    return (
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
            <Snackbar
                visible={showSignUpFailed}
                onDismiss={() => setShowSignUpFailed(false)}
                onIconPress={() => setShowSignUpFailed(false)}
                wrapperStyle={styles.snackbarWrapper}
            >
                Sign up FAILED :( pls try again later xx
            </Snackbar>

            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>
                    Sign up
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Forge a new account to track spells, characters, and party loot.
                </Text>
            </View>

            <Card style={styles.card} mode="outlined">
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Create Your Account
                    </Text>
                    <Divider style={styles.divider} />

                    <TextField
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    <TextField
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TextField
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <HelperText
                        type={passwordsMatch ? 'info' : 'error'}
                        visible={confirmPassword.length > 0}
                    >
                        {passwordsMatch ? 'Passwords match!' : 'Passwords do not match yet.'}
                    </HelperText>

                    <Button
                        mode="contained"
                        style={styles.primaryButton}
                        contentStyle={styles.primaryButtonContent}
                        buttonColor={fantasyTokens.colors.crimson}
                        textColor={fantasyTokens.colors.parchment}
                        onPress={handleSignUp}
                    >
                        Create Account
                    </Button>

                    <Button
                        mode="outlined"
                        style={styles.secondaryButton}
                        textColor={fantasyTokens.colors.crimson}
                        onPress={() => router.back()}
                    >
                        I already have an account
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}
