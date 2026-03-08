import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SettingsScreen from '../settings';

function renderScreen() {
    return render(
        <PaperProvider>
            <SettingsScreen />
        </PaperProvider>
    );
}

describe('SettingsScreen', () => {
    it('renders the coming-soon placeholder', () => {
        renderScreen();

        expect(screen.getByText('Settings')).toBeTruthy();
        expect(screen.getByText('Coming soon')).toBeTruthy();
    });
});
