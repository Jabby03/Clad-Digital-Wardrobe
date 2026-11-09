import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

/* --------------------------------- Types --------------------------------- */

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export type LaundryStatus = "needs-wash" | "in-wash" | "clean";

export type CareTag = {
  icon: IconName;
  label: string;
  accent?: boolean; // blue icon instead of gray
};

export type Garment = {
  id: string;
  brand?: string;
  name: string;
  fabric?: string;
  image?: string;
  status: LaundryStatus;
  care?: CareTag[];
};

/* Hamper size used for the gauge. Make this a user setting if you need it to vary. */
const HAMPER_CAPACITY = 10;

/* Connect your data source here (store, Supabase, API, etc.). */
function useLaundry() {
  const [garments, setGarments] = useState<Garment[]>([]);

  const setStatus = (id: string, status: LaundryStatus) =>
    setGarments((list) => list.map((g) => (g.id === id ? { ...g, status } : g)));

  const markAllClean = () =>
    setGarments((list) => list.map((g) => ({ ...g, status: "clean" as const })));

  const addDirty = () => {};

  return { garments, setStatus, markAllClean, addDirty };
}

/* ----------------------------- Design tokens ----------------------------- */

const C = {
  background: "#f9fafb",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  amber50: "#fffbeb",
  amber200: "#fde68a",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  amber700: "#b45309",
  emerald50: "#ecfdf5",
  emerald200: "#a7f3d0",
  emerald400: "#34d399",
  emerald500: "#10b981",
  emerald700: "#047857",
};

const T = {
  caption: { fontSize: 10, lineHeight: 12, fontWeight: "500" as const },
  labelSm: { fontSize: 11, lineHeight: 13, fontWeight: "600" as const },
  labelMd: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  titleSm: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  bodyMd: { fontSize: 15, lineHeight: 20, fontWeight: "400" as const },
  displayLg: { fontSize: 34, lineHeight: 41, fontWeight: "700" as const },
  headlineMd: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
  headlineLg: { fontSize: 28, lineHeight: 34, fontWeight: "600" as const },
};

const shadowSm = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEP4Dpw-Ne61YxnQHFydizicQK93KFnUWpoSt-apC_0Dq-97V23fSPCXL2sHRdYf-jvD8DOtOvjgdbyBg8DbHOK-d6Hln9-3KwMLI4ox_7uMpu6oY3JrbyKoQrCxUviKCdeaPUqhDa1LiRAclecKJI9QOIMDOx_gXDobobkXTJ2My-pitMR8Bhuk1KUJfR8Q9Z_MehQZS85qluxZ3XtSa-82rX18sb3gMfqqRPEuPrax8UT2l-sWz-9g";

/* ------------------------------ Status config ---------------------------- */

const STATUS: Record<
  LaundryStatus,
  { label: string; bg: string; fg: string; border: string; dot: string; pulse?: boolean }
> = {
  "needs-wash": {
    label: "Needs Wash",
    bg: C.amber50,
    fg: C.amber700,
    border: "rgba(253,230,138,0.6)",
    dot: C.amber500,
  },
  "in-wash": {
    label: "In Wash",
    bg: C.blue50,
    fg: C.blue700,
    border: "rgba(191,219,254,0.6)",
    dot: C.blue600,
    pulse: true,
  },
  clean: {
    label: "Clean",
    bg: C.emerald50,
    fg: C.emerald700,
    border: "rgba(167,243,208,0.6)",
    dot: C.emerald500,
  },
};

type Filter = "all" | LaundryStatus;

const NAV: { label: string; icon: IconName; active?: boolean }[] = [
  { label: "Today", icon: "auto-awesome" },
  { label: "Closet", icon: "checkroom" },
  { label: "Calendar", icon: "calendar-today" },
  { label: "Laundry", icon: "local-laundry-service", active: true },
];

/* --------------------------------- Screen -------------------------------- */

