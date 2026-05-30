import { useLazyQuery } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { HOUSEHOLD_BY_JOIN_CODE } from "./householdApi";

export const JOIN_CODE_NOT_FOUND_MESSAGE = "No household found for this code.";
export const JOIN_CODE_FULL_MESSAGE = "This household is already full.";

export type JoinCodeCheckResult = { ok: true } | { ok: false; message: string };

export function useJoinCodeCheck() {
  const [runQuery, { loading }] = useLazyQuery(HOUSEHOLD_BY_JOIN_CODE, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  async function checkJoinCode(joinCode: string): Promise<JoinCodeCheckResult> {
    const { data, error } = await runQuery({ variables: { joinCode } });

    if (error && !CombinedGraphQLErrors.is(error)) {
      throw error;
    }

    const household = data?.householdByJoinCode;
    if (!household) {
      return { ok: false, message: JOIN_CODE_NOT_FOUND_MESSAGE };
    }
    if (household.membersCount >= household.membersLimit) {
      return { ok: false, message: JOIN_CODE_FULL_MESSAGE };
    }
    return { ok: true };
  }

  return { checkJoinCode, checking: loading };
}
