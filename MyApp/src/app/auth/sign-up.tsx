import LoadingScreen from '@/components/loading-screen';
import CladLogo from '@/components/clad-logo';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';

// Design tokens (light theme, from code.html)
const colors = {
  surface: '#fbfbfb',
  white: '#ffffff',
  surfaceContainer: '#f4f4f5',
  outlineVariant: '#e5e7eb',
  checkboxBorder: '#d1d5db',
  onSurface: '#111111',
  onSurfaceVariant: '#666666',
  placeholder: '#9ca3af',
  primary: '#000000',
  onPrimary: '#ffffff',
  secondary: '#1d3989',
  error: '#ba1a1a',
  glow: '#e2e8f0',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

// Password strength: 0 = empty, 1-4 = weak to strong
type StrengthMeta = { label: string; bar: string; text: string };

const STRENGTH: Record<1 | 2 | 3 | 4, StrengthMeta> = {
  1: { label: 'Weak', bar: '#ef4444', text: '#dc2626' },
  2: { label: 'Fair', bar: '#f59e0b', text: '#d97706' },
  3: { label: 'Good', bar: '#10b981', text: '#059669' },
  4: { label: 'Strong Security', bar: '#10b981', text: '#059669' },
};

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.max(score, 1) as 1 | 2 | 3 | 4;
}

function GlowAura() {
  return (
    <View pointerEvents="none" style={styles.glow}>
      <Svg width={192} height={192}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.glow} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={colors.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="192" height="192" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

export default function SignupScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [nameFocused, setNameFocused] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passFocused, setPassFocused] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const strength = getStrength(password);
  const strengthMeta = strength === 0 ? null : STRENGTH[strength];

  const handleSubmit = () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (!normalizedName || !normalizedEmail || !password) {
      setFormError('Enter your name, email address, and password to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Your password must be at least 8 characters.');
      return;
    }
    if (!acceptedTerms) {
      setFormError('Accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setFormError(null);
    router.replace('/main/today');
  };

  const showAuthUnavailable = () => {
    Alert.alert('Not available yet', 'Authentication is not configured for this app.');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/sign-in'))}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressedScale]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Clad</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={18} color={colors.onPrimary} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.hero}>
            <GlowAura />
            <View style={styles.monogramCircle}>
              <CladLogo />
            </View>
            <Text style={styles.motto}>WEAR IT, CLAD IT</Text>
            <Text style={styles.heroTitle}>Create Your Wardrobe</Text>
            <Text style={styles.heroSub}>
              Curate your digital closet, plan daily rotations, and automate garment care.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
                <MaterialIcons name="person-outline" size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                <MaterialIcons name="mail-outline" size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
                <MaterialIcons name="lock-outline" size={20} color={colors.onSurfaceVariant} />
                <TextInput
                  style={[styles.input, { paddingRight: 36 }]}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
                <Pressable
                  accessibilityLabel="Toggle password visibility"
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>

              {/* Strength indicator */}
              <View style={styles.strength}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            strengthMeta && i <= strength ? strengthMeta.bar : colors.outlineVariant,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.strengthRow}>
                  {strengthMeta ? (
                    <View style={styles.strengthLabelRow}>
                      <View style={[styles.strengthDot, { backgroundColor: strengthMeta.bar }]} />
                      <Text style={[styles.strengthLabel, { color: strengthMeta.text }]}>
                        {strengthMeta.label}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <Text style={styles.strengthHint}>8+ chars, mix of symbols</Text>
                </View>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.terms}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                accessibilityLabel="Accept Terms of Service and Privacy Policy"
                onPress={() => setAcceptedTerms((v) => !v)}
                hitSlop={8}
                style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
              >
                {acceptedTerms && <MaterialIcons name="check" size={16} color={colors.onPrimary} />}
              </Pressable>
              <Text style={styles.termsText}>
                By registering, you agree to Clad&apos;s{' '}
                <Text style={styles.termsLink} onPress={showAuthUnavailable}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.termsLink} onPress={showAuthUnavailable}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            <View style={styles.ctaRow}>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [styles.cta, pressed && styles.pressedScale]}
              >
                <Text style={styles.ctaText}>Create Account</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />
              </Pressable>
            </View>
            {formError && <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text>}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable hitSlop={8} onPress={() => router.replace('/auth/sign-in')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
            <View style={styles.secureRow}>
              <MaterialIcons name="verified-user" size={16} color={colors.placeholder} />
              <Text style={styles.secureText}>PROTECTED BY CLAD SECURE SYNC</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: 'center', justifyContent: 'center' },
  pressedScale: { transform: [{ scale: 0.97 }] },

  // Header
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(251,251,251,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,231,235,0.6)',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: font.semibold,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.onSurface,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Layout
  scroll: { paddingTop: 56, paddingBottom: 32 },
  content: { paddingHorizontal: 16 },
  glow: { position: 'absolute', top: -48, width: 192, height: 192, alignSelf: 'center' },

  // Hero
  hero: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  monogramCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  motto: {
    marginBottom: 4,
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 3.08,
    color: colors.onSurfaceVariant,
    paddingLeft: 3.08, // balances trailing letter-spacing so text looks centered
  },
  heroTitle: {
    marginBottom: 4,
    fontFamily: font.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.onSurface,
    textAlign: 'center',
  },
  heroSub: {
    maxWidth: 320,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Form
  form: { width: '100%', gap: 16 },
  field: { gap: 4 },
  label: {
    paddingLeft: 4,
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.55,
    color: colors.onSurfaceVariant,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapFocused: { backgroundColor: colors.white, borderColor: colors.onSurface },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.onSurface,
  },
  eyeBtn: { position: 'absolute', right: 16, padding: 4 },

  // Strength indicator
  strength: { gap: 6, paddingHorizontal: 4, paddingTop: 4 },
  strengthBars: { flexDirection: 'row', gap: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 9999 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strengthLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  strengthDot: { width: 6, height: 6, borderRadius: 3 },
  strengthLabel: { fontFamily: font.semibold, fontSize: 11, lineHeight: 13 },
  strengthHint: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.onSurfaceVariant },

  // Terms
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingTop: 4, paddingHorizontal: 4 },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.checkboxBorder,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.onSurface, borderColor: colors.onSurface },
  termsText: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  termsLink: {
    fontFamily: font.medium,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },

  // CTA
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  cta: {
    flex: 1,
    height: 56,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaText: { fontFamily: font.medium, fontSize: 17, color: colors.onPrimary },
  formError: {
    marginTop: -8,
    color: colors.error,
    fontFamily: font.medium,
    fontSize: 13,
    textAlign: 'center',
  },

  // Footer
  footer: { marginTop: 24, alignItems: 'center', gap: 24 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontFamily: font.regular, fontSize: 15, color: colors.onSurfaceVariant },
  signInLink: { fontFamily: font.semibold, fontSize: 17, color: colors.secondary },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.placeholder,
  },
});
