import CladLogo from '@/components/clad-logo';
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* --------------------------------- Types --------------------------------- */

export type Profile = {
  name?: string;
  username?: string;
  avatarUrl?: string;
  verified?: boolean;
  stats?: {
    garments?: number;
    rotationPercent?: number;
    rotationStatus?: string; // e.g. "Optimal"
    lookbooks?: number;
  };
  protocol?: {
    title: string;
    description?: string;
    synced?: boolean;
    nextTrigger?: string;
  };
  sizes?: { top?: string; bottom?: string; shoes?: string };
  laundry?: { triggerPercent?: number; washTempC?: number };
  weather?: { location?: string; rainAlerts?: boolean };
  appearance?: string;
  security?: { biometrics?: string; email?: string };
};

/* Connect your data source here (auth, store, Supabase, API, etc.). */
function useProfile(): Profile | null {
  return null;
}

/* ----------------------------- Design tokens ----------------------------- */

const C = {
  surface: "#fbf9f8",
  primary: "#000000",
  onPrimary: "#ffffff",
  onSurface: "#1b1c1c",
  onSurfaceVariant: "#444748",
  secondary: "#4059aa",
  onSecondary: "#ffffff",
  secondaryFixed: "#dce1ff",
  onSecondaryFixed: "#00164e",
  outline: "#747878",
  surfaceContainer: "#efeded",
  surfaceContainerHigh: "#e9e8e7",
  surfaceContainerLow: "#f5f3f3",
  surfaceContainerLowest: "#ffffff",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif", default: "serif" });

const T = {
  bodySm: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const, letterSpacing: -0.08 },
  labelMd: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0.72 },
  labelSm: { fontSize: 10, lineHeight: 14, fontWeight: "600" as const, letterSpacing: 0.8 },
  headlineMd: { fontSize: 24, lineHeight: 32, fontWeight: "400" as const, letterSpacing: -0.24, fontFamily: SERIF },
  headlineSm: { fontSize: 20, lineHeight: 28, fontWeight: "500" as const, fontFamily: SERIF },
};

const shadowSm = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};


type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

/* ----------------------------- Subtitle helpers -------------------------- */

const NOT_SET = "Not set";
const join = (parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" • ");

function measurementsSummary(p: Profile | null): string {
  const s = p?.sizes;
  return (
    join([
      s?.top && `Top: ${s.top}`,
      s?.bottom && `Bottom: ${s.bottom}`,
      s?.shoes && `Shoes: ${s.shoes}`,
    ]) || NOT_SET
  );
}

function laundrySummary(p: Profile | null): string {
  const l = p?.laundry;
  return (
    join([
      l?.triggerPercent !== undefined && `Trigger at ${l.triggerPercent}% capacity`,
      l?.washTempC !== undefined && `Default wash ${l.washTempC}°C`,
    ]) || NOT_SET
  );
}

function weatherSummary(p: Profile | null): string {
  const w = p?.weather;
  return join([w?.location, w?.rainAlerts && "Auto rain layer alerts"]) || NOT_SET;
}

function securitySummary(p: Profile | null): string {
  return join([p?.security?.biometrics, p?.security?.email]) || NOT_SET;
}

