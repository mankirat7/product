import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StreakModal({ streak, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(numberAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 500);
  }, []);

  const isNewRecord = streak.current === streak.best && streak.current > 1;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>

        <Animated.View
          style={[
            styles.iconWrap,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              }],
            }
          ]}
        >
          <Ionicons name="flame" size={36} color={colors.accent} />
        </Animated.View>

        {isNewRecord && (
          <View style={styles.recordBadge}>
            <Text style={styles.recordBadgeText}>new record</Text>
          </View>
        )}

        <Text style={styles.label}>day streak</Text>

        <Animated.Text
          style={[
            styles.number,
            {
              opacity: numberAnim,
              transform: [{
                translateY: numberAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }
          ]}
        >
          {streak.current}
        </Animated.Text>

        <Text style={styles.message}>
          {streak.current === 1
            ? "first day done.\nlet's keep it going."
            : streak.current < 7
            ? `${streak.current} days in a row.\nyou're building something real.`
            : streak.current < 30
            ? `${streak.current} days straight.\nthis is becoming a habit.`
            : `${streak.current} days.\nyou're unstoppable.`}
        </Text>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streak.current}</Text>
            <Text style={styles.statLabel}>current</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streak.best}</Text>
            <Text style={styles.statLabel}>best</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>keep going →</Text>
        </TouchableOpacity>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#0a0a0a',
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentBg,
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 36,
  },
  recordBadge: {
    backgroundColor: colors.accentBg,
    borderWidth: 0.5,
    borderColor: colors.accentBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recordBadgeText: {
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    fontWeight: '500',
  },
  number: {
    fontSize: 80,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: -3,
    lineHeight: 88,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  btn: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});