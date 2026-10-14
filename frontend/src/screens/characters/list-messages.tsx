import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/buttons';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { WarningIcon } from '@/components/warning-icon';
import { useAnnouncement } from '@/hooks/use-announcement';
import { colors, fonts, typography } from '@/theme';

import { useCardScale } from './card-scale';

/** The first-load status line, which native screen readers are also told. */
const LOADING_STATUS = 'Loading characters…';

/**
 * Announces a settled search outcome. The empty web region stays mounted so its later text is read.
 *
 * @param props.message - The settled outcome, or null while typing, loading, or showing a list.
 */
export function SearchResultsStatus({ message }: { message: string | null }) {
    useAnnouncement(message);

    if (Platform.OS !== 'web') return null;

    return (
        <View accessible role="status" style={styles.visuallyHidden}>
            <Text>{message}</Text>
        </View>
    );
}

/** The spinner in the space the list will fill, over a status line. */
export function Loading() {
    const { wide } = useCardScale();
    useAnnouncement(LOADING_STATUS);

    return (
        <View style={[styles.loading, wide && styles.wideLoading]}>
            <Spinner size={wide ? 44 : 36} />
            <Text
                role="status"
                style={[wide ? typography.statusDesktop : typography.status, styles.dim]}
            >
                {LOADING_STATUS}
            </Text>
        </View>
    );
}

/**
 * A dashed card standing in for the list when there's nothing in it.
 *
 * @param props.title - The bold first line, saying what's missing.
 * @param props.body - The line under it, saying what to do about it.
 */
export function EmptyCard({ title, body }: { title: string; body: string }) {
    const { wide } = useCardScale();

    return (
        <View style={[styles.emptyCard, wide && styles.wideEmptyCard]}>
            <MessageHeading>{title}</MessageHeading>
            <MessageBody>{body}</MessageBody>
        </View>
    );
}

/**
 * The notice for an API URL or token missing from `frontend/.env`. It speaks to a developer, and has
 * no Try again, because the setting is built into the bundle when Metro starts.
 *
 * @param props.variable - The unset variable to name, such as `EXPO_PUBLIC_API_URL`.
 */
export function MisconfiguredNotice({ variable }: { variable: string }) {
    return (
        <Notice title="API settings missing" development>
            <MessageBody>
                <Text style={styles.strong}>{variable}</Text>
                {
                    " isn't set. Copy frontend/.env.example to frontend/.env, fill it in, then restart Expo."
                }
            </MessageBody>
        </Notice>
    );
}

/**
 * The temporary notice for a rejected development token. It speaks to a developer, and goes when
 * sign-in arrives. It has no Try again, because retrying can't help until the token changes.
 */
export function SignedOutNotice() {
    return (
        <Notice title="Not signed in" development>
            <MessageBody>
                The API rejected the development token. Set{' '}
                <Text style={styles.strong}>EXPO_PUBLIC_API_TOKEN</Text> in frontend/.env to the
                token bin/rails db:seed prints, then restart Expo.
            </MessageBody>
        </Notice>
    );
}

/**
 * The notice for a network error or any error status but 401.
 *
 * @param props.onRetry - Called by Try again to repeat the request that failed.
 */
export function FailedNotice({ onRetry }: { onRetry: () => void }) {
    return (
        <Notice title="Couldn't load your characters">
            <MessageBody>
                {
                    "Check your connection and try again. If that doesn't work, the server may be having trouble."
                }
            </MessageBody>
            <SecondaryButton
                label="Try again"
                size="medium"
                onPress={onRetry}
                style={styles.retry}
            />
        </Notice>
    );
}

type NoticeProps = {
    title: string;
    development?: boolean;
    children: ReactNode;
};

/**
 * A warning strip: an accent edge and icon on the left, then the message. Announced as an alert.
 *
 * @param props.title - The heading, saying what went wrong. Native screen readers are told it when
 *   the notice appears, since they don't announce alerts on their own.
 * @param props.development - Marks copy that's meant to go away, such as the temporary signed out
 *   message, with a dashed border and a "Development only" label.
 * @param props.children - What follows the heading: the explanation and any button.
 */
