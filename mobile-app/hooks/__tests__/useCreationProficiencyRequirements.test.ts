import { renderHook } from '@testing-library/react-native';
import useCreationProficiencyRequirements from '../useCreationProficiencyRequirements';

const mockUseQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

describe('useCreationProficiencyRequirements', () => {
    beforeEach(() => {
        mockUseQuery.mockReset();
    });

    it('surfaces query errors so the skills step can block Continue', () => {
        const refetch = jest.fn();
        mockUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: new Error('network down'),
            refetch,
        });

        const { result } = renderHook(() => useCreationProficiencyRequirements(
            [{ classId: 'fighter', subclassId: '', level: 1 }],
            'fighter',
        ));

        expect(result.current.error).toBeTruthy();
        expect(result.current.proficiencyChoiceGroups).toEqual([]);
        expect(result.current.loading).toBe(false);
        result.current.refetch();
        expect(refetch).toHaveBeenCalled();
    });

    it('builds class-scoped skill groups from loaded class definitions', () => {
        mockUseQuery.mockReturnValue({
            data: {
                attachedClassDetails: [{
                    id: 'class-fighter-id',
                    value: 'fighter',
                    srdIndex: 'fighter',
                    proficiencies: [
                        {
                            grant: 'STARTING',
                            type: 'SKILL',
                            name: 'Athletics',
                            value: 'skill-athletics',
                            choiceGroup: 1,
                            choiceCount: 2,
                        },
                        {
                            grant: 'STARTING',
                            type: 'SKILL',
                            name: 'Perception',
                            value: 'skill-perception',
                            choiceGroup: 1,
                            choiceCount: 2,
                        },
                    ],
                }],
            },
            loading: false,
            error: undefined,
            refetch: jest.fn(),
        });

        const { result } = renderHook(() => useCreationProficiencyRequirements(
            [{ classId: 'fighter', subclassId: '', level: 1 }],
            'fighter',
        ));

        expect(result.current.error).toBeUndefined();
        expect(result.current.proficiencyChoiceGroups).toEqual([
            expect.objectContaining({
                classId: 'fighter',
                choiceGroup: 1,
                pick: 2,
                type: 'SKILL',
                options: expect.arrayContaining([
                    expect.objectContaining({ value: 'skill-athletics' }),
                    expect.objectContaining({ value: 'skill-perception' }),
                ]),
            }),
        ]);
    });

    it('treats a settled partial attachedClassDetails response as a requirements error', () => {
        const refetch = jest.fn();
        mockUseQuery.mockReturnValue({
            data: {
                attachedClassDetails: [{
                    id: 'class-fighter-id',
                    value: 'fighter',
                    srdIndex: 'fighter',
                    proficiencies: [
                        {
                            grant: 'STARTING',
                            type: 'SKILL',
                            name: 'Athletics',
                            value: 'skill-athletics',
                            choiceGroup: 1,
                            choiceCount: 2,
                        },
                        {
                            grant: 'STARTING',
                            type: 'SKILL',
                            name: 'Perception',
                            value: 'skill-perception',
                            choiceGroup: 1,
                            choiceCount: 2,
                        },
                    ],
                }],
            },
            loading: false,
            error: undefined,
            refetch,
        });

        const { result } = renderHook(() => useCreationProficiencyRequirements(
            [
                { classId: 'fighter', subclassId: '', level: 1 },
                { classId: 'rogue', subclassId: '', level: 1 },
            ],
            'fighter',
        ));

        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('rogue');
        expect(result.current.proficiencyChoiceGroups).toEqual([]);
        expect(result.current.fixedSkillKeys).toEqual([]);
        expect(result.current.loading).toBe(false);
        result.current.refetch();
        expect(refetch).toHaveBeenCalled();
    });

    it('does not treat unresolved classes as an error while the batch query is still loading', () => {
        mockUseQuery.mockReturnValue({
            data: {
                attachedClassDetails: [{
                    id: 'class-fighter-id',
                    value: 'fighter',
                    srdIndex: 'fighter',
                    proficiencies: [],
                }],
            },
            loading: true,
            error: undefined,
            refetch: jest.fn(),
        });

        const { result } = renderHook(() => useCreationProficiencyRequirements(
            [
                { classId: 'fighter', subclassId: '', level: 1 },
                { classId: 'rogue', subclassId: '', level: 1 },
            ],
            'fighter',
        ));

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeUndefined();
        expect(result.current.proficiencyChoiceGroups).toEqual([]);
    });
});