/* --------------------------------- Screen -------------------------------- */

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfile();

  const stats = profile?.stats;
  const protocol = profile?.protocol;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const careRows: Row[] = [
    { icon: "straighten", title: "Body Measurements & Sizes", subtitle: measurementsSummary(profile) },
    { icon: "local-laundry-service", title: "Laundry Automation & Hamper Rules", subtitle: laundrySummary(profile) },
    { icon: "cloud", title: "Weather & Climate Sync", subtitle: weatherSummary(profile) },
  ];

  const systemRows: Row[] = [
    { icon: "palette", title: "Appearance", subtitle: profile?.appearance ?? NOT_SET },
    { icon: "notifications-active", title: "Push Notifications", subtitle: "Dress codes, hamper alerts, wear streaks" },
    { icon: "fingerprint", title: "Security & Biometrics", subtitle: securitySummary(profile) },
    { icon: "download", title: "Data & Export", subtitle: "Export wardrobe inventory JSON/CSV" },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.iconBtn, { marginLeft: -4 }, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back-ios-new" size={20} color={C.onSurface} />
            </Pressable>
            <CladLogo size={30} />
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              accessibilityLabel="Options menu"
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="more-horiz" size={22} color={C.onSurface} />
            </Pressable>
            <View style={styles.smallAvatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.fill} resizeMode="cover" />
              ) : (
                <MaterialIcons name="person" size={18} color={C.onSurfaceVariant} />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Main */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 64 + insets.top,
          paddingBottom: 40 + insets.bottom,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  accessibilityLabel={profile.name ?? "Profile photo"}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatarImg, styles.centered]}>
                  <MaterialIcons name="person" size={56} color={C.outline} />
                </View>
              )}
            </View>
            <Pressable
              accessibilityLabel="Update profile photo"
              style={({ pressed }) => [styles.cameraBtn, pressed && { transform: [{ scale: 0.9 }] }]}
            >
              <MaterialIcons name="photo-camera" size={18} color={C.onPrimary} />
            </Pressable>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile?.name ?? "Your Name"}</Text>
            {profile?.verified ? (
              <MaterialIcons name="verified" size={18} color={C.secondary} />
            ) : null}
          </View>
          {profile?.username ? (
            <Text style={styles.handle}>@{profile.username}</Text>
          ) : null}

          <View style={styles.quickActions}>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionPrimary, pressed && styles.pressed]}>
              <MaterialIcons name="tune" size={16} color={C.onPrimary} />
              <Text style={[styles.actionText, { color: C.onPrimary }]}>Edit Profile</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionSecondary, pressed && styles.pressed]}>
              <MaterialIcons name="ios-share" size={16} color={C.onSurface} />
              <Text style={[styles.actionText, { color: C.onSurface }]}>Share Wardrobe</Text>
            </Pressable>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metrics}>
          <Metric
            value={String(stats?.garments ?? 0)}
            label="Garments"
            sub="Cataloged"
          />
          <Metric
            value={stats?.rotationPercent !== undefined ? `${stats.rotationPercent}%` : "—"}
            label="Rotation"
            sub={stats?.rotationStatus}
            valueColor={C.secondary}
            subColor={C.onSurface}
          />
          <Metric
            value={String(stats?.lookbooks ?? 0)}
            label="Lookbooks"
            sub="Curated"
          />
        </View>

        {/* Active protocol */}
        <View style={[styles.card, styles.protocolCard]}>
          <View style={styles.protocolHead}>
            <View style={styles.protocolTitleWrap}>
              <View style={styles.protocolIcon}>
                <MaterialIcons name="calendar-month" size={18} color={C.onSecondaryFixed} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protocolEyebrow}>ACTIVE PROTOCOL</Text>
                <Text style={styles.protocolTitle} numberOfLines={2}>
                  {protocol?.title ?? "No active protocol"}
                </Text>
              </View>
            </View>
            {protocol?.synced ? (
              <View style={styles.syncedPill}>
                <Text style={styles.syncedText}>SYNCED</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.protocolDesc}>
            {protocol?.description ??
              (protocol ? "" : "Dress code rules you set up will appear here.")}
          </Text>

          <View style={styles.protocolFooter}>
            <View style={styles.triggerRow}>
              {protocol?.nextTrigger ? (
                <>
                  <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />
                  <Text style={styles.triggerText} numberOfLines={1}>
                    Next rule trigger: {protocol.nextTrigger}
                  </Text>
                </>
              ) : (
                <Text style={styles.triggerText} numberOfLines={1}>
                  {protocol ? "No upcoming triggers" : "Add a dress code rule"}
                </Text>
              )}
            </View>
            <Pressable
              accessibilityLabel="Configure dress code rules"
              style={({ pressed }) => [styles.chevronBtn, pressed && { transform: [{ scale: 0.9 }] }]}
            >
              <MaterialIcons name="chevron-right" size={18} color={C.onSurface} />
            </Pressable>
          </View>
        </View>

        {/* Sections */}
        <Section heading="WARDROBE & CARE INTEL" rows={careRows} />
        <Section heading="PREFERENCES & SYSTEM" rows={systemRows} />
      </ScrollView>
    </View>
  );
}

