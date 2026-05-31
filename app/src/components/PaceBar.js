import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, STEP_THRESHOLD } from '../constants/theme';

export default function PaceBar({ paceAnim, stepsPerMinute, isWalking }) {
  const barColor = paceAnim.interpolate({
    inputRange: [0, 0.99, 1],
    outputRange: ['#222222', '#333333', colors.accent],
  });

  return (
    <View style={styles.paceBarWrap}>
      <View style={styles.paceBarLabels}>
        <Text style={[styles.paceBarText, isWalking && { color: colors.accentDim }]}>pace</Text>
        <Text style={[styles.paceBarNum, isWalking && { color: colors.accent }]}>
          {stepsPerMinute} / {STEP_THRESHOLD} spm
        </Text>
      </View>
      <View style={styles.paceBarTrack}>
        <Animated.View
          style={[
            styles.paceBarFill,
            {
              backgroundColor: barColor,
              width: paceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paceBarWrap: {
    width: '100%',
    marginBottom: 16,
  },
  paceBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paceBarText: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  paceBarNum: {
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  paceBarTrack: {
    width: '100%',
    height: 2,
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    overflow: 'hidden',
  },
  paceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});