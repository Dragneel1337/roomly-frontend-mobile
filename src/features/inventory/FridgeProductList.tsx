import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import {
  MemberAvatarStack,
  type MemberAvatarSource,
} from "@/src/features/household/MemberAvatarStack";
import { profileToAvatarSource } from "@/src/features/household/profileAvatar";
import { avatarSizes, getAvatarStackOverlap } from "@/src/features/profile/avatarDisplay";
import type { ProfileListResource } from "@/src/features/household/householdResourcesApi";
import type { FridgeDisplayItem } from "@/src/features/inventory/useFridgeInventories";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { routes } from "@/src/shared/routes";
import { authPillShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";

type FridgeProductListProps = {
  items: FridgeDisplayItem[];
  loading?: boolean;
  error?: Error;
  ownMember: ProfileListResource;
  allMembers: ProfileListResource[];
};

export function FridgeProductList({
  items,
  loading,
  error,
  ownMember,
  allMembers,
}: FridgeProductListProps) {
  const router = useRouter();
  const privateAvatar = profileToAvatarSource(ownMember);
  const sharedAvatars: MemberAvatarSource[] = allMembers.map(profileToAvatarSource);

  function openDetail(row: FridgeDisplayItem) {
    router.push({
      pathname: routes.modals.fridgeProductDetail,
      params: {
        inventoryId: String(row.inventoryId),
        productId: String(row.item.product.id),
        isShared: row.isShared ? "1" : "0",
      },
    } as Href);
  }

  if (loading && items.length === 0) {
    return <ActivityIndicator style={styles.loader} color={colors.textPrimary} />;
  }

  if (error && items.length === 0) {
    return (
      <Text style={styles.errorText}>
        {getUserFacingErrorMessage(error, "Could not load fridge.")}
      </Text>
    );
  }

  if (items.length === 0) {
    return <Text style={styles.emptyText}>Empty — use + to add products.</Text>;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.columnHeader}>
        <View style={styles.productsCol}>
          <Text style={styles.columnTitle}>Products</Text>
        </View>
        <View style={styles.quantityCol}>
          <Text style={[styles.columnTitle, styles.columnTitleCenter]}>Quantity</Text>
        </View>
        <View style={styles.ownersCol}>
          <Text style={[styles.columnTitle, styles.columnTitleRight]}>Owners</Text>
        </View>
      </View>
      <View style={styles.list}>
        {items.map((row) => (
          <Pressable
            key={`${row.inventoryId}-${row.item.id}`}
            style={[styles.row, authPillShadow]}
            onPress={() => openDetail(row)}
          >
            <View style={styles.productsCol}>
              <Text style={styles.productName} numberOfLines={2}>
                {row.item.product.name}
              </Text>
              {!!row.item.notes?.trim() && (
                <Text style={styles.productNotes} numberOfLines={1}>
                  {row.item.notes.trim()}
                </Text>
              )}
            </View>
            <View style={styles.quantityCol}>
              <Text style={styles.productQty}>{row.item.count}</Text>
            </View>
            <View style={styles.ownersCol}>
              <MemberAvatarStack
                members={row.isShared ? sharedAvatars : [privateAvatar]}
                size={avatarSizes.listOwner}
                overlap={getAvatarStackOverlap(avatarSizes.listOwner)}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  productsCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  quantityCol: {
    flex: 1,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  ownersCol: {
    minWidth: 108,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  columnTitleCenter: {
    alignSelf: "stretch",
    textAlign: "center",
  },
  columnTitleRight: {
    textAlign: "right",
  },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 52,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  productQty: {
    alignSelf: "stretch",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  productNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  loader: { marginVertical: 24 },
  errorText: { color: colors.error, textAlign: "center" },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
});
