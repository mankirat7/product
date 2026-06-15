import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { STEP_THRESHOLD, SAMPLE_WINDOW, BUFFER_DURATION } from '../constants/theme';
import { syncSteps } from '../lib/stepsSync';

export default function usePedometer() {
  const [stepsPerMinute, setStepsPerMinute] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timeUnlocked, setTimeUnlocked] = useState(0);
  const [timeLocked, setTimeLocked] = useState(0);

  const walkingBuffer = useRef(0);
  const idleBuffer = useRef(0);
  const currentlyWalking = useRef(false);
  const timeInterval = useRef(null);
  const onUnlockCallback = useRef(null);
  const onLockCallback = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

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

        const todayEnd = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaySteps = await Pedometer.getStepCountAsync(todayStart, todayEnd);
        setTotalSteps(todaySteps.steps);
        syncSteps(todaySteps.steps);

        if (spm >= STEP_THRESHOLD) {
          idleBuffer.current = 0;
          if (!currentlyWalking.current) {
            walkingBuffer.current += 1;
            setBufferCount(walkingBuffer.current);
            setIsBuffering(true);
            if (walkingBuffer.current >= BUFFER_DURATION) {
              walkingBuffer.current = 0;
              setIsBuffering(false);
              currentlyWalking.current = true;
              setIsWalking(true);
              if (onUnlockCallback.current) onUnlockCallback.current();
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
              currentlyWalking.current = false;
              setIsWalking(false);
              if (onLockCallback.current) onLockCallback.current();
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

  return {
    stepsPerMinute,
    isWalking,
    isBuffering,
    bufferCount,
    totalSteps,
    timeUnlocked: formatTime(timeUnlocked),
    timeLocked: formatTime(timeLocked),
    currentlyWalking,
    onUnlockCallback,
    onLockCallback,
  };
}