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
    joinHousehold: "/(modals)/join-household",
    joinHouseholdProfile: "/(modals)/join-household-profile",
    profile: "/(modals)/profile",
    settings: "/(modals)/settings",
    upgrade: "/(modals)/upgrade",
    addShoppingItem: "/(modals)/add-shopping-item",
    addFridgeItem: "/(modals)/add-fridge-item",
  },
  tabs: {
    shopping: "/(tabs)/shopping",
  },
} as const;
