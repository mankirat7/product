import { View, Text, Animated, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { colors, STEP_THRESHOLD, BUFFER_DURATION } from '../constants/theme';

export default function RingProgress({ progressAnim, isWalking, scaleAnim, stepsPerMinute, isBuffering, bufferCount }) {
  return (
    <Animated.View style={[styles.ringWrap, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.ringSvgWrap}>
        <View style={styles.ringBg} />
        {isWalking && (
          <Animated.View style={[styles.ringFill, { borderColor: colors.accent }]} />
        )}
        {isBuffering && !isWalking && (
          <Animated.View
            style={[
              styles.ringFill,
              {
                borderColor: '#333',
                transform: [{
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '270deg'],
                  })
                }],
              }
            ]}
          />
        )}
      </View>
      <View style={styles.ringCenter}>
        <Text style={styles.ringIcon}>{isWalking ? '🔓' : '🔒'}</Text>
        <Text style={[styles.ringPct, isWalking && styles.ringPctAccent]}>
          {isWalking ? `${stepsPerMinute} spm` : isBuffering ? `${bufferCount} / ${BUFFER_DURATION}s` : 'idle'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    width: 140,
    height: 140,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvgWrap: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 2,
    borderColor: '#111',
  },
  ringFill: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 2,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringCenter: {
    alignItems: 'center',
    gap: 4,
  },
  ringIcon: { fontSize: 28 },
  ringPct: {
    fontSize: 11,
    color: '#333',
    letterSpacing: 1,
    fontWeight: '500',
  },
  ringPctAccent: { color: colors.accent },
});