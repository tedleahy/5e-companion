import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBreakpoint } from '@/hooks/use-breakpoint';
import { colors, typography } from '@/theme';

/** Placeholder for the character list, until it is built against the API. */
export function Characters() {
  const breakpoint = useBreakpoint();

  return (
    <SafeAreaView style={styles.screen}>
      <Text
        role="heading"
        style={[breakpoint === 'phone' ? typography.titlePhone : typography.titleDesktop, styles.title]}
      >
        Characters
      </Text>
      <Text style={[typography.subtitle, styles.subtitle]}>Your characters will show up here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    backgroundColor: colors.paper,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    color: colors.dim,
  },
});
