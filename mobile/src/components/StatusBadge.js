import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

export default function StatusBadge({ label, color = colors.primary }) {
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}14` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  text: {
    fontWeight: '800',
    fontSize: 12
  }
});
