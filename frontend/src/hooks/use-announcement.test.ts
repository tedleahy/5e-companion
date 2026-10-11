import { renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { useAnnouncement } from './use-announcement';

let announce: jest.SpyInstance;

beforeEach(() => {
    announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();
    // React Native's Jest setup already mocks this, so the spy is that mock, calls and all.
    announce.mockClear();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useAnnouncement', () => {
    it('announces the message when it first appears', async () => {
        await renderHook(() => useAnnouncement('Loading characters…'));

        expect(announce).toHaveBeenCalledTimes(1);

        expect(announce).toHaveBeenCalledWith('Loading characters…');
    });

    it('announces again only when the message changes', async () => {
        const { rerender } = await renderHook(
            ({ message }: { message: string | null }) => useAnnouncement(message),
            { initialProps: { message: null } },
        );

        expect(announce).not.toHaveBeenCalled();

        await rerender({ message: 'Searching…' });
        await rerender({ message: 'Searching…' });

        expect(announce).toHaveBeenCalledTimes(1);

        await rerender({ message: null });
        await rerender({ message: 'Searching…' });

        expect(announce).toHaveBeenCalledTimes(2);
    });

    it('leaves the web to its live regions', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');

        await renderHook(() => useAnnouncement('Loading characters…'));

        expect(announce).not.toHaveBeenCalled();
    });
});
