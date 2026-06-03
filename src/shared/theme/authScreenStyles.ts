import { Platform, StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";

export const authCardShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
  },
  android: { elevation: 5 },
  default: {},
});

export const authPillShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  android: { elevation: 3 },
  default: {},
});

export const authButtonShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },
  android: { elevation: 4 },
  default: {},
});

export const authScreenStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  centerBlock: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: colors.field,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 28,
    gap: 16,
    ...authCardShadow,
  },
  /** Wider card for avatar / profile picker (Figma ChooseAvatar). */
  profileCard: {
    backgroundColor: colors.field,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 18,
    ...authCardShadow,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: -8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 2,
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },
  pillInput: {
    borderWidth: 0,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    textAlign: "left",
    color: colors.textPrimary,
    ...authPillShadow,
  },
  submitButton: {
    alignSelf: "center",
    minWidth: 200,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
    ...authButtonShadow,
  },
  footerBlock: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  footerPrompt: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "center",
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
