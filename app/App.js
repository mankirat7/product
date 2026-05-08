import { StyleSheet, Text, View } from 'react-native';
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

  return (
    <View style={styles.container}>

      <View style={[styles.indicator, isWalking ? styles.indicatorOn : styles.indicatorOff]} />

      <Text style={styles.status}>
        {isWalking ? 'walking' : 'idle'}
      </Text>

      <Text style={styles.spm}>{stepsPerMinute} steps/min</Text>

      <Text style={styles.threshold}>
        threshold: {STEP_THRESHOLD} steps/min
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  indicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  indicatorOn: {
    backgroundColor: '#1D9E75',
  },
  indicatorOff: {
    backgroundColor: '#333',
  },
  status: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  spm: {
    fontSize: 18,
    color: '#888',
  },
  threshold: {
    fontSize: 13,
    color: '#444',
  },
});