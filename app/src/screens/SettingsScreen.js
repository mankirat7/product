import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>settings coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
