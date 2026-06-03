import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors } from "@/src/shared/theme/colors";

const SEARCH_BAR_RADIUS = 14;

type ProductSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  editable?: boolean;
  placeholder?: string;
};

export function ProductSearchBar({
  value,
  onChangeText,
  onSearch,
  editable = true,
  placeholder = "Search...",
}: ProductSearchBarProps) {
  return (
    <View style={[styles.wrapper, searchBarShadow]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputText}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      <Pressable
        style={styles.searchButton}
        onPress={onSearch}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel="Search products"
      >
        <Ionicons name="search" size={22} color={colors.onHeader} />
      </Pressable>
    </View>
  );
}

const searchBarShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
  },
  android: { elevation: 4 },
  default: {},
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: SEARCH_BAR_RADIUS,
    overflow: "hidden",
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.button,
    borderTopRightRadius: SEARCH_BAR_RADIUS,
    borderBottomRightRadius: SEARCH_BAR_RADIUS,
  },
});
