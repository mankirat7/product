import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

const STEP_THRESHOLD = 60;
const SAMPLE_WINDOW = 10;

export default function App() {
  const [stepsPerMinute, setStepsPerMinute] = useState(0);
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    let interval;

    const start = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      interval = setInterval(async () => {
        const end = new Date();
        const start = new Date();
        start.setSeconds(start.getSeconds() - SAMPLE_WINDOW);

        const result = await Pedometer.getStepCountAsync(start, end);
        const spm = result.steps * (60 / SAMPLE_WINDOW);

        setStepsPerMinute(Math.round(spm));
        setIsWalking(spm >= STEP_THRESHOLD);
      }, 2000);
    };

    start();

    return () => clearInterval(interval);
  }, []);

  if (isWalking) {
    return <UnlockedScreen stepsPerMinute={stepsPerMinute} />;
  }

  return <BlockedScreen stepsPerMinute={stepsPerMinute} />;
}

function BlockedScreen({ stepsPerMinute }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🔒</Text>
      </View>

      <Text style={styles.blockedTitle}>Atleast do some Zone 2 cardio while you doom scroll..</Text>

      <Text style={styles.blockedSubtitle}>
        Start walking to unlock your apps, you fat fuck.
      </Text>

      <View style={styles.meterContainer}>
        <Text style={styles.meterLabel}>your pace</Text>
        <Text style={styles.meterValue}>{stepsPerMinute} steps/min</Text>
        <Text style={styles.meterTarget}>need {60 - stepsPerMinute > 0 ? 60 - stepsPerMinute : 0} more to unlock</Text>
      </View>
    </View>
  );
}

function UnlockedScreen({ stepsPerMinute }) {
  return (
    <View style={[styles.container, styles.unlockedContainer]}>
      <View style={[styles.iconCircle, styles.iconCircleGreen]}>
        <Text style={styles.iconText}>🔓</Text>
      </View>

      <Text style={styles.unlockedTitle}>Getting shredded while doom-scrolling? Let's go champ</Text>

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
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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