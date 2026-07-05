import { useQuery } from '@apollo/client/react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import CustomClassEditor from '@/components/classes/custom-class-editor';
import { GET_CLASS_DETAILS } from '@/graphql/class.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { ClassDetailsQuery, ClassDetailsQueryVariables } from '@/types/generated_graphql_types';

export default function EditCustomClassRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, loading, error } = useQuery<ClassDetailsQuery, ClassDetailsQueryVariables>(GET_CLASS_DETAILS, { variables: { value: id } });
    if (loading) return <View style={styles.state}><ActivityIndicator color={fantasyTokens.colors.gold} /><Text style={styles.text}>Loading custom class...</Text></View>;
    if (error || !data?.classDetails?.isCustom) return <View style={styles.state}><Text style={styles.error}>{error?.message ?? 'Custom class not found.'}</Text></View>;
    return <CustomClassEditor initial={data.classDetails} />;
}

const styles = StyleSheet.create({ state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: fantasyTokens.spacing.md, backgroundColor: fantasyTokens.colors.night }, text: { color: fantasyTokens.colors.gold }, error: { color: fantasyTokens.colors.crimson } });
