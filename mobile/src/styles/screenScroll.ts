import { StyleSheet } from 'react-native';
import { LAYOUT } from '../theme';

/** Centered column for phone + web — consistent horizontal inset */
export const screenScroll = StyleSheet.create({
  content: {
    paddingHorizontal: LAYOUT.screenPadding,
    maxWidth: LAYOUT.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
