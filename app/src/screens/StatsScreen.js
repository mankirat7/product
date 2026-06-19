import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { colors, spacing } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function StatsScreen() {
  const { settings } = useSettings();
  const [weekData, setWeekData] = useState([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    const available = await Pedometer.isAvailableAsync();
    if (!available) return;

    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(now.getDate() - i);
      end.setHours(23, 59, 59, 999);

      const capped = end > now ? now : end;

      try {
        const result = await Pedometer.getStepCountAsync(start, capped);
        days.push({
          day: DAYS[start.getDay()],
          steps: result.steps,
          isToday: i === 0,
        });
        if (i === 0) setTodaySteps(result.steps);
      } catch {
        days.push({ day: DAYS[start.getDay()], steps: 0, isToday: i === 0 });
      }
    }

    setWeekData(days);
    setLoading(false);
  };

  const maxSteps = Math.max(...weekData.map(d => d.steps), 1);
  const weekTotal = weekData.reduce((sum, d) => sum + d.steps, 0);
  const weekAvg = weekData.length > 0 ? Math.round(weekTotal / weekData.length) : 0;
  const goalPct = Math.min(Math.round((todaySteps / settings.dailyGoal) * 100), 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>your stats</Text>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>today</Text>
        <Text style={styles.todaySteps}>{todaySteps.toLocaleString()}</Text>
        <Text style={styles.todayUnit}>steps</Text>
        <View style={styles.goalBarTrack}>
          <View style={[styles.goalBarFill, { width: `${goalPct}%` }]} />
        </View>
        <Text style={styles.goalText}>{goalPct}% of daily goal</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>last 7 day total</Text>
          <Text style={styles.miniValue}>{weekTotal.toLocaleString()}</Text>
          <Text style={styles.miniUnit}>steps</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>daily avg</Text>
          <Text style={styles.miniValue}>{weekAvg.toLocaleString()}</Text>
          <Text style={styles.miniUnit}>steps</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>last 7 days</Text>
        <View style={styles.chart}>
          {loading ? (
            <Text style={styles.loadingText}>loading...</Text>
          ) : (
            weekData.map((day, i) => {
              const heightPct = Math.max((day.steps / maxSteps) * 100, 4);
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barSteps}>
                    {day.steps >= 1000 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPct}%` },
                        day.isToday && styles.barFillToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, day.isToday && styles.barLabelToday]}>
                    {day.day}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>goal progress</Text>
        <View style={styles.goalRingWrap}>
          <View style={styles.goalRingOuter}>
            <View style={styles.goalRingInner}>
              <Text style={styles.goalRingPct}>{goalPct}%</Text>
              <Text style={styles.goalRingLabel}>of goal</Text>
            </View>
          </View>
        </View>
        <Text style={styles.goalSubtext}>
          {Math.max(settings.dailyGoal - todaySteps, 0).toLocaleString()} steps to reach {settings.dailyGoal.toLocaleString()} today
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  todayCard: {
    backgroundColor: colors.accentBg,
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accentDim,
    fontWeight: '500',
    marginBottom: 8,
  },
  todaySteps: {
    fontSize: 56,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: -2,
    lineHeight: 60,
  },
  todayUnit: {
    fontSize: 13,
    color: colors.accentDim,
    marginBottom: 20,
  },
  goalBarTrack: {
    width: '100%',
    height: 2,
    backgroundColor: colors.accentBorder,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  goalText: {
    fontSize: 11,
    color: colors.accentDim,
    letterSpacing: 0.5,
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
  },
  miniLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 6,
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
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  loadingText: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barSteps: {
    fontSize: 8,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  barFillToday: {
    backgroundColor: colors.accent,
  },
  barLabel: {
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  barLabelToday: {
    color: colors.accent,
  },
  goalRingWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  goalRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBg,
  },
  goalRingInner: {
    alignItems: 'center',
  },
  goalRingPct: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: -0.5,
  },
  goalRingLabel: {
    fontSize: 10,
    color: colors.accentDim,
    letterSpacing: 1,
  },
  goalSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});