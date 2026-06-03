import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  enrichProfileAvatar,
  fetchColorCatalog,
} from "@/src/features/profile/avatarColorCatalog";
import { ACTIVE_PROFILE, type ActiveProfile } from "@/src/features/profile/profileApi";
import { apolloClient } from "@/src/shared/api/apolloClient";
import {
  clearActiveSession,
  getActiveSession,
  getHouseholdProfileMap,
  mergeHouseholdProfileMap,
  setStoredActiveHousehold,
  type ActiveSession,
} from "./activeSessionStore";
import {
  fetchHouseholds,
  rebuildHouseholdProfileMap,
  rebuildProfileMapEntry,
  type HouseholdSummary,
} from "./householdApi";

export type HouseholdSwitchError = "profile_not_found";

export type SwitchHouseholdOptions = {
  skipCacheReset?: boolean;
};

let resetSessionInitCallback: (() => void) | null = null;
let clearActiveHouseholdContextCallback: (() => void) | null = null;

/** Clears session-init guard so the next tabs mount re-runs initializeSession. */
export function resetSessionInit(): void {
  resetSessionInitCallback?.();
}

/**
 * Drops active household/profile pointers so mounted queries skip before cache clear.
 * Keeps `households` list until exit flow refetches.
 */
export function clearActiveHouseholdContext(): void {
  clearActiveHouseholdContextCallback?.();
}

type HouseholdContextValue = {
  activeHouseholdId: string | null;
  activeProfileId: string | null;
  household: HouseholdSummary | null;
  profile: ActiveProfile | null;
  households: HouseholdSummary[];
  isLoading: boolean;
  isReady: boolean;
  setActiveHousehold: (householdId: string, profileId: string) => Promise<void>;
  switchHousehold: (
    householdId: string,
    options?: SwitchHouseholdOptions,
  ) => Promise<HouseholdSwitchError | null>;
  refreshHouseholds: () => Promise<void>;
  refreshActiveProfile: () => Promise<void>;
};

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

function resolveSessionFromStore(
  list: HouseholdSummary[],
  stored: ActiveSession,
  map: Record<string, string>,
): { householdId: string | null; profileId: string | null } {
  let householdId = stored.householdId;
  let profileId = stored.profileId;

  if (householdId && !list.some((h) => h.id === householdId)) {
    householdId = null;
    profileId = null;
  }

  if (householdId && !profileId) {
    profileId = map[householdId] ?? null;
  }

  if (!householdId && profileId) {
    householdId = Object.entries(map).find(([, id]) => id === profileId)?.[0] ?? null;
    if (householdId && !list.some((h) => h.id === householdId)) {
      householdId = null;
    }
  }

  if (!householdId || !profileId) {
    const match = list.find((h) => map[h.id]);
    if (match) {
      householdId = match.id;
      profileId = map[match.id];
    }
  }

  return { householdId, profileId };
}

async function loadProfile(profileId: string): Promise<ActiveProfile> {
  const { data } = await apolloClient.query({
    query: ACTIVE_PROFILE,
    variables: { profileId },
    fetchPolicy: "network-only",
  });
  if (!data?.profile) throw new Error("Profile not found");

  const catalog = await fetchColorCatalog();
  const avatar = enrichProfileAvatar(data.profile.avatar.colorName, catalog);

  return {
    ...data.profile,
    avatar: {
      ...data.profile.avatar,
      ...avatar,
    },
  };
}

