import { Redirect } from 'expo-router';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';

/** Race selection is now part of the identity step. Redirect if navigated to directly. */
export default function StepRaceRedirect() {
    return <Redirect href={CREATE_CHARACTER_ROUTES.identity} />;
}
