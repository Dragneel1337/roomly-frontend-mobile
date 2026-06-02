import { createContext, useContext } from "react";
import type { AuthMode } from "./deviceStore";

export type SignUpOptions = {
  /** Link current device account when upgrading from device-only. */
  linkDevice?: boolean;
};

export type AuthContextValue = {
  accessToken: string | null;
  authMode: AuthMode | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isOnboardingLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<void>;
  continueWithDevice: () => Promise<void>;
  upgradeAccount: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
