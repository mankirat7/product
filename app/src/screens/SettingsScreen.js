import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { colors, STEP_THRESHOLD, DAILY_STEP_GOAL } from '../constants/theme';

const APPS = [
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'musical-notes-outline' },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube' },
  { id: 'twitter', name: 'Twitter / X', icon: 'logo-twitter' },
  { id: 'snapchat', name: 'Snapchat', icon: 'camera-outline' },
  { id: 'reddit', name: 'Reddit', icon: 'logo-reddit' },
];

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [goalInput, setGoalInput] = useState(String(settings.dailyGoal));

  const adjustThreshold = (amount) => {
    const next = Math.min(Math.max(settings.threshold + amount, 20), 120);
    updateSettings({ threshold: next });
  };

  const toggleApp = (id) => {
    updateSettings({
      blockedApps: { ...settings.blockedApps, [id]: !settings.blockedApps[id] }
    });
  };

  const resetSettings = () => {
    updateSettings({
      threshold: STEP_THRESHOLD,
      dailyGoal: DAILY_STEP_GOAL,
      blockedApps: {
        instagram: true,
        tiktok: true,
        youtube: true,
        twitter: false,
        snapchat: false,
        reddit: false,
      },
      strictMode: false,
      haptics: true,
    });
    setGoalInput(String(DAILY_STEP_GOAL));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>walking threshold</Text>
        <Text style={styles.sectionSub}>minimum steps per minute to unlock apps</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustThreshold(-5)}>
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <View style={styles.stepperCenter}>
            <Text style={styles.stepperValue}>{settings.threshold}</Text>
            <Text style={styles.stepperUnit}>steps / min</Text>
          </View>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustThreshold(5)}>
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.thresholdHints}>
          <Text style={[styles.hint, settings.threshold <= 40 && styles.hintActive]}>easy</Text>
          <Text style={[styles.hint, settings.threshold > 40 && settings.threshold <= 80 && styles.hintActive]}>moderate</Text>
          <Text style={[styles.hint, settings.threshold > 80 && styles.hintActive]}>strict</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>daily step goal</Text>
        <Text style={styles.sectionSub}>target steps shown on stats screen</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => {
            const next = Math.min(Math.max(settings.dailyGoal - 1000, 1000), 100000);
            updateSettings({ dailyGoal: next });
            setGoalInput(String(next));
          }}>
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.stepperInput}
            value={goalInput}
            keyboardType="number-pad"
            returnKeyType="done"
            onChangeText={(val) => setGoalInput(val)}
            onEndEditing={() => {
              const parsed = parseInt(goalInput);
              if (!isNaN(parsed) && parsed >= 1000) {
                updateSettings({ dailyGoal: Math.min(parsed, 100000) });
                setGoalInput(String(Math.min(parsed, 100000)));
              } else {
                setGoalInput(String(settings.dailyGoal));
              }
            }}
          />
          <Text style={styles.stepperUnit}>steps</Text>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => {
            const next = Math.min(Math.max(settings.dailyGoal + 1000, 1000), 100000);
            updateSettings({ dailyGoal: next });
            setGoalInput(String(next));
          }}>
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>blocked apps</Text>
        <Text style={styles.sectionSub}>these apps require walking to unlock</Text>
        <View style={styles.card}>
          {APPS.map((app, i) => (
            <View key={app.id}>
              <View style={styles.appRow}>
                <Ionicons name={app.icon} size={20} color={colors.textSecondary} />
                <Text style={styles.appName}>{app.name}</Text>
                <Switch
                  value={settings.blockedApps[app.id]}
                  onValueChange={() => toggleApp(app.id)}
                  trackColor={{ false: '#1a1a1a', true: colors.accentBg }}
                  thumbColor={settings.blockedApps[app.id] ? colors.accent : '#333'}
                  ios_backgroundColor="#1a1a1a"
                />
              </View>
              {i < APPS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>preferences</Text>
        <View style={styles.card}>
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.prefLabel}>strict mode</Text>
              <Text style={styles.prefSub}>lock immediately when you stop walking</Text>
            </View>
            <Switch
              value={settings.strictMode}
              onValueChange={(val) => updateSettings({ strictMode: val })}
              trackColor={{ false: '#1a1a1a', true: colors.accentBg }}
              thumbColor={settings.strictMode ? colors.accent : '#333'}
              ios_backgroundColor="#1a1a1a"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.prefLabel}>haptic feedback</Text>
              <Text style={styles.prefSub}>vibrate on lock and unlock</Text>
            </View>
            <Switch
              value={settings.haptics}
              onValueChange={(val) => updateSettings({ haptics: val })}
              trackColor={{ false: '#1a1a1a', true: colors.accentBg }}
              thumbColor={settings.haptics ? colors.accent : '#333'}
              ios_backgroundColor="#1a1a1a"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>about</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>version</Text>
            <Text style={styles.aboutValue}>0.1.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>built by</Text>
            <Text style={styles.aboutValue}>walkreel</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={resetSettings}>
        <Text style={styles.resetBtnText}>reset to defaults</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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
    gap: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stepperCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 56,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: colors.border,
  },
  stepperBtnText: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  stepperCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  stepperUnit: {
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginRight: 12,
  },
  thresholdHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  hint: {
    fontSize: 10,
    color: '#222',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hintActive: {
    color: colors.accent,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  appName: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  prefText: {
    flex: 1,
    gap: 3,
  },
  prefLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  prefSub: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 17,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  aboutLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  resetBtn: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  stepperInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
    paddingVertical: 16,
  },
});