import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

export default function FilterChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    maxWidth: 180
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F1FF'
  },
  text: {
    color: colors.text,
    fontWeight: '700'
  },
  selectedText: {
    color: colors.primaryDark
  }
});
