/**
 * ROOMLY design tokens (Figma). Do not add colors outside this file for UI work.
 */
export const colors = {
  button: "#36455e",
  inputBackground: "#e7f3ff",
  /** Placeholder in inputs (Figma); prefer textSecondary for hints on screen */
  inputText: "#a7a7a7",
  /** Hints, empty states, meta, placeholders — readable on field/white backgrounds */
  textSecondary: "#5c6d88",
  background: "#d5def5",
  field: "#b1cdfe",
  header: "#5772ad",
  navBar: "#d9d9d9",
  navBarIcon: "#1c274c",
  /** Text on header background */
  onHeader: "#ffffff",
  /** Primary text on light backgrounds */
  textPrimary: "#1c274c",
  /** Functional — not in Figma tokens; keep for validation errors */
  error: "#b91c1c",
  white: "#ffffff",
} as const;
