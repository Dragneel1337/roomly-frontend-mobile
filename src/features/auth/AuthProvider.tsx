import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest, refresh as refreshRequest, register as registerRequest } from "./authApi";
import { getOnboardingComplete, setOnboardingComplete } from "./onboardingStore";
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "./tokenStore";

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isOnboardingLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedToken = await getRefreshToken();
      if (!storedToken) {
        const onboardingStatus = await getOnboardingComplete();
        if (!cancelled) {
          setIsOnboardingCompleteState(onboardingStatus === true);
          setIsOnboardingLoading(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const tokens = await refreshRequest(storedToken);
        await setRefreshToken(tokens.refreshToken);
        if (!cancelled) setAccessToken(tokens.accessToken);

        let onboardingStatus = await getOnboardingComplete();
        if (onboardingStatus === null) {
          await setOnboardingComplete(true);
          onboardingStatus = true;
        }
        if (!cancelled) setIsOnboardingCompleteState(onboardingStatus === true);
      } catch {
        await clearRefreshToken();
        if (!cancelled) setIsOnboardingCompleteState(false);
      } finally {
        if (!cancelled) {
          setIsOnboardingLoading(false);
          setIsLoading(false);
        }
      }
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
      setAccessToken(tokens.accessToken);

      const onboardingStatus = await getOnboardingComplete();
      if (onboardingStatus === null) {
        await setOnboardingComplete(true);
        setIsOnboardingCompleteState(true);
        return true;
      }
      const complete = onboardingStatus === true;
      setIsOnboardingCompleteState(complete);
      return complete;
    }

    async function signUp(email: string, password: string) {
      const tokens = await registerRequest(email, password);
      await setRefreshToken(tokens.refreshToken);
      setAccessToken(tokens.accessToken);
      await setOnboardingComplete(false);
      setIsOnboardingCompleteState(false);
    }

    async function signOut() {
      await clearRefreshToken();
      setAccessToken(null);
    }

    async function completeOnboarding() {
      await setOnboardingComplete(true);
      setIsOnboardingCompleteState(true);
    }

    return {
      accessToken,
      isLoading,
      isAuthenticated: !!accessToken,
      isOnboardingComplete,
      isOnboardingLoading,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
    };
  }, [accessToken, isLoading, isOnboardingComplete, isOnboardingLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
