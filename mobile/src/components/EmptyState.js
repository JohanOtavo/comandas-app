import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export default function EmptyState({ title, subtitle, icon = 'file-tray-outline' }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={38} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs
  }
});
