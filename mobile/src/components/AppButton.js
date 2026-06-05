import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

const variants = {
  primary: { backgroundColor: colors.primary, color: '#FFFFFF' },
  success: { backgroundColor: colors.success, color: '#FFFFFF' },
  danger: { backgroundColor: colors.danger, color: '#FFFFFF' },
  warning: { backgroundColor: colors.warning, color: '#FFFFFF' },
  ghost: { backgroundColor: colors.surfaceMuted, color: colors.text },
  outline: { backgroundColor: '#FFFFFF', color: colors.primary, borderColor: colors.primary }
};

export default function AppButton({
  title,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  compact = false,
  style
}) {
  const palette = variants[variant] || variants.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        compact && styles.compact,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor || palette.backgroundColor,
          opacity: disabled ? 0.55 : 1
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.color} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={palette.color} /> : null}
          <Text style={[styles.text, { color: palette.color }]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  text: {
    marginLeft: spacing.xs,
    fontWeight: '700',
    fontSize: 14
  }
});
