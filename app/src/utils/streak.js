import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'streak_data';

const today = () => new Date().toISOString().split('T')[0];

const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2 - d1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const loadStreak = async () => {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, best: 0, lastCompletedDate: null, goalHitToday: false };
    return JSON.parse(raw);
  } catch {
    return { current: 0, best: 0, lastCompletedDate: null, goalHitToday: false };
  }
};

export const saveStreak = async (data) => {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {
    console.log('failed to save streak', e);
  }
};

export const checkAndUpdateStreak = async (totalSteps, dailyGoal) => {
  const streak = await loadStreak();
  const todayStr = today();

  if (streak.goalHitToday && streak.lastCompletedDate === todayStr) {
    return { streak, justCompleted: false };
  }

  if (totalSteps < dailyGoal) {
    const daysSinceLast = streak.lastCompletedDate
      ? daysBetween(streak.lastCompletedDate, todayStr)
      : null;

    if (daysSinceLast !== null && daysSinceLast > 1) {
      const reset = { ...streak, current: 0 };
      await saveStreak(reset);
      return { streak: reset, justCompleted: false };
    }

    return { streak, justCompleted: false };
  }

  let newCurrent = streak.current;

  if (!streak.lastCompletedDate) {
    newCurrent = 1;
  } else {
    const daysSinceLast = daysBetween(streak.lastCompletedDate, todayStr);
    if (daysSinceLast === 1) {
      newCurrent = streak.current + 1;
    } else if (daysSinceLast === 0) {
      newCurrent = streak.current;
    } else {
      newCurrent = 1;
    }
  }

  const newBest = Math.max(newCurrent, streak.best);
  const updated = {
    current: newCurrent,
    best: newBest,
    lastCompletedDate: todayStr,
    goalHitToday: true,
  };

  await saveStreak(updated);
  return { streak: updated, justCompleted: true };
};