function clearHouseholdState(
  setters: {
    setHouseholds: (v: HouseholdSummary[]) => void;
    setActiveHouseholdId: (v: string | null) => void;
    setActiveProfileId: (v: string | null) => void;
    setHousehold: (v: HouseholdSummary | null) => void;
    setProfile: (v: ActiveProfile | null) => void;
    setIsReady: (v: boolean) => void;
  },
) {
  setters.setHouseholds([]);
  setters.setActiveHouseholdId(null);
  setters.setActiveProfileId(null);
  setters.setHousehold(null);
  setters.setProfile(null);
  setters.setIsReady(false);
}

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const {
    accessToken,
    isAuthenticated,
    isOnboardingComplete,
    isOnboardingLoading,
    isLoading: authLoading,
  } = useAuth();

  const [households, setHouseholds] = useState<HouseholdSummary[]>([]);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [household, setHousehold] = useState<HouseholdSummary | null>(null);
  const [profile, setProfile] = useState<ActiveProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wasAuthenticatedRef = useRef(false);
  const prevAccessTokenRef = useRef<string | null>(null);
  const sessionInitDoneRef = useRef(false);

  const applyHouseholdList = useCallback((list: HouseholdSummary[]) => {
    setHouseholds(list);
    return list;
  }, []);

  const setActiveHousehold = useCallback(
    async (householdId: string, profileId: string) => {
      setIsLoading(true);
      try {
        let list = households;
        if (!list.some((h) => h.id === householdId)) {
          list = applyHouseholdList(await fetchHouseholds());
        }

        const summary = list.find((h) => h.id === householdId) ?? null;
        const loadedProfile = await loadProfile(profileId);

        await setStoredActiveHousehold(householdId, profileId);

        setActiveHouseholdId(householdId);
        setActiveProfileId(profileId);
        setHousehold(summary);
        setProfile(loadedProfile);
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    },
    [applyHouseholdList, households],
  );

  const refreshHouseholds = useCallback(async () => {
    applyHouseholdList(await fetchHouseholds());
  }, [applyHouseholdList]);

  const refreshActiveProfile = useCallback(async () => {
    if (!activeProfileId) return;
    const loadedProfile = await loadProfile(activeProfileId);
    setProfile(loadedProfile);
  }, [activeProfileId]);

  const switchHousehold = useCallback(
    async (
      householdId: string,
      options?: SwitchHouseholdOptions,
    ): Promise<HouseholdSwitchError | null> => {
      let map = await getHouseholdProfileMap();
      let profileId: string | null = map[householdId] ?? null;

      if (!profileId) {
        const stored = await getActiveSession();
        const summary =
          households.find((h) => h.id === householdId) ??
          (await fetchHouseholds()).find((h) => h.id === householdId);

        if (summary) {
          profileId =
            (await rebuildProfileMapEntry(
              summary.id,
              summary.membersCount,
              stored.profileId,
            )) ?? null;
          if (profileId) {
            map = await mergeHouseholdProfileMap({ [householdId]: profileId });
          }
        }
      }

      if (!profileId) return "profile_not_found";

      await setActiveHousehold(householdId, profileId);
      if (!options?.skipCacheReset) {
        await apolloClient.resetStore();
      }
      return null;
    },
    [households, setActiveHousehold],
  );

  const initializeSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = applyHouseholdList(await fetchHouseholds());
      if (list.length === 0) {
        setActiveHouseholdId(null);
        setActiveProfileId(null);
        setHousehold(null);
        setProfile(null);
        setIsReady(true);
        return;
      }

      const stored = await getActiveSession();
      let map = await getHouseholdProfileMap();

      let { householdId, profileId } = resolveSessionFromStore(list, stored, map);

      if (!householdId || !profileId) {
        const rebuilt = await rebuildHouseholdProfileMap(list, stored.profileId);
        if (Object.keys(rebuilt).length > 0) {
          map = await mergeHouseholdProfileMap(rebuilt);
        }
        ({ householdId, profileId } = resolveSessionFromStore(list, stored, map));
      }

      if (!householdId || !profileId) {
        setActiveHouseholdId(null);
        setActiveProfileId(null);
        setHousehold(null);
        setProfile(null);
        setIsReady(true);
        return;
      }

      const summary = list.find((h) => h.id === householdId) ?? null;
      const loadedProfile = await loadProfile(profileId);

      await setStoredActiveHousehold(householdId, profileId);

      setActiveHouseholdId(householdId);
      setActiveProfileId(profileId);
      setHousehold(summary);
      setProfile(loadedProfile);
      setIsReady(true);
    } catch (error) {
      if (__DEV__) {
        console.warn("[HouseholdProvider] initializeSession failed:", error);
      }
      await clearActiveSession();
      clearHouseholdState({
        setHouseholds,
        setActiveHouseholdId,
        setActiveProfileId,
        setHousehold,
        setProfile,
        setIsReady,
      });
      setIsReady(true);
    } finally {
      sessionInitDoneRef.current = true;
      setIsLoading(false);
    }
  }, [applyHouseholdList]);

  useEffect(() => {
    resetSessionInitCallback = () => {
      sessionInitDoneRef.current = false;
    };
    clearActiveHouseholdContextCallback = () => {
      setActiveHouseholdId(null);
      setActiveProfileId(null);
      setHousehold(null);
      setProfile(null);
      setIsReady(false);
    };
    return () => {
      resetSessionInitCallback = null;
      clearActiveHouseholdContextCallback = null;
    };
  }, []);

  useEffect(() => {
    if (authLoading || isOnboardingLoading) return;

    const prevToken = prevAccessTokenRef.current;
    prevAccessTokenRef.current = accessToken;
    const accountSwitched =
      prevToken != null && accessToken != null && prevToken !== accessToken;

    const justLoggedIn = isAuthenticated && !wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!isAuthenticated || !isOnboardingComplete) {
      sessionInitDoneRef.current = false;
      clearHouseholdState({
        setHouseholds,
        setActiveHouseholdId,
        setActiveProfileId,
        setHousehold,
        setProfile,
        setIsReady,
      });
      return;
    }

    if (justLoggedIn || accountSwitched) {
      sessionInitDoneRef.current = false;
      if (accountSwitched) {
        clearHouseholdState({
          setHouseholds,
          setActiveHouseholdId,
          setActiveProfileId,
          setHousehold,
          setProfile,
          setIsReady,
        });
      } else {
        setIsReady(false);
      }
    }

    if (sessionInitDoneRef.current && !justLoggedIn && !accountSwitched) return;

    if (
      isReady &&
      activeHouseholdId &&
      activeProfileId &&
      profile &&
      !justLoggedIn &&
      !accountSwitched
    ) {
      return;
    }

    void initializeSession();
  }, [
    accessToken,
    activeHouseholdId,
    activeProfileId,
    authLoading,
    initializeSession,
    isAuthenticated,
    isOnboardingComplete,
    isOnboardingLoading,
    isReady,
    profile,
  ]);

  const value = useMemo<HouseholdContextValue>(
    () => ({
      activeHouseholdId,
      activeProfileId,
      household,
      profile,
      households,
      isLoading,
      isReady,
      setActiveHousehold,
      switchHousehold,
      refreshHouseholds,
      refreshActiveProfile,
    }),
    [
      activeHouseholdId,
      activeProfileId,
      household,
      profile,
      households,
      isLoading,
      isReady,
      setActiveHousehold,
      switchHousehold,
      refreshHouseholds,
      refreshActiveProfile,
    ],
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
}

export async function clearHouseholdSession(): Promise<void> {
  await clearActiveSession();
}
