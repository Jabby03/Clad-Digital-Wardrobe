import CladLogo from '@/components/clad-logo';
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHydrated } from "@/hooks/use-hydrated";

const COLORS = {
  surface: "#fbf9f8",
  primary: "#000000",
  onPrimary: "#ffffff",
  onSurface: "#1b1c1c",
  onSurfaceVariant: "#444748",
  secondary: "#4059aa",
  outline: "#747878",
  outlineVariant: "#c4c7c7",
  surfaceContainerLow: "#f5f3f3",
};

const HERO_IMAGE = require("@/assets/branding/clothes-bg.jpg");


export default function OpeningPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const hasHydrated = useHydrated();

  // Match the server layout on the first browser render, then use device measurements.
  const layoutHeight = hasHydrated ? height : 0;
  const topInset = hasHydrated ? insets.top : 0;
  const bottomInset = hasHydrated ? insets.bottom : 0;
  const heroHeight = Math.max(layoutHeight * 0.52, 340);

  const handleGetStarted = (): void => {
    router.push("/auth/sign-in" as Href);
  };

  const handleSignIn = (): void => {
    router.push("/auth/sign-in" as Href);
  };

  const showPolicyUnavailable = (policy: string): void => {
    Alert.alert(policy, "This page is not available yet.");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1 }}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { minHeight: layoutHeight }]}>
        {/* Hero */}
        <View style={{ width: "100%", height: heroHeight, overflow: "hidden" }}>
          <Image
            source={HERO_IMAGE}
            accessibilityLabel="Clothes collection background"
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Svg
            width="100%"
            height="100%"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Defs>
              <SvgLinearGradient id="openingHeroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(251,249,248,0.2)" />
                <Stop offset="60%" stopColor="rgba(251,249,248,0.6)" />
                <Stop offset="100%" stopColor={COLORS.surface} />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#openingHeroGradient)" />
          </Svg>
          <View style={[styles.heroTopBar, { paddingTop: 24 + topInset }]}>
            <View style={styles.monogramWrap}>
              <CladLogo />
            </View>
          </View>
        </View>

        {/* Content */}
        <View
          style={[styles.content, { paddingBottom: 32 + bottomInset }]}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.title}>CLAD</Text>
            <Text style={styles.tagline}>WEAR IT, CLAD IT.</Text>
            <Text style={styles.description}>
              Curate your digital wardrobe and plan daily looks effortlessly.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get started and sign in"
              onPress={handleGetStarted}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={COLORS.onPrimary}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Already a member?</Text>
              <Text style={styles.secondaryButtonLink}>Sign In</Text>
            </Pressable>

            <Text style={styles.legal}>
              By continuing, you agree to Clad’s{" "}
              <Text
                accessibilityRole="link"
                onPress={() => showPolicyUnavailable("Terms of Service")}
                style={styles.legalLink}
              >
                Terms of Service
              </Text>{" "}
              &{" "}
              <Text
                accessibilityRole="link"
                onPress={() => showPolicyUnavailable("Privacy Policy")}
                style={styles.legalLink}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  monogramWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(196,199,199,0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    marginTop: -48,
    justifyContent: "space-between",
    zIndex: 10,
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -1.2,
    color: COLORS.primary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  tagline: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: COLORS.secondary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  description: {
    marginTop: 24,
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: -0.08,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 384,
    alignSelf: "center",
    paddingTop: 32,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.56,
    color: COLORS.onPrimary,
  },
  secondaryButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  secondaryButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.56,
    color: COLORS.onSurface,
  },
  secondaryButtonLink: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.56,
    color: COLORS.secondary,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  legal: {
    paddingHorizontal: 16,
    paddingTop: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: COLORS.outline,
    textAlign: "center",
  },
  legalLink: {
    textDecorationLine: "underline",
  },
});
