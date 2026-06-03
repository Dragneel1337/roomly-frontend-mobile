import { Redirect } from "expo-router";
import { routes } from "@/src/shared/routes";

/** Legacy modal route — settings live on the Settings tab. */
export default function SettingsModalRedirect() {
  return <Redirect href={routes.tabs.settings} />;
}
