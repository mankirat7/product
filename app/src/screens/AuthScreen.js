import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/theme';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else {
        if (username.length < 3) throw new Error('username must be at least 3 characters');
        if (username.includes(' ')) throw new Error('username cannot contain spaces');

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.toLowerCase() }
          }
        });

        if (error) throw error;
        onAuth();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.wordmark}>walkreel</Text>
        <Text style={styles.tagline}>
          {mode === 'login' ? 'welcome back.' : 'create your account.'}
        </Text>

        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="yourname"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          {error !== '' && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.btnText}>
                  {mode === 'login' ? 'log in →' : 'create account →'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => {
          setMode(mode === 'login' ? 'signup' : 'login');
          setError('');
        }}>
          <Text style={styles.switchText}>
            {mode === 'login'
              ? "don't have an account? sign up"
              : 'already have an account? log in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 48,
    gap: 32,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 36,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 42,
  },
  form: {
    gap: 16,
  },
  inputWrap: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 0.2,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  switchText: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});