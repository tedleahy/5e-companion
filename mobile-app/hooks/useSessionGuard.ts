import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

/**
 * Configuration for {@link useSessionGuard}.
 */
type UseSessionGuardOptions = {
    redirectTo?: string;
    shouldRedirectOnInvalidSession?: boolean;
    runOnMount?: boolean;
};

/**
 * Return shape for the session-guard hook.
 */
type UseSessionGuardResult = {
    hasValidSession: boolean;
    isCheckingSession: boolean;
    checkSession: () => Promise<boolean>;
};

/** Default sign-in route used when guarding protected screens. */
const DEFAULT_REDIRECT_ROUTE = '/(auth)/sign-in';

/**
 * Centralises Supabase session validation for protected screens and auth flows.
 *
 * - `runOnMount: true` performs an immediate session check for route guarding.
 * - `runOnMount: false` exposes `checkSession()` for manual checks (for example after sign-in).
 */
export default function useSessionGuard(options: UseSessionGuardOptions = {}): UseSessionGuardResult {
    const {
        redirectTo = DEFAULT_REDIRECT_ROUTE,
        shouldRedirectOnInvalidSession = true,
        runOnMount = true,
    } = options;
    const router = useRouter();
    const isMountedRef = useRef(true);
    const routerRef = useRef(router);
    const [hasValidSession, setHasValidSession] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(runOnMount);

    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Validates whether a usable Supabase session currently exists.
     */
    const checkSession = useCallback(async (): Promise<boolean> => {
        if (isMountedRef.current) {
            setIsCheckingSession(true);
        }

        try {
            const { data, error } = await supabase.auth.getSession();
            const isValidSession = !error && Boolean(data.session);

            if (isMountedRef.current) {
                setHasValidSession(isValidSession);
            }

            if (!isValidSession && shouldRedirectOnInvalidSession) {
                routerRef.current.replace(redirectTo);
            }

            return isValidSession;
        } catch (error) {
            console.error('Failed to validate Supabase session.', error);

            if (isMountedRef.current) {
                setHasValidSession(false);
            }

            if (shouldRedirectOnInvalidSession) {
                routerRef.current.replace(redirectTo);
            }

            return false;
        } finally {
            if (isMountedRef.current) {
                setIsCheckingSession(false);
            }
        }
    }, [redirectTo, shouldRedirectOnInvalidSession]);

    useEffect(() => {
        if (!runOnMount) return;
        void checkSession();
    }, [checkSession, runOnMount]);

    return {
        hasValidSession,
        isCheckingSession,
        checkSession,
    };
}
