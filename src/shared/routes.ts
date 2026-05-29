export const routes = {
  guest: {
    welcome: "/(guest)/welcome",
    signIn: "/(guest)/sign-in",
    signUp: "/(guest)/sign-up",
  },
  onboarding: {
    choose: "/(onboarding)/choose-household",
    join: "/(onboarding)/join-household",
    createHousehold: "/(onboarding)/create-household",
    createProfile: "/(onboarding)/create-profile",
  },
  tabs: {
    shopping: "/(tabs)/shopping",
  },
} as const;
