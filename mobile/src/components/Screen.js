import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../styles/theme';

export default function Screen({ children, padded = true }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  padded: {
    padding: spacing.lg
  }
});