export default function LaundryScreen() {
  const insets = useSafeAreaInsets();
  const { garments, setStatus, markAllClean, addDirty } = useLaundry();

  const [filter, setFilter] = useState<Filter>("all");
  const [settings, setSettings] = useState({ weekly: false, capsule: false });

  /* counts */
  const needs = garments.filter((g) => g.status === "needs-wash").length;
  const inWash = garments.filter((g) => g.status === "in-wash").length;
  const clean = garments.filter((g) => g.status === "clean").length;
  const inCycle = needs + inWash;

  const pct = Math.min(100, Math.round((inCycle / HAMPER_CAPACITY) * 100));
  const needsWidth = Math.min(100, (needs / HAMPER_CAPACITY) * 100);
  const washWidth = Math.min(100 - needsWidth, (inWash / HAMPER_CAPACITY) * 100);

  const visible = useMemo(
    () => garments.filter((g) => filter === "all" || g.status === filter),
    [garments, filter]
  );

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: garments.length },
    { key: "needs-wash", label: "Needs Wash", count: needs },
    { key: "in-wash", label: "In Wash", count: inWash },
    { key: "clean", label: "Clean", count: clean },
  ];

  /* toast */
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const hideToast = () => {
    Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };
  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(hideToast, 3500);
  };
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleStatus = (id: string, status: LaundryStatus) => {
    setStatus(id, status);
    if (status === "clean") showToast("Garment moved to Clean closet");
  };

  const handleMarkAllClean = () => {
    if (inCycle === 0) return;
    markAllClean();
    showToast(
      `All ${inCycle} ${inCycle === 1 ? "item" : "items"} marked as clean and ready to wear.`
    );
  };

  /* pulsing dots */
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

  /* gauge math */
  const R = 32;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - pct / 100);

  const hint =
    garments.length === 0
      ? "Nothing in your hamper"
      : pct >= 70
      ? "Time to run a load"
      : inCycle === 0
      ? "All garments are clean"
      : "Hamper is filling up";

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Menu" style={styles.iconBtn}>
            <MaterialIcons name="menu" size={24} color={C.gray600} />
          </Pressable>

          <View style={styles.brand}>
            <Image source={{ uri: LOGO }} accessibilityLabel="Clad Logo" style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>CLAD</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable accessibilityLabel="Notifications" style={styles.iconBtn}>
              <MaterialIcons name="notifications-none" size={22} color={C.gray600} />
            </Pressable>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={18} color={C.white} />
            </View>
          </View>
        </View>
      </View>

      {/* Main */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 64 + insets.top,
          paddingBottom: 96 + insets.bottom,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 24 }}>
          {/* Title + Add Dirty */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.eyebrow}>CARE & MAINTENANCE</Text>
              <Text style={styles.title}>Laundry Cycle</Text>
            </View>
            <Pressable
              onPress={addDirty}
              style={({ pressed }) => [styles.addDirty, pressed && styles.pressed]}
            >
              <MaterialIcons name="add" size={18} color={C.blue600} />
              <Text style={styles.addDirtyText}>Add Dirty</Text>
            </Pressable>
          </View>

          {/* Status hub */}
          <View style={styles.hub}>
            <View style={styles.glow} pointerEvents="none" />

            <View style={styles.hubTop}>
              <View style={{ gap: 4 }}>
                <View style={styles.hamperPill}>
                  <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />
                  <Text style={styles.hamperPillText}>Hamper {pct}% Full</Text>
                </View>
                <View style={{ paddingTop: 4 }}>
                  <Text style={styles.count}>{inCycle}</Text>
                  <Text style={styles.countLabel}>Garments in cycle</Text>
                </View>
              </View>

              <View style={styles.gauge}>
                <Svg width={80} height={80} viewBox="0 0 80 80">
                  <G rotation="-90" origin="40, 40">
                    <Circle cx={40} cy={40} r={R} stroke={C.gray100} strokeWidth={7} fill="transparent" />
                    <Circle
                      cx={40}
                      cy={40}
                      r={R}
                      stroke={C.blue600}
                      strokeWidth={7}
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${CIRC} ${CIRC}`}
                      strokeDashoffset={dashOffset}
                    />
                  </G>
                </Svg>
                <View style={styles.gaugeCenter}>
                  <MaterialIcons name="local-laundry-service" size={20} color={C.gray900} />
                  <Text style={styles.gaugeText}>
                    {inCycle}/{HAMPER_CAPACITY}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.meter}>
              <View style={styles.meterRow}>
                <View style={styles.hintWrap}>
                  <MaterialIcons name="info-outline" size={15} color={C.amber500} />
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
                <Text style={styles.splitText}>
                  {inWash} Wash • {needs} Dirty
                </Text>
              </View>
              <View style={styles.track}>
                <View style={{ width: `${needsWidth}%`, height: "100%", backgroundColor: C.blue600 }} />
                <View style={{ width: `${washWidth}%`, height: "100%", backgroundColor: C.amber400 }} />
              </View>
            </View>

            <Pressable
              onPress={handleMarkAllClean}
              disabled={inCycle === 0}
              style={({ pressed }) => [
                styles.markAll,
                inCycle === 0 && { opacity: 0.5 },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <MaterialIcons name="check-circle" size={20} color={C.white} />
              <Text style={styles.markAllText}>Mark All as Clean</Text>
            </Pressable>
          </View>

          {/* Status tabs */}
          <View style={styles.segment}>
            {tabs.map((t) => {
              const active = t.key === filter;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setFilter(t.key)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.segmentText,
                      { color: active ? C.gray900 : C.gray500, fontWeight: active ? "600" : "500" },
                    ]}
                  >
                    {t.label} ({t.count})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Garment list */}
          {garments.length === 0 ? (
            <EmptyState
              title="No laundry yet"
              subtitle="Add dirty garments to start tracking your hamper."
            />
          ) : visible.length === 0 ? (
            <EmptyState title="Nothing here" subtitle="No garments in this category." />
          ) : (
            <View style={{ gap: 12 }}>
              {visible.map((g) => (
                <GarmentCard key={g.id} garment={g} onStatus={handleStatus} pulse={pulse} />
              ))}
            </View>
          )}

          {/* Automation card */}
          <View style={styles.autoCard}>
            <View style={styles.autoHead}>
              <View style={styles.autoTitleWrap}>
                <MaterialIcons name="tune" size={22} color={C.blue600} />
                <Text style={styles.autoTitle}>Cycle Automation & Alerts</Text>
              </View>
              <Text style={styles.autoTag}>SMART ENGINE</Text>
            </View>

            <View style={{ gap: 12 }}>
              <SettingRow
                title="Weekly Laundry Routine"
                titleIcon={<MaterialIcons name="event-repeat" size={14} color={C.blue600} />}
                description="Get a recurring reminder when your hamper is ready for a wash cycle."
                value={settings.weekly}
                onChange={(v) => setSettings((s) => ({ ...s, weekly: v }))}
              />
              <SettingRow
                title="Capsule Depletion Alert"
                titleIcon={<View style={styles.amberDot} />}
                description="Get notified when your clean base pieces are running low."
                value={settings.capsule}
                onChange={(v) => setSettings((s) => ({ ...s, capsule: v }))}
              />
            </View>

            <Pressable style={styles.disclosure}>
              <View style={styles.disclosureLeft}>
                <MaterialIcons name="verified" size={18} color={C.gray400} />
                <Text style={styles.disclosureText}>Garment care rules</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={C.gray400} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Toast */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            bottom: 80 + insets.bottom,
            opacity: toastAnim,
            transform: [
              { translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
            ],
          },
        ]}
      >
        <View style={styles.toastLeft}>
          <MaterialIcons name="check" size={20} color={C.emerald400} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMsg}
          </Text>
        </View>
        <Pressable onPress={hideToast} style={styles.toastClose}>
          <MaterialIcons name="close" size={16} color={C.white} />
        </Pressable>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.nav, { paddingBottom: insets.bottom }]}>
        <View style={styles.navRow}>
          {NAV.slice(0, 2).map((n) => (
            <NavItem key={n.label} {...n} />
          ))}
          <Pressable accessibilityLabel="Add item" style={styles.addWrap}>
            <View style={styles.addBtn}>
              <MaterialIcons name="add" size={24} color={C.white} />
            </View>
          </Pressable>
          {NAV.slice(2).map((n) => (
            <NavItem key={n.label} {...n} />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------- Sub-components -------------------------- */

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="local-laundry-service" size={24} color={C.gray400} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

function GarmentCard({
  garment,
  onStatus,
  pulse,
}: {
  garment: Garment;
  onStatus: (id: string, status: LaundryStatus) => void;
  pulse: Animated.Value;
}) {
  const s = STATUS[garment.status];
  const options: LaundryStatus[] = ["needs-wash", "in-wash", "clean"];

  return (
    <View style={styles.garmentCard}>
      <View style={styles.garmentTop}>
        <View style={styles.garmentImg}>
          {garment.image ? (
            <Image source={{ uri: garment.image }} style={styles.fill} resizeMode="cover" />
          ) : (
            <View style={[styles.fill, styles.centered]}>
              <MaterialIcons name="checkroom" size={24} color={C.gray300} />
            </View>
          )}
          <View style={[styles.imgDot, { backgroundColor: s.dot }]} />
        </View>

        <View style={styles.garmentInfo}>
          <View>
            <View style={styles.garmentHead}>
              <Text style={styles.brandLabel} numberOfLines={1}>
                {(garment.brand ?? "").toUpperCase()}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: s.bg, borderColor: s.border }]}>
                <Animated.View
                  style={[styles.statusDot, { backgroundColor: s.dot }, s.pulse && { opacity: pulse }]}
                />
                <Text style={[styles.statusText, { color: s.fg }]}>{s.label}</Text>
              </View>
            </View>
            <Text style={styles.garmentName} numberOfLines={1}>
              {garment.name}
            </Text>
            {garment.fabric ? (
              <Text style={styles.garmentFabric} numberOfLines={1}>
                {garment.fabric}
              </Text>
            ) : null}
          </View>

          {garment.care && garment.care.length > 0 && (
            <View style={styles.careRow}>
              {garment.care.map((c) => (
                <View key={c.label} style={styles.careChip}>
                  <MaterialIcons name={c.icon} size={13} color={c.accent ? C.blue600 : C.gray500} />
                  <Text style={styles.careText} numberOfLines={1}>
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.toggle}>
        {options.map((opt) => {
          const active = garment.status === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onStatus(garment.id, opt)}
              style={[styles.toggleBtn, active && styles.toggleBtnActive]}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: active ? C.gray900 : C.gray500, fontWeight: active ? "600" : "500" },
                ]}
              >
                {STATUS[opt].label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SettingRow({
  title,
  titleIcon,
  description,
  value,
  onChange,
}: {
  title: string;
  titleIcon: React.ReactNode;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, gap: 2, paddingRight: 12 }}>
        <View style={styles.settingTitleRow}>
          <Text style={styles.settingTitle}>{title}</Text>
          {titleIcon}
        </View>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.gray200, true: C.blue600 }}
        thumbColor={C.white}
        ios_backgroundColor={C.gray200}
      />
    </View>
  );
}

function NavItem({ label, icon, active }: { label: string; icon: IconName; active?: boolean }) {
  const color = active ? C.gray900 : C.gray500;
  return (
    <Pressable style={styles.navItem}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[styles.navLabel, { color }, active && { fontWeight: "600" }]}>{label}</Text>
    </Pressable>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
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
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
  },
  headerRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 32, height: 32 },
  brandText: {
    ...T.headlineMd,
    letterSpacing: -0.5,
    color: C.gray900,
    textTransform: "uppercase",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.gray900,
    alignItems: "center",
    justifyContent: "center",
  },

  /* title */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  eyebrow: { ...T.caption, fontWeight: "600", letterSpacing: 1, color: C.blue600, marginBottom: 2 },
  title: { ...T.headlineLg, fontWeight: "700", letterSpacing: -0.7, color: C.gray900 },
  addDirty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    ...shadowSm,
  },
  addDirtyText: { ...T.labelMd, fontWeight: "600", color: C.gray900 },

  /* hub */
  hub: {
    padding: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.8)",
    ...shadowSm,
  },
  glow: {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "rgba(59,130,246,0.05)",
  },
  hubTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  hamperPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: C.blue50,
    borderWidth: 1,
    borderColor: C.blue100,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue600 },
  hamperPillText: { ...T.labelSm, color: C.blue800 },
  count: { ...T.displayLg, letterSpacing: -0.7, color: C.gray900 },
  countLabel: { ...T.bodyMd, color: C.gray500 },
  gauge: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  gaugeCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeText: { ...T.caption, fontWeight: "600", color: C.gray500 },

  meter: { marginTop: 16, paddingTop: 12, gap: 10 },
  meterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  hintWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  hintText: { ...T.labelSm, fontWeight: "500", color: C.gray600, flexShrink: 1 },
  splitText: { ...T.labelSm, color: C.blue600 },
  track: {
    width: "100%",
    height: 6,
    borderRadius: 9999,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: C.gray100,
  },
  markAll: {
    marginTop: 20,
    height: 48,
    borderRadius: 9999,
    backgroundColor: C.gray900,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  markAllText: { ...T.titleSm, letterSpacing: -0.2, color: C.white },

  /* tabs */
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 9999,
    backgroundColor: "rgba(243,244,246,0.9)",
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.6)",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9999,
    alignItems: "center",
  },
  segmentBtnActive: { backgroundColor: C.white, ...shadowSm },
  segmentText: { ...T.labelMd, textAlign: "center" },

  /* garment card */
  garmentCard: {
    padding: 14,
    gap: 12,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    ...shadowSm,
  },
  garmentTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  garmentImg: {
    width: 64,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: C.gray100,
  },
  imgDot: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.white,
  },
  garmentInfo: {
    flex: 1,
    minWidth: 0,
    minHeight: 80,
    justifyContent: "space-between",
    gap: 6,
    paddingVertical: 2,
  },
  garmentHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  brandLabel: {
    ...T.caption,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: C.blue600,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...T.labelSm },
  garmentName: { ...T.titleSm, color: C.gray900, marginTop: 2 },
  garmentFabric: { ...T.caption, color: C.gray500 },
  careRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  careChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.6)",
  },
  careText: { ...T.caption, color: C.gray700 },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    borderRadius: 9999,
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.5)",
  },
  toggleBtn: { flex: 1, paddingVertical: 6, borderRadius: 9999, alignItems: "center" },
  toggleBtnActive: { backgroundColor: C.white, ...shadowSm },
  toggleText: { ...T.labelSm },

  /* empty */
  empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { ...T.titleSm, color: C.gray900 },
  emptySub: { ...T.bodyMd, color: C.gray500, textAlign: "center" },

  /* automation */
  autoCard: {
    padding: 20,
    gap: 16,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    ...shadowSm,
  },
  autoHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  autoTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  autoTitle: { ...T.titleSm, fontWeight: "700", color: C.gray900, flexShrink: 1 },
  autoTag: { ...T.caption, fontWeight: "600", letterSpacing: 0.5, color: C.gray500 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray100,
  },
  settingTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingTitle: { ...T.labelMd, fontWeight: "600", color: C.gray900 },
  settingDesc: { ...T.caption, fontWeight: "400", color: C.gray500 },
  amberDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber500 },
  disclosure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  disclosureLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  disclosureText: { ...T.caption, color: C.gray500 },

  /* toast */
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 60,
    padding: 12,
    borderRadius: 9999,
    backgroundColor: C.gray900,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  toastLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 },
  toastText: { ...T.labelMd, color: C.white, flexShrink: 1 },
  toastClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* bottom nav */
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderTopWidth: 1,
    borderTopColor: C.gray100,
  },
  navRow: {
    height: 64,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: { minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center", gap: 4 },
  navLabel: { ...T.caption, letterSpacing: -0.25 },
  addWrap: { minWidth: 56, marginTop: -20, alignItems: "center", justifyContent: "center" },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.gray900,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});