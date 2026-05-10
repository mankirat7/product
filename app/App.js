import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const STEP_THRESHOLD = 60;
const SAMPLE_WINDOW = 10;
const BUFFER_DURATION = 3;

export default function App() {
  const [stepsPerMinute, setStepsPerMinute] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const walkingBuffer = useRef(0);
  const idleBuffer = useRef(0);
  const currentlyWalking = useRef(false);

  useEffect(() => {
    let interval;

    const start = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      interval = setInterval(async () => {
        const end = new Date();
        const windowStart = new Date();
        windowStart.setSeconds(windowStart.getSeconds() - SAMPLE_WINDOW);

        const result = await Pedometer.getStepCountAsync(windowStart, end);
        const spm = result.steps * (60 / SAMPLE_WINDOW);
        setStepsPerMinute(Math.round(spm));

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
    return () => clearInterval(interval);
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

  const triggerUnlock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    currentlyWalking.current = true;
    setIsWalking(true);
  };

  const triggerLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    currentlyWalking.current = false;
    setIsWalking(false);
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {isWalking
        ? <UnlockedScreen stepsPerMinute={stepsPerMinute} scaleAnim={scaleAnim} />
        : <BlockedScreen
            stepsPerMinute={stepsPerMinute}
            isBuffering={isBuffering}
            bufferCount={bufferCount}
            progressAnim={progressAnim}
            scaleAnim={scaleAnim}
          />
      }
    </Animated.View>
  );
}

function BlockedScreen({ stepsPerMinute, isBuffering, bufferCount, progressAnim, scaleAnim }) {
  const ringSize = 120;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.iconText}>🔒</Text>
        </Animated.View>

        {isBuffering && (
          <View style={[styles.svgOverlay, { width: ringSize, height: ringSize }]}>
            <Animated.View
              style={{
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: strokeWidth,
                borderColor: '#1D9E75',
                borderTopColor: 'transparent',
                transform: [{
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }],
              }}
            />
          </View>
        )}
      </View>

      <Text style={styles.blockedTitle}>
        {isBuffering ? 'keep walking...' : 'put the phone down.'}
      </Text>

      <Text style={styles.blockedSubtitle}>
        {isBuffering
          ? `unlocking in ${BUFFER_DURATION - bufferCount}s`
          : 'start walking to unlock your apps.'}
      </Text>

      <View style={styles.meterContainer}>
        <Text style={styles.meterLabel}>your pace</Text>
        <Text style={styles.meterValue}>{stepsPerMinute} steps/min</Text>
        <Text style={styles.meterTarget}>
          {stepsPerMinute >= STEP_THRESHOLD
            ? 'good pace, keep going'
            : `need ${Math.max(0, STEP_THRESHOLD - stepsPerMinute)} more to unlock`}
        </Text>
      </View>
    </View>
  );
}

function UnlockedScreen({ stepsPerMinute, scaleAnim }) {
  return (
    <View style={[styles.container, styles.unlockedContainer]}>
      <Animated.View style={[styles.iconCircle, styles.iconCircleGreen, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.iconText}>🔓</Text>
      </Animated.View>

      <Text style={styles.unlockedTitle}>you're walking!</Text>

      <Text style={styles.unlockedSubtitle}>
        your apps are unlocked. keep moving.
      </Text>

      <View style={[styles.meterContainer, styles.meterContainerGreen]}>
        <Text style={styles.meterLabel}>your pace</Text>
        <Text style={[styles.meterValue, styles.meterValueGreen]}>
          {stepsPerMinute} steps/min
        </Text>
        <Text style={styles.meterTarget}>stop walking to lock again</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  unlockedContainer: {
    backgroundColor: '#021a12',
  },
  ringContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  svgOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    backgroundColor: '#0a2e1f',
  },
  iconText: {
    fontSize: 40,
  },
  blockedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  blockedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  unlockedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
    textAlign: 'center',
  },
  unlockedSubtitle: {
    fontSize: 16,
    color: '#4a9e7a',
    textAlign: 'center',
    lineHeight: 24,
  },
  meterContainer: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: '#222',
  },
  meterContainerGreen: {
    backgroundColor: '#0a2e1f',
    borderColor: '#1D9E75',
  },
  meterLabel: {
    fontSize: 12,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  meterValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  meterValueGreen: {
    color: '#1D9E75',
  },
  meterTarget: {
    fontSize: 13,
    color: '#555',
  },
});