/* ------------------------------- Sub-components -------------------------- */

function Metric({
  value,
  label,
  sub,
  valueColor = C.onSurface,
  subColor = C.secondary,
}: {
  value: string;
  label: string;
  sub?: string;
  valueColor?: string;
  subColor?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label.toUpperCase()}</Text>
      {sub ? <Text style={[styles.metricSub, { color: subColor }]}>{sub}</Text> : null}
    </View>
  );
}

type Row = { icon: IconName; title: string; subtitle: string };

function Section({ heading, rows }: { heading: string; rows: Row[] }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      <View style={[styles.card, styles.list]}>
        {rows.map((row, i) => (
          <View key={row.title}>
            {i > 0 && <View style={styles.divider} />}
            <Pressable style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surfaceContainer }]}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIcon}>
                  <MaterialIcons name={row.icon} size={20} color={C.onSurface} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {row.subtitle}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={C.outline} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  fill: { width: "100%", height: "100%" },
  centered: { alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.95 }] },

  /* header */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(251,249,248,0.92)",
    ...shadowSm,
  },
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 28, height: 28, opacity: 0.9 },
  headerTitle: { ...T.headlineSm, letterSpacing: -0.2, color: C.onSurface },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  /* hero */
  hero: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  avatarWrap: { marginBottom: 16 },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 2,
    overflow: "hidden",
    backgroundColor: C.surfaceContainerHigh,
    ...shadowSm,
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 56 },
  cameraBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  name: { ...T.bodyLg, fontWeight: "700", letterSpacing: -0.4, color: C.onSurface },
  handle: { ...T.bodySm, color: C.onSurfaceVariant, marginTop: 2 },

  quickActions: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    maxWidth: 320,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadowSm,
  },
  actionPrimary: { backgroundColor: C.primary },
  actionSecondary: { backgroundColor: C.surfaceContainer },
  actionText: { ...T.labelMd },

  /* metrics */
  metrics: { flexDirection: "row", gap: 8, marginBottom: 24 },
  metric: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 48,
    backgroundColor: C.surfaceContainerLow,
    ...shadowSm,
  },
  metricValue: { ...T.headlineMd, fontWeight: "500" },
  metricLabel: { ...T.labelSm, letterSpacing: 0.5, color: C.onSurfaceVariant, marginTop: 4 },
  metricSub: { ...T.labelSm, marginTop: 2 },

  /* cards */
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 48,
    ...shadowSm,
  },

  /* protocol */
  protocolCard: { padding: 16, gap: 8, marginBottom: 24, overflow: "hidden" },
  protocolHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  protocolTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  protocolIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  protocolEyebrow: { ...T.labelSm, letterSpacing: 0.5, color: C.secondary },
  protocolTitle: { ...T.bodyMd, fontWeight: "700", lineHeight: 19, color: C.onSurface },
  syncedPill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: C.secondary,
  },
  syncedText: { ...T.labelSm, color: C.onSecondary },
  protocolDesc: { ...T.bodySm, color: C.onSurfaceVariant },
  protocolFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 4,
    marginTop: 4,
  },
  triggerRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.secondary },
  triggerText: { ...T.bodySm, fontWeight: "500", color: C.onSurface, flexShrink: 1 },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  /* sections */
  sectionHeading: {
    ...T.labelSm,
    letterSpacing: 0.5,
    color: C.onSurfaceVariant,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  list: { overflow: "hidden" },
  row: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingRight: 8,
    minWidth: 0,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { ...T.bodyMd, fontWeight: "600", color: C.onSurface },
  rowSub: { ...T.bodySm, color: C.onSurfaceVariant },
  divider: { height: 1, backgroundColor: C.surfaceContainerHigh, marginHorizontal: 16 },
});