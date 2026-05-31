import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function StatCards({ leftLabel, leftValue, leftUnit, rightLabel, rightValue, rightUnit, isWalking }) {
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, isWalking && styles.statCardAccent]}>
        <Text style={[styles.statLabel, isWalking && styles.statLabelAccent]}>{leftLabel}</Text>
        <Text style={[styles.statValue, isWalking && styles.statValueAccent]}>{leftValue}</Text>
        <Text style={[styles.statUnit, isWalking && styles.statUnitAccent]}>{leftUnit}</Text>
      </View>
      <View style={[styles.statCard, isWalking && styles.statCardAccent]}>
        <Text style={[styles.statLabel, isWalking && styles.statLabelAccent]}>{rightLabel}</Text>
        <Text style={[styles.statValue, isWalking && styles.statValueAccent]}>{rightValue}</Text>
        <Text style={[styles.statUnit, isWalking && styles.statUnitAccent]}>{rightUnit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  statCardAccent: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accentBorder,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  statLabelAccent: { color: colors.accentDim },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statValueAccent: { color: colors.accent },
  statUnit: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 3,
  },
  statUnitAccent: { color: colors.accentDim },
});