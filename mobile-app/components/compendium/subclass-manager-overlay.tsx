import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
    deleteConfirmationMessage,
    type CustomSubclassManager,
} from '@/components/compendium/use-custom-subclass-manager';
import CustomSubclassFormSheet from '@/components/subclasses/CustomSubclassFormSheet';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SubclassManagerOverlayProps = {
    manager: CustomSubclassManager;
};

/** Create/edit sheet, archive confirmation, and action errors for custom subclasses. */
export default function SubclassManagerOverlay({ manager }: SubclassManagerOverlayProps) {
    return (
        <>
            <CustomSubclassFormSheet
                classOptions={manager.classOptions}
                visible={manager.formVisible}
                mode={manager.formMode}
                draft={manager.draft}
                initialDraft={manager.initialDraft}
                pending={manager.saving}
                errorMessage={manager.formErrorMessage}
                lockedClassSelection={manager.lockedClassSelection}
                lockedClassMessage={manager.lockedClassMessage}
                onChangeDraft={manager.changeDraft}
                onClose={manager.closeForm}
                onSave={() => { void manager.saveForm(); }}
            />

            <ConfirmDialog
                visible={manager.deleteCandidate != null}
                title="Delete custom subclass?"
                message={manager.deleteCandidate == null
                    ? ''
                    : deleteConfirmationMessage(manager.deleteCandidate)}
                confirmLabel={manager.archiving ? 'Deleting...' : 'Delete'}
                onConfirm={() => { void manager.confirmArchive(); }}
                onCancel={manager.cancelArchive}
            />

            <Snackbar
                visible={manager.actionErrorMessage != null}
                onDismiss={manager.dismissActionError}
                duration={SNACKBAR_DURATION_MS}
                style={styles.snackbar}
            >
                {manager.actionErrorMessage ?? ''}
            </Snackbar>
        </>
    );
}

const SNACKBAR_DURATION_MS = 4000;

const styles = StyleSheet.create({
    snackbar: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
});
