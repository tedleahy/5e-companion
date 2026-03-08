import React from 'react';
import { Text } from 'react-native';

type MockIconProps = {
    name?: string;
    children?: React.ReactNode;
    testID?: string;
};

function MockIcon({ name, children, testID }: MockIconProps) {
    const label = children ?? name ?? 'icon';
    return <Text testID={testID}>{label}</Text>;
}

const MockIconWithLoadFont = Object.assign(MockIcon, {
    loadFont: jest.fn(),
});

export function createIconSet() {
    return MockIconWithLoadFont;
}

export function createIconSetFromFontello() {
    return MockIconWithLoadFont;
}

export function createIconSetFromIcoMoon() {
    return MockIconWithLoadFont;
}

export const AntDesign = MockIconWithLoadFont;
export const Entypo = MockIconWithLoadFont;
export const EvilIcons = MockIconWithLoadFont;
export const Feather = MockIconWithLoadFont;
export const FontAwesome = MockIconWithLoadFont;
export const FontAwesome5 = MockIconWithLoadFont;
export const Fontisto = MockIconWithLoadFont;
export const Foundation = MockIconWithLoadFont;
export const Ionicons = MockIconWithLoadFont;
export const MaterialCommunityIcons = MockIconWithLoadFont;
export const MaterialIcons = MockIconWithLoadFont;
export const Octicons = MockIconWithLoadFont;
export const SimpleLineIcons = MockIconWithLoadFont;
export const Zocial = MockIconWithLoadFont;

export default MockIconWithLoadFont;
