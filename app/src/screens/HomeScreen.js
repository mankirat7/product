import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import usePedometer from '../hooks/usePedometer';
import RingProgress from '../components/RingProgress';
import PaceBar from '../components/PaceBar';
import StatCards from '../components/StatCards';
import { colors, BUFFER_DURATION } from '../constants/theme';

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const paceAnim = useRef(new Animated.Value(0)).current;
  const fullProgress = useRef(new Animated.Value(1)).current;

  const pedometer = usePedometer();

  pedometer.onUnlockCallback.current = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  pedometer.onLockCallback.current = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  Animated.timing(paceAnim, {
    toValue: Math.min(pedometer.stepsPerMinute / 60, 1),
    duration: 600,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false,
  }).start();

  if (pedometer.isBuffering && !pedometer.isWalking) {
    Animated.timing(progressAnim, {
      toValue: pedometer.bufferCount / BUFFER_DURATION,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  } else if (!pedometer.isWalking) {
    progressAnim.setValue(0);
  }

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {pedometer.isWalking ? (
        <View style={styles.screen}>
          <RingProgress
            progressAnim={fullProgress}
            isWalking={true}
            scaleAnim={scaleAnim}
            stepsPerMinute={pedometer.stepsPerMinute}
            isBuffering={false}
            bufferCount={0}
          />
          <Text style={[styles.statusLabel, { color: colors.accentDim }]}>status</Text>
          <Text style={[styles.mainTitle, { color: colors.accent }]}>you're moving.</Text>
          <Text style={[styles.mainSub, { color: colors.accentDim }]}>{'apps unlocked.\nkeep the pace.'}</Text>
          <PaceBar paceAnim={paceAnim} stepsPerMinute={pedometer.stepsPerMinute} isWalking={true} />
          <StatCards
            leftLabel="steps today"
            leftValue={pedometer.totalSteps.toLocaleString()}
            leftUnit="of 10k goal"
            rightLabel="time unlocked"
            rightValue={pedometer.timeUnlocked}
            rightUnit="today"
            isWalking={true}
          />
          <View style={[styles.ctaBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
            <Text style={[styles.ctaBtnText, { color: '#000', fontWeight: '600' }]}>unlocked — enjoy ↗</Text>
          </View>
        </View>
      ) : (
        <View style={styles.screen}>
          <RingProgress
            progressAnim={progressAnim}
            isWalking={false}
            scaleAnim={scaleAnim}
            stepsPerMinute={pedometer.stepsPerMinute}
            isBuffering={pedometer.isBuffering}
            bufferCount={pedometer.bufferCount}
          />
          <Text style={styles.statusLabel}>status</Text>
          <Text style={styles.mainTitle}>
            {pedometer.isBuffering ? 'keep walking...' : "you're idle."}
          </Text>
          <Text style={styles.mainSub}>
            {pedometer.isBuffering
              ? `unlocking in ${BUFFER_DURATION - pedometer.bufferCount}s`
              : 'start walking to unlock\nyour apps.'}
          </Text>
          <PaceBar paceAnim={paceAnim} stepsPerMinute={pedometer.stepsPerMinute} isWalking={false} />
          <StatCards
            leftLabel="steps today"
            leftValue={pedometer.totalSteps.toLocaleString()}
            leftUnit="of 10k goal"
            rightLabel="time locked"
            rightValue={pedometer.timeLocked}
            rightUnit="today"
            isWalking={false}
          />
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>walk to unlock →</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2a2a2a',
    fontWeight: '500',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  ctaBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});