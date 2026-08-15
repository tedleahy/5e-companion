import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { DocumentNode } from 'graphql';
import { PaperProvider } from 'react-native-paper';
import { waitFor } from '@/test-utils/waitFor';

export function renderBrowseScreen(
    Component: ComponentType,
    query: DocumentNode,
    data: Record<string, unknown>,
) {
    return render(
        <MockedProvider
            mocks={[{ request: { query }, result: { data } }]}
            mockLinkDefaultOptions={{ delay: 0 }}
            showWarnings={false}
        >
            <PaperProvider><Component /></PaperProvider>
        </MockedProvider>,
    );
}

export async function returnToListAndHideSrd() {
    fireEvent.press(screen.getByTestId('compendium-detail-back'));
    await waitFor(() => expect(screen.getByTestId('compendium-collection-list')).toBeTruthy());
    fireEvent(screen.getByRole('switch'), 'valueChange', false);
}
