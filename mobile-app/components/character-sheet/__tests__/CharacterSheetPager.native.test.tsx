import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import CharacterSheetPager from '../CharacterSheetPager.native';

describe('CharacterSheetPager native', () => {
    it('filters hidden conditional pages before rendering the native pager', () => {
        render(
            <CharacterSheetPager initialPage={0}>
                <View>
                    <Text>Core</Text>
                </View>
                {false}
                {null}
                <View>
                    <Text>Gear</Text>
                </View>
            </CharacterSheetPager>,
        );

        expect(screen.getByText('Core')).toBeTruthy();
        expect(screen.getByText('Gear')).toBeTruthy();
    });
});
