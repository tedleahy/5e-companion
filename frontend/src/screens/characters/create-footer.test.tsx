import { fireEvent, render, screen } from '@testing-library/react-native';

import { CreateFooter } from './create-footer';

describe('CreateFooter', () => {
    it('calls onCreate when Create character is pressed', async () => {
        const onCreate = jest.fn();
        await render(<CreateFooter onCreate={onCreate} />);

        await fireEvent.press(screen.getByRole('button', { name: 'Create character' }));

        expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it('reports its layout so the list can scroll clear of it', async () => {
        const onLayout = jest.fn();
        await render(<CreateFooter onLayout={onLayout} />);

        await fireEvent(screen.getByTestId('create-footer'), 'layout', {
            nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 96 } },
        });

        expect(onLayout).toHaveBeenCalledWith(
            expect.objectContaining({
                nativeEvent: expect.objectContaining({
                    layout: expect.objectContaining({ height: 96 }),
                }),
            }),
        );
    });

    it('lets taps through its clear parts to the list underneath', async () => {
        await render(<CreateFooter />);

        expect(screen.getByTestId('create-footer')).toHaveStyle({ pointerEvents: 'box-none' });
    });
});
