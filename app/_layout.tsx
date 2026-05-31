import { ApolloProvider } from "@apollo/client/react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/features/auth/AuthProvider";
import { HouseholdProvider } from "@/src/features/household/HouseholdProvider";
import { apolloClient } from "@/src/shared/api/apolloClient";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <HouseholdProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </HouseholdProvider>
        </ApolloProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
