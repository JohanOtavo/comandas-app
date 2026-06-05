import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export default function LoadingState({ text = 'Cargando informacion...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl
  },
  text: {
    color: colors.muted,
    marginTop: spacing.md
  }
});
