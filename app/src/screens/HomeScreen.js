import { View, Text, Animated, Easing, StyleSheet, ScrollView } from 'react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import usePedometer from '../hooks/usePedometer';
import RingProgress from '../components/RingProgress';
import PaceBar from '../components/PaceBar';
import StatCards from '../components/StatCards';
import { colors, BUFFER_DURATION, DAILY_STEP_GOAL } from '../constants/theme';

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

  const goalPct = Math.min(Math.round((pedometer.totalSteps / DAILY_STEP_GOAL) * 100), 100);
  const isWalking = pedometer.isWalking;

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>home</Text>

        <View style={[styles.heroCard, isWalking && styles.heroCardActive]}>
          <RingProgress
            progressAnim={isWalking ? fullProgress : progressAnim}
            isWalking={isWalking}
            scaleAnim={scaleAnim}
            stepsPerMinute={pedometer.stepsPerMinute}
            isBuffering={pedometer.isBuffering}
            bufferCount={pedometer.bufferCount}
          />

          <Text style={[styles.statusLabel, isWalking && styles.statusLabelActive]}>
            status
          </Text>
          <Text style={[styles.mainTitle, isWalking && styles.mainTitleActive]}>
            {pedometer.isBuffering && !isWalking
              ? 'keep walking...'
              : isWalking
              ? "you're moving."
              : "you're idle."}
          </Text>
          <Text style={[styles.mainSub, isWalking && styles.mainSubActive]}>
            {pedometer.isBuffering && !isWalking
              ? `unlocking in ${BUFFER_DURATION - pedometer.bufferCount}s`
              : isWalking
              ? 'apps unlocked. keep the pace.'
              : 'start walking to unlock your apps.'}
          </Text>

          <PaceBar
            paceAnim={paceAnim}
            stepsPerMinute={pedometer.stepsPerMinute}
            isWalking={isWalking}
          />

          <View style={[styles.ctaBtn, isWalking && styles.ctaBtnActive]}>
            <Text style={[styles.ctaBtnText, isWalking && styles.ctaBtnTextActive]}>
              {isWalking ? 'unlocked — enjoy ↗' : 'walk to unlock →'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>steps today</Text>
            <Text style={styles.miniValue}>{pedometer.totalSteps.toLocaleString()}</Text>
            <Text style={styles.miniUnit}>of {DAILY_STEP_GOAL.toLocaleString()}</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>{isWalking ? 'time unlocked' : 'time locked'}</Text>
            <Text style={styles.miniValue}>
              {isWalking ? pedometer.timeUnlocked : pedometer.timeLocked}
            </Text>
            <Text style={styles.miniUnit}>today</Text>
          </View>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>daily goal</Text>
          <View style={styles.goalBarTrack}>
            <View style={[styles.goalBarFill, { width: `${goalPct}%` }]} />
          </View>
          <View style={styles.goalFooter}>
            <Text style={styles.goalSteps}>{pedometer.totalSteps.toLocaleString()} steps</Text>
            <Text style={styles.goalPct}>{goalPct}%</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  heroCardActive: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accentBorder,
  },
  statusLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusLabelActive: {
    color: colors.accentDim,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  mainTitleActive: {
    color: colors.accent,
  },
  mainSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  mainSubActive: {
    color: colors.accentDim,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  ctaBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  ctaBtnTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  miniLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  miniValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  miniUnit: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  goalLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  goalBarTrack: {
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalSteps: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  goalPct: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
});