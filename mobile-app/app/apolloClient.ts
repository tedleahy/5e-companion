import { supabase } from '@/lib/supabase';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({ uri: process.env.EXPO_PUBLIC_API_URL });

// A link that runs on all requests, adding a JWT authorisation token for supabase
const authLink = new SetContextLink(async (prevContext, _) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return {
        headers: {
            ...prevContext.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
});

/**
 * Creates the Apollo cache with field policies for non-normalised nested data.
 */
export function createApolloCache() {
    return new InMemoryCache({
        typePolicies: {
            Character: {
                fields: {
                    /**
                     * Character spellbooks are treated as full server snapshots, so replacement is intentional.
                     */
                    spellbook: {
                        merge: false,
                    },
                },
            },
        },
    });
}

const apolloClient = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: createApolloCache(),
});

export default apolloClient;
