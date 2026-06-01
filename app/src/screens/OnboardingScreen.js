import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { colors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: 0,
    label: 'the problem',
    title: 'you unlock your\nphone 96 times\na day.',
    sub: 'most of it is mindless. instagram, tiktok, youtube. the same loop, over and over.',
    accent: false,
  },
  {
    id: 1,
    label: 'the cost',
    title: 'that\'s 3+ hours\nof your life.\nevery day.',
    sub: 'time you could spend moving, thinking, living. instead you\'re horizontal, scrolling.',
    accent: false,
  },
  {
    id: 2,
    label: 'the fix',
    title: 'walk to unlock\nyour apps.',
    sub: 'walkreel blocks your doom scrolling apps until you\'re actually walking. no steps, no reels.',
    accent: true,
  },
  {
    id: 3,
    label: 'how it works',
    title: 'your phone\nsenses your\nmovement.',
    sub: 'using your phone\'s built-in pedometer, walkreel detects when you\'re walking and unlocks automatically. At least get shredded while you doom scroll.',
    accent: false,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToSlide = (nextSlide) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentSlide(nextSlide);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      animateToSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    await Pedometer.requestPermissionsAsync();
    onComplete();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>walkreel</Text>
        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={onComplete}>
            <Text style={styles.skipText}>skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentSlide && styles.dotActive,
              i < currentSlide && styles.dotDone,
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.slideContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={[styles.slideLabel, slide.accent && styles.slideLabelAccent]}>
          {slide.label}
        </Text>
        <Text style={[styles.slideTitle, slide.accent && styles.slideTitleAccent]}>
          {slide.title}
        </Text>
        <Text style={styles.slideSub}>{slide.sub}</Text>
      </Animated.View>

      <View style={styles.bottomBar}>
        {isLast ? (
          <View style={styles.lastSlideButtons}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleGetStarted}>
              <Text style={styles.primaryBtnText}>allow motion access →</Text>
            </TouchableOpacity>
            <Text style={styles.permissionNote}>
              walkreel needs motion access to detect your walking pace. your data never leaves your phone.
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  skipText: {
    fontSize: 14,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 64,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a1a1a',
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accent,
  },
  dotDone: {
    backgroundColor: colors.accentDim,
  },
  slideContent: {
    flex: 1,
    gap: 20,
  },
  slideLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    fontWeight: '500',
  },
  slideLabelAccent: {
    color: colors.accentDim,
  },
  slideTitle: {
    fontSize: 42,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 50,
  },
  slideTitleAccent: {
    color: colors.accent,
  },
  slideSub: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: '85%',
  },
  bottomBar: {
    gap: 16,
  },
  nextBtn: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  lastSlideButtons: {
    gap: 16,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  permissionNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});