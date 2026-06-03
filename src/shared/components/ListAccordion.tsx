import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/shared/theme/colors";

type ListAccordionProps = {
  title: string;
  defaultExpanded?: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
};

export function ListAccordion({
  title,
  defaultExpanded = true,
  headerRight,
  children,
}: ListAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
      >
        <Text style={styles.chevron}>{expanded ? "▼" : "▶"}</Text>
        <Text style={styles.title}>{title}</Text>
        {headerRight != null && <View style={styles.headerRight}>{headerRight}</View>}
      </Pressable>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  chevron: { fontSize: 12, color: colors.textSecondary, width: 16 },
  title: { fontSize: 17, fontWeight: "700", flex: 1 },
  headerRight: { marginLeft: "auto" },
  body: { gap: 8 },
});
