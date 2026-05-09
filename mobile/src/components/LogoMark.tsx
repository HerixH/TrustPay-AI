import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENT_LOGO_RING } from "../theme";

type Props = {
  size?: number;
};

export function LogoMark({ size = 40 }: Props) {
  const r = size * 0.2;
  return (
    <LinearGradient
      colors={[...GRADIENT_LOGO_RING]}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.outer, { width: size, height: size, borderRadius: r }]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size - 2,
            height: size - 2,
            borderRadius: r - 1,
          },
        ]}
      >
        <View style={styles.dots}>
          <View
            style={[
              styles.dot,
              {
                width: size * 0.12,
                height: size * 0.12,
                borderRadius: size * 0.06,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                width: size * 0.12,
                height: size * 0.12,
                borderRadius: size * 0.06,
              },
            ]}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    backgroundColor: COLORS.accentMint,
  },
});
