import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, LAYOUT } from '../theme';

type Props = {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  onDealPress?: () => void;
};

export function HomeSearchRow({
  onSearchPress,
  onFilterPress,
  onDealPress,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onSearchPress}
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Search deals"
      >
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <Text style={styles.placeholder} numberOfLines={1}>
          Search deals or counterparties
        </Text>
      </Pressable>
      <Pressable
        onPress={onFilterPress}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Filters"
      >
        <Ionicons name="options-outline" size={22} color={COLORS.text} />
      </Pressable>
      <Pressable
        onPress={onDealPress}
        style={({ pressed }) => [styles.dealBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="New deal"
      >
        <Text style={styles.dealBtnText}>+ Deal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: LAYOUT.blockGap,
  },
  search: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: LAYOUT.cardRadiusLarge,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
  },
  placeholder: {
    flex: 1,
    color: COLORS.textFaint,
    fontSize: 15,
    fontWeight: '500',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBtn: {
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
