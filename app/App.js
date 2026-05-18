import { StyleSheet, Text, View, Animated, Easing, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const STEP_THRESHOLD = 60;
const SAMPLE_WINDOW = 10;
const BUFFER_DURATION = 3;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACCENT = '#00FF87';
const ACCENT_DIM = '#00663a';
const ACCENT_BG = '#001a0e';
const ACCENT_BORDER = '#003320';

export default function App() {
  const [stepsPerMinute, setStepsPerMinute] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timeUnlocked, setTimeUnlocked] = useState(0);
  const [timeLocked, setTimeLocked] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const paceAnim = useRef(new Animated.Value(0)).current;

  const walkingBuffer = useRef(0);
  const idleBuffer = useRef(0);
  const currentlyWalking = useRef(false);
  const timeInterval = useRef(null);

  useEffect(() => {
    let interval;

    const start = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const daySteps = await Pedometer.getStepCountAsync(startOfDay, now);
      setTotalSteps(daySteps.steps);

      interval = setInterval(async () => {
        const end = new Date();
        const windowStart = new Date();
        windowStart.setSeconds(windowStart.getSeconds() - SAMPLE_WINDOW);

        const result = await Pedometer.getStepCountAsync(windowStart, end);
        const spm = result.steps * (60 / SAMPLE_WINDOW);
        setStepsPerMinute(Math.round(spm));

        Animated.timing(paceAnim, {
          toValue: Math.min(spm / STEP_THRESHOLD, 1),
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();

        const todayEnd = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaySteps = await Pedometer.getStepCountAsync(todayStart, todayEnd);
        setTotalSteps(todaySteps.steps);

        if (spm >= STEP_THRESHOLD) {
          idleBuffer.current = 0;
          if (!currentlyWalking.current) {
            walkingBuffer.current += 1;
            setBufferCount(walkingBuffer.current);
            setIsBuffering(true);
            if (walkingBuffer.current >= BUFFER_DURATION) {
              walkingBuffer.current = 0;
              setIsBuffering(false);
              triggerUnlock();
            }
          }
        } else {
          walkingBuffer.current = 0;
          setBufferCount(0);
          if (currentlyWalking.current) {
            idleBuffer.current += 1;
            if (idleBuffer.current >= BUFFER_DURATION) {
              idleBuffer.current = 0;
              setIsBuffering(false);
              triggerLock();
            }
          } else {
            setIsBuffering(false);
          }
        }
      }, 1000);
    };

    start();
    return () => {
      clearInterval(interval);
      if (timeInterval.current) clearInterval(timeInterval.current);
    };
  }, []);

  useEffect(() => {
    if (isBuffering) {
      Animated.timing(progressAnim, {
        toValue: bufferCount / BUFFER_DURATION,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [bufferCount, isBuffering]);

  useEffect(() => {
    if (timeInterval.current) clearInterval(timeInterval.current);
    timeInterval.current = setInterval(() => {
      if (currentlyWalking.current) {
        setTimeUnlocked(prev => prev + 1);
      } else {
        setTimeLocked(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timeInterval.current);
  }, [isWalking]);

  const triggerUnlock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    currentlyWalking.current = true;
    setIsWalking(true);
  };

  const triggerLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    currentlyWalking.current = false;
    setIsWalking(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {isWalking
        ? <UnlockedScreen
            stepsPerMinute={stepsPerMinute}
            scaleAnim={scaleAnim}
            paceAnim={paceAnim}
            totalSteps={totalSteps}
            timeUnlocked={formatTime(timeUnlocked)}
          />
        : <BlockedScreen
            stepsPerMinute={stepsPerMinute}
            isBuffering={isBuffering}
            bufferCount={bufferCount}
            progressAnim={progressAnim}
            scaleAnim={scaleAnim}
            paceAnim={paceAnim}
            totalSteps={totalSteps}
            timeLocked={formatTime(timeLocked)}
          />
      }
    </Animated.View>
  );
}

function RingProgress({ progressAnim, isWalking, scaleAnim, stepsPerMinute, isBuffering, bufferCount }) {
  const size = 140;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View style={[styles.ringWrap, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.ringSvgWrap}>
        <View style={styles.ringBg} />
        {isWalking && (
          <Animated.View
            style={[
              styles.ringFill,
              {
                borderColor: ACCENT,
                transform: [{ rotate: '-90deg' }],
              }
            ]}
          />
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
        <Text style={[styles.ringPct, isWalking && styles.ringPctGreen]}>
          {isWalking ? `${stepsPerMinute} spm` : isBuffering ? `${bufferCount} / ${BUFFER_DURATION}s` : 'idle'}
        </Text>
      </View>
    </Animated.View>
  );
}

function PaceBar({ paceAnim, stepsPerMinute, isWalking }) {
  const barColor = paceAnim.interpolate({
    inputRange: [0, 0.99, 1],
    outputRange: ['#222222', '#333333', ACCENT],
  });

  return (
    <View style={styles.paceBarWrap}>
      <View style={styles.paceBarLabels}>
        <Text style={[styles.paceBarText, isWalking && { color: ACCENT_DIM }]}>pace</Text>
        <Text style={[styles.paceBarNum, isWalking && { color: ACCENT }]}>
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

function StatCards({ leftLabel, leftValue, leftUnit, rightLabel, rightValue, rightUnit, isWalking }) {
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, isWalking && styles.statCardGreen]}>
        <Text style={[styles.statLabel, isWalking && styles.statLabelGreen]}>{leftLabel}</Text>
        <Text style={[styles.statValue, isWalking && styles.statValueGreen]}>{leftValue}</Text>
        <Text style={[styles.statUnit, isWalking && styles.statUnitGreen]}>{leftUnit}</Text>
      </View>
      <View style={[styles.statCard, isWalking && styles.statCardGreen]}>
        <Text style={[styles.statLabel, isWalking && styles.statLabelGreen]}>{rightLabel}</Text>
        <Text style={[styles.statValue, isWalking && styles.statValueGreen]}>{rightValue}</Text>
        <Text style={[styles.statUnit, isWalking && styles.statUnitGreen]}>{rightUnit}</Text>
      </View>
    </View>
  );
}

function BlockedScreen({ stepsPerMinute, isBuffering, bufferCount, progressAnim, scaleAnim, paceAnim, totalSteps, timeLocked }) {
  return (
    <View style={styles.screen}>
      <RingProgress
        progressAnim={progressAnim}
        isWalking={false}
        scaleAnim={scaleAnim}
        stepsPerMinute={stepsPerMinute}
        isBuffering={isBuffering}
        bufferCount={bufferCount}
      />

      <Text style={styles.statusLabel}>status</Text>
      <Text style={styles.mainTitle}>
        {isBuffering ? 'keep walking...' : "you're idle."}
      </Text>
      <Text style={styles.mainSub}>
        {isBuffering
          ? `unlocking in ${BUFFER_DURATION - bufferCount}s`
          : 'start walking to unlock\nyour apps.'}
      </Text>

      <PaceBar paceAnim={paceAnim} stepsPerMinute={stepsPerMinute} isWalking={false} />

      <StatCards
        leftLabel="steps today"
        leftValue={totalSteps.toLocaleString()}
        leftUnit="of 10k goal"
        rightLabel="time locked"
        rightValue={timeLocked}
        rightUnit="today"
        isWalking={false}
      />

      <View style={styles.ctaBtn}>
        <Text style={styles.ctaBtnText}>walk to unlock →</Text>
      </View>
    </View>
  );
}

function UnlockedScreen({ stepsPerMinute, scaleAnim, paceAnim, totalSteps, timeUnlocked }) {
  const fullProgress = useRef(new Animated.Value(1)).current;

  return (
    <View style={[styles.screen, styles.screenGreen]}>
      <RingProgress
        progressAnim={fullProgress}
        isWalking={true}
        scaleAnim={scaleAnim}
        stepsPerMinute={stepsPerMinute}
        isBuffering={false}
        bufferCount={0}
      />

      <Text style={[styles.statusLabel, styles.statusLabelGreen]}>status</Text>
      <Text style={[styles.mainTitle, styles.mainTitleGreen]}>you're moving.</Text>
      <Text style={[styles.mainSub, styles.mainSubGreen]}>
        {'apps unlocked.\nkeep the pace.'}
      </Text>

      <PaceBar paceAnim={paceAnim} stepsPerMinute={stepsPerMinute} isWalking={true} />

      <StatCards
        leftLabel="steps today"
        leftValue={totalSteps.toLocaleString()}
        leftUnit="of 10k goal"
        rightLabel="time unlocked"
        rightValue={timeUnlocked}
        rightUnit="today"
        isWalking={true}
      />

      <View style={[styles.ctaBtn, styles.ctaBtnGreen]}>
        <Text style={[styles.ctaBtnText, styles.ctaBtnTextGreen]}>unlocked — enjoy ↗</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 0,
  },
  screenGreen: {
    backgroundColor: '#000',
  },

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
  ringPctGreen: { color: ACCENT },

  statusLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2a2a2a',
    fontWeight: '500',
    marginBottom: 8,
  },
  statusLabelGreen: { color: ACCENT_DIM },

  mainTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  mainTitleGreen: { color: ACCENT },

  mainSub: {
    fontSize: 13,
    color: '#2a2a2a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  mainSubGreen: { color: ACCENT_DIM },

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
    color: '#2a2a2a',
    fontWeight: '500',
  },
  paceBarNum: {
    fontSize: 9,
    color: '#333',
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

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#080808',
    borderWidth: 0.5,
    borderColor: '#141414',
    borderRadius: 14,
    padding: 14,
  },
  statCardGreen: {
    backgroundColor: ACCENT_BG,
    borderColor: ACCENT_BORDER,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#2a2a2a',
    marginBottom: 6,
    fontWeight: '500',
  },
  statLabelGreen: { color: ACCENT_DIM },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statValueGreen: { color: ACCENT },
  statUnit: {
    fontSize: 10,
    color: '#222',
    marginTop: 3,
  },
  statUnitGreen: { color: ACCENT_DIM },

  ctaBtn: {
    width: '100%',
    backgroundColor: '#080808',
    borderWidth: 0.5,
    borderColor: '#141414',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  ctaBtnGreen: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  ctaBtnText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  ctaBtnTextGreen: {
    color: '#000',
    fontWeight: '600',
  },
});