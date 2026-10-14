import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Draft } from '@/api/characters';

import { CardScaleProvider } from './card-scale';
import { DraftCard } from './draft-card';

const levelUp: Draft = {
    id: '10',
    kind: 'level_up',
    character_id: '6',
    character_name: 'Kethra Ironsong',
    from_level: 3,
    to_level: 4,
    completed_choices: 3,
    total_choices: 5,
    next_step: 'ability_score_or_feat',
};

const unnamedCreation: Draft = {
    id: '11',
    kind: 'creation',
    name: null,
    completed_choices: 1,
    total_choices: 5,
    next_step: 'choose_class',
};

describe('DraftCard', () => {
    it('uses the short copy and a plain Resume label on a phone', async () => {
        await render(<DraftCard draft={levelUp} />);

        expect(screen.getByRole('heading', { name: 'Kethra Ironsong' })).toBeOnTheScreen();

        expect(
            screen.getByText(
                'Level 3 to 4, three of five choices made. Nothing changes on the sheet until you confirm.',
            ),
        ).toBeOnTheScreen();

        expect(screen.getByText('Resume')).toBeOnTheScreen();
    });

    it('uses the long copy and names the kind of draft from tablet up', async () => {
        await render(
            <CardScaleProvider wide>
                <DraftCard draft={levelUp} />
            </CardScaleProvider>,
        );

        expect(
            screen.getByRole('heading', { name: 'Kethra Ironsong, level 3 to 4' }),
        ).toBeOnTheScreen();

        expect(screen.getByText('Resume level-up')).toBeOnTheScreen();
    });

    it('names the draft in the Resume button for screen readers', async () => {
        await render(<DraftCard draft={unnamedCreation} />);

        expect(
            screen.getByRole('button', { name: 'Resume creating a new character' }),
        ).toBeOnTheScreen();
    });

    it('calls onResume when Resume is pressed', async () => {
        const onResume = jest.fn();
        await render(<DraftCard draft={levelUp} onResume={onResume} />);

        await fireEvent.press(
            screen.getByRole('button', { name: "Resume Kethra Ironsong's level-up" }),
        );

        expect(onResume).toHaveBeenCalledTimes(1);
    });
});
