export const routes = {
  guest: {
    welcome: "/(guest)/welcome",
    signIn: "/(guest)/sign-in",
    signUp: "/(guest)/sign-up",
  },
  onboarding: {
    choose: "/(onboarding)/choose-household",
    createHousehold: "/(onboarding)/create-household",
    createProfile: "/(onboarding)/create-profile",
  },
  modals: {
    menu: "/(modals)/menu",
    switchHousehold: "/(modals)/switch-household",
    profile: "/(modals)/profile",
    settings: "/(modals)/settings",
    upgrade: "/(modals)/upgrade",
    addShoppingItem: "/(modals)/add-shopping-item",
  },
  tabs: {
    shopping: "/(tabs)/shopping",
  },
} as const;
