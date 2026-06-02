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
    addEvent: "/(modals)/add-event",
    eventDetail: "/(modals)/event-detail",
  },
  tabs: {
    home: "/(tabs)/home",
    shopping: "/(tabs)/shopping",
    fridge: "/(tabs)/fridge",
    calendar: "/(tabs)/calendar",
    transactions: "/(tabs)/transactions",
    settings: "/(tabs)/settings",
  },
} as const;
