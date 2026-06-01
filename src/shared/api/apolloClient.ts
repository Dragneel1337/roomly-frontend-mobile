import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { getAccessToken, refreshAccessToken } from "@/src/features/auth/accessTokenHolder";
import { API_BASE_URL } from "../config";

const httpLink = new HttpLink({ uri: `${API_BASE_URL}/graphql` });

const authLink = new SetContextLink((prevContext) => {
  const token = getAccessToken();
  if (!token) return {};
  return {
    headers: {
      ...(prevContext.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    },
  };
});

function isAuthError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((e) => {
      const classification = e.extensions?.classification;
      return classification === "UNAUTHORIZED" || classification === "FORBIDDEN";
    });
  }
  if (ServerError.is(error)) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
}

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isAuthError(error)) return;
  if (operation.getContext().authRetried) return;

  return new Observable<ApolloLink.Result>((observer) => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | undefined;

    refreshAccessToken()
      .then((token) => {
        if (cancelled) return;
        if (!token) {
          observer.error(error);
          return;
        }
        operation.setContext({ authRetried: true });
        subscription = forward(operation).subscribe(observer);
      })
      .catch((err) => {
        if (!cancelled) observer.error(err);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  });
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          /**
           * We refetch `households` in multiple places (auth bootstrap, join, switch),
           * and we always want the newest list to replace the old one.
           */
          households: { merge: false },
        },
      },
      Avatar: { keyFields: false },
      Color: { keyFields: false },
      AvatarsAndColors: { keyFields: false },
      ShoppingList: { keyFields: ["id"] },
      ShoppingListItem: { keyFields: ["id"] },
      Product: { keyFields: ["id"] },
    },
  }),
});
