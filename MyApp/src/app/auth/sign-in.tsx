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
import { useRouter, type Href } from 'expo-router';
import Svg, { Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';

// Design tokens (light theme, from login_page.html)
const colors = {
  surface: '#ffffff',
  surfaceContainer: '#f4f4f5',
  surfaceContainerHighest: '#e4e4e7',
  surfaceContainerPressed: '#f8f9fa',
  onSurface: '#111111',
  onSurfaceVariant: '#666666',
  outline: '#747878',
  placeholder: '#8e9192',
  primary: '#111111',
  onPrimary: '#ffffff',
  secondary: '#1d4ed8',
  error: '#ba1a1a',
  glow: '#dbeafe',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

type GoogleIconProps = { size?: number };

function GoogleIcon({ size = 20 }: GoogleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.68-5.16 3.68-9.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z"
        fill="#34A853"
      />
      <Path
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
        fill="#FBBC05"
      />
      <Path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function GlowAura() {
  return (
    <View pointerEvents="none" style={styles.glow}>
      <Svg width={192} height={192}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.glow} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={colors.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="192" height="192" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passFocused, setPassFocused] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const handleSubmit = () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setFormError('Enter your email address and password to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError('Enter a valid email address.');
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
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
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
          <GlowAura />

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.monogramCircle}>
              <CladLogo />
            </View>
            <Text style={styles.brand}>CLAD</Text>
            <Text style={styles.tagline}>WEAR IT, CLAD IT.</Text>
            <Text style={styles.heroTitle}>Sign In to Your Wardrobe</Text>
            <Text style={styles.heroSub}>
              Access your digital closet, daily dress code schedules, and curated rotations.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
              </View>
              <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                <MaterialIcons name="alternate-email" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Enter your emeail address"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push('/auth/forgot-pass' as Href)}
                  style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
                >
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>
              </View>
              <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
                <MaterialIcons name="lock-outline" size={20} color={colors.outline} />
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
                  autoComplete="password"
                  textContentType="password"
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
                    color={colors.outline}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.ctaRow}>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [styles.cta, pressed && styles.pressedScale]}
              >
                <Text style={styles.ctaText}>Enter Wardrobe</Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
              </Pressable>
            </View>
            {formError && <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text>}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONNECT WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* SSO */}
          <View style={styles.sso}>
            <Pressable
              onPress={showAuthUnavailable}
              style={({ pressed }) => [
                styles.ssoBtn,
                pressed && styles.ssoBtnPressed,
                pressed && styles.pressedScale,
              ]}
            >
              <GoogleIcon />
              <Text style={styles.ssoText}>Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to Clad?</Text>
              <Pressable hitSlop={8} onPress={() => router.push('/auth/sign-up' as Href)}>
                <Text style={styles.createLink}>Create Account</Text>
              </Pressable>
            </View>
            <View style={styles.secureRow}>
              <MaterialIcons name="shield" size={14} color={colors.outline} />
              <Text style={styles.secureText}>Protected by Clad Secure Sync</Text>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Layout
  scroll: { paddingTop: 56 + 8, paddingBottom: 32 },
  content: { paddingHorizontal: 16, alignItems: 'center' },
  glow: { position: 'absolute', top: -40, width: 192, height: 192, alignSelf: 'center' },

  // Hero
  hero: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  monogramCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brand: {
    marginTop: 16,
    fontFamily: font.bold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 8.5,
    color: colors.onSurface,
    textAlign: 'center',
    paddingLeft: 8.5, // balances trailing letter-spacing so text looks centered
  },
  tagline: {
    marginTop: 4,
    fontFamily: font.semibold,
    fontSize: 13,
    letterSpacing: 1.3,
    color: colors.outline,
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: font.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.onSurface,
    textAlign: 'center',
  },
  heroSub: {
    marginTop: 4,
    maxWidth: 320,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Form
  form: { width: '100%', gap: 16 },
  field: { gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.55,
    color: colors.onSurfaceVariant,
  },
  link: { fontFamily: font.semibold, fontSize: 13, color: colors.secondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: 9999,
  },
  inputWrapFocused: { backgroundColor: colors.surface, borderColor: '#000000' },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.onSurface,
  },
  eyeBtn: { position: 'absolute', right: 12, padding: 6 },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaText: { fontFamily: font.semibold, fontSize: 17, color: colors.onPrimary },
  formError: {
    marginTop: -8,
    color: colors.error,
    fontFamily: font.medium,
    fontSize: 13,
    textAlign: 'center',
  },

  // Divider
  divider: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surfaceContainerHighest },
  dividerText: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.outline,
    paddingHorizontal: 4,
  },

  // SSO
  sso: { width: '100%', gap: 8 },
  ssoBtn: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ssoBtnPressed: { backgroundColor: colors.surfaceContainerPressed },
  ssoText: {
    fontFamily: font.medium,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.onSurface,
  },

  // Footer
  footer: { marginTop: 24, alignItems: 'center', gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontFamily: font.regular, fontSize: 15, color: colors.onSurfaceVariant },
  createLink: { fontFamily: font.semibold, fontSize: 17, color: colors.secondary },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, opacity: 0.8 },
  secureText: { fontFamily: font.medium, fontSize: 10, letterSpacing: -0.2, color: colors.outline },
});
