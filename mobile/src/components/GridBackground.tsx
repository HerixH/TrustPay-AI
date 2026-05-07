import { StyleSheet, View } from 'react-native';
import { COLORS, windowWidth } from '../theme';

const COLS = 12;
const ROW_H = 32;
const ROW_COUNT = 20;

/** Subtle grid — background only, low contrast */
export function GridBackground() {
  const colW = windowWidth / COLS;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <View
          key={`v-${String(i)}`}
          style={[styles.vLine, { left: i * colW }]}
        />
      ))}
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <View
          key={`h-${String(i)}`}
          style={[styles.hLine, { top: i * ROW_H }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.line,
    opacity: 0.2,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.line,
    opacity: 0.12,
  },
});
