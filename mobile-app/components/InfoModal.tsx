import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type InfoModalProps = {
    visible: boolean;
    title: string;
    body: string;
    onClose: () => void;
};

type DisplayContent = {
    title: string;
    body: string;
};

/**
 * Displays a centred parchment card with a title and scrollable body text.
 */
export default function InfoModal({ visible, title, body, onClose }: InfoModalProps) {
    const [displayContent, setDisplayContent] = useState<DisplayContent>({ title: '', body: '' });

    useEffect(() => {
        if (visible) {
            setDisplayContent({ title, body });
        }
    }, [visible, title, body]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.card} onPress={() => {}}>
                    <Text style={styles.title}>{displayContent.title}</Text>
                    <ScrollView
                        style={styles.bodyScroll}
                        contentContainerStyle={styles.bodyContent}
                        showsVerticalScrollIndicator
                    >
                        <Text style={styles.text}>{displayContent.body}</Text>
                    </ScrollView>
                    <Pressable
                        onPress={onClose}
                        style={styles.closeBtn}
                        accessibilityLabel="Close"
                        accessibilityRole="button"
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.gold,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    title: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        color: fantasyTokens.colors.inkDark,
        marginBottom: 10,
        textAlign: 'center',
    },
    bodyScroll: {
        flexShrink: 1,
        marginBottom: 14,
    },
    bodyContent: {
        flexGrow: 1,
    },
    text: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.inkLight,
        lineHeight: 22,
    },
    closeBtn: {
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    closeText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.goldDark,
    },
});
