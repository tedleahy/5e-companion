import type { ErrorLike } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

export function isUnauthenticatedError(error?: ErrorLike): boolean {
    if (!error) return false;

    if (CombinedGraphQLErrors.is(error)) {
        const graphQLErrorCode = error.errors.find(
            (graphQLError) => graphQLError.extensions?.code === 'UNAUTHENTICATED',
        );
        if (graphQLErrorCode) return true;
    }

    return error.message.includes('UNAUTHENTICATED');
}
