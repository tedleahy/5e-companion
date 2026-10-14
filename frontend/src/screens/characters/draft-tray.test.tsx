import { render, screen } from '@testing-library/react-native';

import type { Draft } from '@/api/characters';

import { DraftTray } from './draft-tray';

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

const creation: Draft = {
    id: '11',
    kind: 'creation',
    name: 'Nyra Ashfall',
    completed_choices: 2,
    total_choices: 5,
    next_step: 'choose_class',
};

describe('DraftTray', () => {
    it('shows each draft in order under its heading', async () => {
        await render(<DraftTray drafts={[creation, levelUp]} />);

        expect(screen.getByRole('heading', { name: 'Waiting to be finished' })).toBeOnTheScreen();

        expect(screen.getAllByRole('heading').map((heading) => heading.props.children)).toEqual([
            'Waiting to be finished',
            'Nyra Ashfall',
            'Kethra Ironsong',
        ]);
    });

    it('draws the dashed rule that separates it from the characters below', async () => {
        await render(<DraftTray drafts={[creation]} />);

        expect(screen.getByTestId('dashed-rule')).toBeOnTheScreen();
    });

    it('leaves the rule out when it is alone on the list', async () => {
        await render(<DraftTray drafts={[creation]} alone />);

        expect(screen.queryByTestId('dashed-rule')).toBeNull();
    });
});
