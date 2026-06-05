import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  error,
  style,
  ...textInputProps
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        {...textInputProps}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  input: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15
  },
  multiline: {
    minHeight: 82,
    textAlignVertical: 'top'
  },
  inputError: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontSize: 12
  }
});
