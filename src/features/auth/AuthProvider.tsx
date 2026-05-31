import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  refreshAccessToken,
  setAccessToken as setHeldAccessToken,
  setRefreshHandler,
} from "./accessTokenHolder";
import {
  login as loginRequest,
  loginWithDevice as loginWithDeviceRequest,
  refresh as refreshRequest,
  register as registerRequest,
  registerDevice as registerDeviceRequest,
} from "./authApi";
import {
  clearAuthMode as clearStoredAuthMode,
  clearDeviceId,
  getAuthMode as getStoredAuthMode,
  getDeviceId,
  setAuthMode as setStoredAuthMode,
  setDeviceId,
  type AuthMode,
} from "./deviceStore";
import { getOnboardingComplete, setOnboardingComplete } from "./onboardingStore";
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "./tokenStore";
import { getHttpErrorStatus } from "@/src/shared/api/http";
import { apolloClient } from "@/src/shared/api/apolloClient";
import { MY_HOUSEHOLDS } from "@/src/features/household/householdApi";

async function fetchHasHousehold(): Promise<boolean | null> {
  try {
    const { data } = await apolloClient.query({
      query: MY_HOUSEHOLDS,
      fetchPolicy: "network-only",
    });
    return (data?.households?.filter(Boolean).length ?? 0) > 0;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  accessToken: string | null;
  authMode: AuthMode | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isOnboardingLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  continueWithDevice: () => Promise<void>;
  upgradeAccount: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authMode, setAuthModeState] = useState<AuthMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);

  useEffect(() => {
    setHeldAccessToken(accessToken);
  }, [accessToken]);

  const clearSession = useCallback(async () => {
    await clearRefreshToken();
    await clearStoredAuthMode();
    setHeldAccessToken(null);
    setAuthModeState(null);
    setAccessToken(null);
    await apolloClient.clearStore();
  }, []);

  useEffect(() => {
    setRefreshHandler(async () => {
      const stored = await getRefreshToken();
      if (!stored) {
        await clearSession();
        return null;
      }
      try {
        const tokens = await refreshRequest(stored);
        await setRefreshToken(tokens.refreshToken);
        setAccessToken(tokens.accessToken);
        return tokens.accessToken;
      } catch {
        await clearSession();
        return null;
      }
    });
    return () => setRefreshHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function finishBootstrap() {
      if (!cancelled) {
        setIsOnboardingLoading(false);
        setIsLoading(false);
      }
    }

    async function bootstrap() {
      const storedToken = await getRefreshToken();

      if (!storedToken) {
        const [deviceId, storedMode] = await Promise.all([getDeviceId(), getStoredAuthMode()]);
        if (deviceId && storedMode === "device") {
          try {
            const tokens = await loginWithDeviceRequest(deviceId);
            await setRefreshToken(tokens.refreshToken);
            setHeldAccessToken(tokens.accessToken);
            const backend = await fetchHasHousehold();
            const complete = backend ?? ((await getOnboardingComplete()) ?? false);
            await setOnboardingComplete(complete);
            if (!cancelled) {
              setAccessToken(tokens.accessToken);
              setAuthModeState("device");
              setIsOnboardingCompleteState(complete);
            }
          } catch {
            if (!cancelled) setIsOnboardingCompleteState(false);
          }
          await finishBootstrap();
          return;
        }

        const onboardingStatus = await getOnboardingComplete();
        if (!cancelled) setIsOnboardingCompleteState(onboardingStatus === true);
        await finishBootstrap();
        return;
      }

      const token = await refreshAccessToken();
      if (!token) {
        if (!cancelled) setIsOnboardingCompleteState(false);
        await finishBootstrap();
        return;
      }

      setHeldAccessToken(token);
      const storedMode = await getStoredAuthMode();
      if (!cancelled) {
        setAccessToken(token);
        setAuthModeState(storedMode ?? "email");
      }

      const backend = await fetchHasHousehold();
      const complete = backend ?? ((await getOnboardingComplete()) ?? true);
      await setOnboardingComplete(complete);
      if (!cancelled) setIsOnboardingCompleteState(complete);
      await finishBootstrap();
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function signIn(email: string, password: string): Promise<boolean> {
      const tokens = await loginRequest(email, password);
      await setRefreshToken(tokens.refreshToken);
      await setStoredAuthMode("email");
      setAuthModeState("email");
      setHeldAccessToken(tokens.accessToken);
      setAccessToken(tokens.accessToken);

      const backend = await fetchHasHousehold();
      const complete = backend ?? ((await getOnboardingComplete()) ?? true);
      await setOnboardingComplete(complete);
      setIsOnboardingCompleteState(complete);
      return complete;
    }

    async function signUp(email: string, password: string) {
      const tokens = await registerRequest(email, password);
      await setRefreshToken(tokens.refreshToken);
      await setStoredAuthMode("email");
      setAuthModeState("email");
      setHeldAccessToken(tokens.accessToken);
      setAccessToken(tokens.accessToken);
      await setOnboardingComplete(false);
      setIsOnboardingCompleteState(false);
    }

    async function applyDeviceLogin(deviceId: string) {
      const tokens = await loginWithDeviceRequest(deviceId);
      await setRefreshToken(tokens.refreshToken);
      await setStoredAuthMode("device");
      setAuthModeState("device");
      setHeldAccessToken(tokens.accessToken);
      setAccessToken(tokens.accessToken);
    }

    async function continueWithDevice() {
      if (accessToken) return;

      const existingDeviceId = await getDeviceId();
      if (existingDeviceId) {
        try {
          await applyDeviceLogin(existingDeviceId);
          return;
        } catch (e) {
          if (getHttpErrorStatus(e) !== 400) throw e;
          await clearDeviceId();
        }
      }

      const { deviceId } = await registerDeviceRequest();
      await setDeviceId(deviceId);
      await applyDeviceLogin(deviceId);
      await setOnboardingComplete(false);
      setIsOnboardingCompleteState(false);
    }

    async function upgradeAccount(email: string, password: string) {
      const deviceId = await getDeviceId();
      const tokens = await registerRequest(email, password, deviceId ?? undefined);
      await setRefreshToken(tokens.refreshToken);
      await setStoredAuthMode("email");
      setAuthModeState("email");
      setHeldAccessToken(tokens.accessToken);
      setAccessToken(tokens.accessToken);
    }

    async function signOut() {
      await clearSession();
    }

    async function completeOnboarding() {
      await setOnboardingComplete(true);
      setIsOnboardingCompleteState(true);
    }

    return {
      accessToken,
      authMode,
      isLoading,
      isAuthenticated: !!accessToken,
      isOnboardingComplete,
      isOnboardingLoading,
      signIn,
      signUp,
      continueWithDevice,
      upgradeAccount,
      signOut,
      completeOnboarding,
    };
  }, [accessToken, authMode, isLoading, isOnboardingComplete, isOnboardingLoading, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
