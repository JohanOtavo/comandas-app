import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export default function Row({ label, value, strong = false }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.sm
  },
  label: {
    color: colors.muted,
    flex: 1,
    paddingRight: spacing.md
  },
  value: {
    color: colors.text,
    flex: 1,
    textAlign: 'right'
  },
  strong: {
    fontWeight: '800',
    fontSize: 16
  }
});
