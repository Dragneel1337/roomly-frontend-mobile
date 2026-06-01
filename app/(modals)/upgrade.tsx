import { Redirect } from "expo-router";
import { routes } from "@/src/shared/routes";

/** Legacy route — upgrade now uses Sign in / Sign up with intent=upgrade. */
export default function UpgradeModal() {
  return <Redirect href={{ pathname: routes.guest.signIn, params: { intent: "upgrade" } }} />;
}
