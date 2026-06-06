import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen({ onComplete }) {
  const lineOneAnim = useRef(new Animated.Value(0)).current;
  const lineTwoAnim = useRef(new Animated.Value(0)).current;
  const lineThreeAnim = useRef(new Animated.Value(0)).current;
  const accentAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const lineOneSlide = useRef(new Animated.Value(20)).current;
  const lineTwoSlide = useRef(new Animated.Value(20)).current;
  const lineThreeSlide = useRef(new Animated.Value(20)).current;

useEffect(() => {
  Animated.sequence([
    Animated.delay(400),

    Animated.parallel([
      Animated.timing(lineOneAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(lineOneSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]),

    Animated.delay(150),

    Animated.parallel([
      Animated.timing(lineTwoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(lineTwoSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]),

    Animated.delay(150),

    Animated.parallel([
      Animated.timing(lineThreeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(lineThreeSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]),

    Animated.delay(150),

    Animated.timing(accentAnim, { toValue: 1, duration: 500, useNativeDriver: true }),

    Animated.delay(2000),

    Animated.timing(fadeOutAnim, { toValue: 0, duration: 700, useNativeDriver: true }),

  ]).start(() => onComplete());
}, []);

  return (
    <Animated.View style={[styles.screen, { opacity: fadeOutAnim }]}>
      <View style={styles.content}>
        <View style={styles.taglineWrap}>
          <Animated.Text
            style={[
              styles.line,
              {
                opacity: lineOneAnim,
                transform: [{ translateY: lineOneSlide }],
              }
            ]}
          >
            you aren't only unlocking your reels...
          </Animated.Text>



          <Animated.Text
            style={[
              styles.line,
              styles.lineAccent,
              {
                opacity: lineThreeAnim,
                transform: [{ translateY: lineThreeSlide }],
              }
            ]}
          >
            you're unlocking
          </Animated.Text>

          <Animated.Text
            style={[
              styles.line,
              styles.lineAccent,
              {
                opacity: lineThreeAnim,
                transform: [{ translateY: lineThreeSlide }],
              }
            ]}
          >
            your potential.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.accentLine, { opacity: accentAnim }]} />
      </View>

      <Animated.View style={[styles.bottom, { opacity: accentAnim }]}>
        <Text style={styles.wordmark}>walkreel</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 56,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  taglineWrap: {
    gap: 4,
  },
  line: {
    fontSize: 38,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 46,
  },
  lineAccent: {
    color: colors.accent,
  },
  accentLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: 8,
  },
  bottom: {
    alignItems: 'flex-start',
  },
  wordmark: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});