function Notice({ title, development = false, children }: NoticeProps) {
    const { wide } = useCardScale();
    useAnnouncement(title);

    return (
        <View
            role="alert"
            style={[
                styles.notice,
                wide && styles.wideNotice,
                development ? styles.developmentNotice : styles.plainNotice,
                development && wide && styles.wideDevelopmentNotice,
            ]}
        >
            {/* The dashed border can only be one style all round, so a solid edge covers its
                left side. */}
            {development && <View style={styles.developmentEdge} />}
            <View style={wide ? styles.wideIcon : styles.icon}>
                <WarningIcon color={colors.accentText} size={wide ? 20 : 18} />
            </View>
            <View style={styles.message}>
                {development && (
                    <Text style={[typography.smallLabel, styles.developmentLabel]}>
                        Development only
                    </Text>
                )}
                <MessageHeading>{title}</MessageHeading>
                {children}
            </View>
        </View>
    );
}

/** The bold first line of an empty card or a notice. */
function MessageHeading({ children }: { children: ReactNode }) {
    const { wide } = useCardScale();

    return (
        <Heading
            level={2}
            style={[wide ? styles.wideHeading : styles.heading, styles.headingSpacing]}
        >
            {children}
        </Heading>
    );
}

/**
 * The dim explanation under a message's heading.
 *
 * @param props.children - The text, which may include bold runs.
 */
function MessageBody({ children }: { children: ReactNode }) {
    const { wide } = useCardScale();

    return <Text style={[wide ? styles.wideBody : typography.body, styles.dim]}>{children}</Text>;
}

/** Width of the notice's solid left edge. */
const EDGE_WIDTH = 4;
/** Width of the development notice's dashed border, which the solid edge sits over. */
const DASHED_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
    visuallyHidden: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    loading: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingBottom: 12,
    },
    wideLoading: {
        gap: 16,
        paddingBottom: 44,
    },
    dim: {
        color: colors.dim,
    },
    emptyCard: {
        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 20,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.structural,
    },
    wideEmptyCard: {
        paddingTop: 22,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    notice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 11,
        paddingTop: 16,
        paddingRight: 16,
        paddingBottom: 18,
        paddingLeft: 14,
        backgroundColor: colors.card,
    },
    wideNotice: {
        gap: 13,
        paddingTop: 22,
        paddingRight: 24,
        paddingBottom: 24,
        paddingLeft: 20,
    },
    plainNotice: {
        borderLeftWidth: EDGE_WIDTH,
        borderLeftColor: colors.accentText,
    },
    // The dashed border is narrower than the solid edge, so the padding makes up the difference
    // and the text lines up with a plain notice's.
    developmentNotice: {
        borderWidth: DASHED_BORDER_WIDTH,
        borderStyle: 'dashed',
        borderColor: colors.structural,
        paddingTop: 16 - DASHED_BORDER_WIDTH,
        paddingRight: 16 - DASHED_BORDER_WIDTH,
        paddingBottom: 18 - DASHED_BORDER_WIDTH,
        paddingLeft: 14 + EDGE_WIDTH - DASHED_BORDER_WIDTH,
    },
    wideDevelopmentNotice: {
        paddingTop: 22 - DASHED_BORDER_WIDTH,
        paddingRight: 24 - DASHED_BORDER_WIDTH,
        paddingBottom: 24 - DASHED_BORDER_WIDTH,
        paddingLeft: 20 + EDGE_WIDTH - DASHED_BORDER_WIDTH,
    },
    developmentEdge: {
        position: 'absolute',
        // Out over the border, which absolute positions are measured inside of.
        top: -DASHED_BORDER_WIDTH,
        bottom: -DASHED_BORDER_WIDTH,
        left: -DASHED_BORDER_WIDTH,
        width: EDGE_WIDTH,
        backgroundColor: colors.accentText,
    },
    icon: {
        marginTop: 2,
    },
    wideIcon: {
        marginTop: 3,
    },
    message: {
        flex: 1,
        minWidth: 0,
    },
    developmentLabel: {
        marginTop: 3,
        marginBottom: 8,
        color: colors.dim,
    },
    // Headings are set 1.25 times their size, so one that wraps stays tight.
    heading: {
        ...typography.namePhone,
        lineHeight: 20.5,
    },
    wideHeading: {
        ...typography.nameDesktop,
        lineHeight: 24,
    },
    headingSpacing: {
        marginBottom: 5,
        color: colors.text,
    },
    wideBody: {
        ...typography.bodyDesktop,
        // 64 characters of Space Grotesk at 14 points, whose digits are 0.641 em wide.
        maxWidth: 574,
    },
    strong: {
        fontFamily: fonts.bold,
        color: colors.text,
    },
    retry: {
        alignSelf: 'flex-start',
        marginTop: 14,
    },
});
