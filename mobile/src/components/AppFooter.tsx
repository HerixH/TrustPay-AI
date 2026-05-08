import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { COLORS, LAYOUT } from "../theme";

type Props = {
  style?: StyleProp<ViewStyle>;
  /** Most stack flows use light page bg; tabs / wallet use dark. */
  variant?: "dark" | "light";
};

/**
 * Trust branding block — same on Landing and every other screen.
 */
export function AppFooter({ style, variant = "dark" }: Props) {
  const t = variant === "dark" ? stylesDark : stylesLight;
  return (
    <View style={[styles.wrap, style]}>
      <Text style={t.kicker}>Trust infrastructure</Text>
      <Text style={t.brand}>TrustPay AI</Text>
      <Text style={t.tagline}>
        Security, intelligence, and usability for P2P payments, especially in
        emerging markets.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: LAYOUT.sectionGap,
    gap: 8,
  },
});

const stylesDark = StyleSheet.create({
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  brand: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});

const stylesLight = StyleSheet.create({
  kicker: {
    color: COLORS.textFaint,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  brand: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});
