import { ComingSoonIllustration } from "@/src/shared/components/ComingSoonIllustration";
import { Screen } from "@/src/shared/components/Screen";

export default function TransactionsTab() {
  return (
    <Screen withStackHeader edges={["left", "right"]}>
      <ComingSoonIllustration />
    </Screen>
  );
}
