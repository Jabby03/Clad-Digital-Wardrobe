import LoadingScreen from '@/components/loading-screen';
import CladLogo from '@/components/clad-logo';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  surface: '#ffffff',
  white: '#ffffff',
  surfaceContainer: '#f4f4f5',
  card: '#fafafa',
  outlineVariant: '#e5e7eb',
  onSurface: '#111111',
  onSurfaceVariant: '#666666',
  placeholder: '#9ca3af',
  primary: '#000000',
  onPrimary: '#ffffff',
  secondary: '#1d3989',
  error: '#ba1a1a',
  emeraldBg: '#d1fae5',
  emeraldText: '#047857',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

type Method = 'email' | 'phone';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [phoneFocused, setPhoneFocused] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const [pulse] = useState(() => new Animated.Value(1));
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Soft pulse on the badge (mirrors animate-pulse)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    return () => {
      if (submitTimer.current) clearTimeout(submitTimer.current);
    };
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const switchMethod = (next: Method) => {
    if (next === method) return;
    setMethod(next);
    setFormError(null);
    setSentTo(null);
  };

  const handleSubmit = () => {
    let target: string;

    if (method === 'email') {
      target = email.trim();
      if (!target) {
        setFormError('Enter your email address to continue.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
        setFormError('Enter a valid email address.');
        return;
      }
    } else {
      target = phone.trim();
      if (!target) {
        setFormError('Enter your mobile number to continue.');
        return;
      }
      if (target.replace(/\D/g, '').length < 7) {
        setFormError('Enter a valid mobile number.');
        return;
      }
    }

    setFormError(null);
    setSentTo(null);
    setSubmitting(true);

    // TODO: replace this simulated delay with the real reset request once auth is configured.
    submitTimer.current = setTimeout(() => {
      setSubmitting(false);
      setSentTo(target);
    }, 450);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : undefined)}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressedScale]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Clad</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={18} color={colors.onSurface} />
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
            <View style={styles.badge}>
              <Animated.View style={[styles.badgePulse, { opacity: pulse }]} />
              <CladLogo />
              <View style={styles.badgeCheck}>
                <MaterialIcons name="verified-user" size={13} color={colors.emeraldText} />
              </View>
            </View>
            <Text style={styles.heroTitle}>Reset Password</Text>
            <Text style={styles.heroSub}>
              Enter your registered email address to receive a secured one-time link to restore
              your atelier vault.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Channel switcher */}
            <View style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: method === 'email' }}
                onPress={() => switchMethod('email')}
                style={[styles.tab, method === 'email' && styles.tabActive]}
              >
                <MaterialIcons
                  name="mail-outline"
                  size={16}
                  color={method === 'email' ? colors.onSurface : colors.onSurfaceVariant}
                />
                <Text style={[styles.tabText, method === 'email' && styles.tabTextActive]}>
                  Email Link
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: method === 'phone' }}
                onPress={() => switchMethod('phone')}
                style={[styles.tab, method === 'phone' && styles.tabActive]}
              >
                <MaterialIcons
                  name="smartphone"
                  size={16}
                  color={method === 'phone' ? colors.onSurface : colors.onSurfaceVariant}
                />
                <Text style={[styles.tabText, method === 'phone' && styles.tabTextActive]}>
                  SMS Passcode
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {method === 'email' ? (
                <View style={styles.field}>
                  <Text style={styles.label}>REGISTERED ACCOUNT</Text>
                  <View style={styles.inputRow}>
                    <MaterialIcons
                      name="alternate-email"
                      size={20}
                      color={colors.placeholder}
                      style={styles.inputIcon}
                      pointerEvents="none"
                    />
                    <TextInput
                      style={[styles.input, emailFocused && styles.inputFocused]}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="name@domain.com"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  <View style={styles.inputRow}>
                    <MaterialIcons
                      name="phone-iphone"
                      size={20}
                      color={colors.placeholder}
                      style={styles.inputIcon}
                      pointerEvents="none"
                    />
                    <TextInput
                      style={[styles.input, phoneFocused && styles.inputFocused]}
                      value={phone}
                      onChangeText={setPhone}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      placeholder="+1 (555) 019-2834"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                    />
                  </View>
                </View>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.cta,
                  submitting && styles.ctaDisabled,
                  pressed && styles.pressedScale,
                ]}
              >
                <Text style={styles.ctaText}>
                  {method === 'email' ? 'Send Verification Link' : 'Request SMS Code'}
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
              </Pressable>
              {formError && <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text>}
            </View>
          </View>

          {/* Success notification */}
          {sentTo && (
            <View style={styles.toast}>
              <View style={styles.toastIcon}>
                <MaterialIcons name="mark-email-read" size={18} color={colors.emeraldText} />
              </View>
              <View style={styles.toastBody}>
                <Text style={styles.toastTitle}>Dispatch Confirmed</Text>
                <Text style={styles.toastText}>
                  {method === 'email' ? 'Recovery instructions sent to ' : 'Passcode sent to '}
                  <Text style={styles.toastTarget}>{sentTo}</Text>
                  {method === 'email'
                    ? '. Please check your inbox or spam directory.'
                    : '. Messages can take a minute to arrive.'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Dismiss notification"
                onPress={() => setSentTo(null)}
                hitSlop={8}
                style={styles.toastClose}
              >
                <MaterialIcons name="close" size={18} color={colors.placeholder} />
              </Pressable>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remember your credentials?</Text>
              <Pressable
                hitSlop={8}
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/sign-in'))}
              >
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
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
    backgroundColor: 'rgba(255,255,255,0.8)',
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
    fontFamily: font.medium,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.onSurface,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Layout
  scroll: { paddingTop: 56, paddingBottom: 32 },
  content: { paddingHorizontal: 16 },

  // Hero
  hero: { width: '100%', alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
    backgroundColor: colors.surfaceContainer,
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
  badgePulse: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  badgeCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  heroTitle: {
    fontFamily: font.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.onSurface,
    textAlign: 'center',
  },
  heroSub: {
    marginTop: 4,
    maxWidth: 290,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Card
  card: {
    width: '100%',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },

  // Channel switcher
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 9999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.6)',
  },
  tab: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: { color: colors.onSurface },

  // Form
  form: { gap: 16 },
  field: { gap: 4 },
  label: {
    paddingHorizontal: 4,
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.55,
    color: colors.onSurfaceVariant,
  },
  inputRow: { justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: {
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.onSurface,
  },
  inputFocused: { backgroundColor: colors.white, borderColor: '#000000' },

  // CTA
  cta: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { fontFamily: font.semibold, fontSize: 17, color: colors.onPrimary },
  formError: {
    marginTop: -8,
    color: colors.error,
    fontFamily: font.medium,
    fontSize: 13,
    textAlign: 'center',
  },

  // Success notification
  toast: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  toastIcon: {
    width: 32,
    height: 32,
    marginTop: 2,
    borderRadius: 16,
    backgroundColor: colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBody: { flex: 1, minWidth: 0 },
  toastTitle: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: colors.onSurface },
  toastText: {
    marginTop: 2,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  toastTarget: { fontFamily: font.medium, color: colors.onSurface },
  toastClose: { padding: 4 },

  // Footer
  footer: { marginTop: 32, paddingTop: 4, alignItems: 'center' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontFamily: font.regular, fontSize: 15, color: colors.onSurfaceVariant },
  signInLink: {
    fontFamily: font.medium,
    fontSize: 17,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});