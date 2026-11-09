import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';
import { useHydrated } from '@/hooks/use-hydrated';
import {
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* --------------------------------- Types --------------------------------- */

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export type NotificationCategory = "reminders" | "wardrobe" | "care";

export type NotificationAction = {
  label: string;
  icon?: IconName;
  iconPosition?: "leading" | "trailing";
  variant?: "neutral" | "primary";
  onPress?: () => void;
};

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string; // ISO date string
  read: boolean;
  priority?: "high";
  icon?: IconName;
  iconTone?: "neutral" | "accent";
  /** small row of garment thumbnails with a caption */
  preview?: { title: string; subtitle?: string; images?: string[] };
  /** single garment highlight card */
  highlight?: { eyebrow?: string; title: string; subtitle?: string; image?: string };
  /** small pill under the body, e.g. progress info */
  badge?: { icon?: IconName; label: string };
  action?: NotificationAction;
};

/* Connect your data source here (store, Supabase, push backend, etc.). */
function useNotifications(): {
  items: AppNotification[];
  markAllRead: () => void;
} {
  return { items: [], markAllRead: () => {} };
}

/* ----------------------------- Design tokens ----------------------------- */

const C = {
  surface: "#fbf9f8",
  white: "#ffffff",
  primary: "#000000",
  onPrimary: "#ffffff",
  onSurface: "#1b1c1c",
  onSurfaceVariant: "#444748",
  secondary: "#4059aa",
  onSecondary: "#ffffff",
  secondaryFixed: "#dce1ff",
  onSecondaryFixed: "#00164e",
  surfaceContainer: "#efeded",
  surfaceContainerHigh: "#e9e8e7",
  surfaceContainerHighest: "#e4e2e2",
  surfaceContainerLow: "#f5f3f3",
};

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
} as const;

const T = {
  bodySm: { fontSize: 12, lineHeight: 16, fontFamily: font.regular },
  bodyMd: { fontSize: 14, lineHeight: 20, fontFamily: font.regular },
  bodyLg: { fontSize: 16, lineHeight: 24, fontFamily: font.regular, letterSpacing: -0.08 },
  labelMd: { fontSize: 12, lineHeight: 16, fontFamily: font.semibold, letterSpacing: 0.72 },
  labelSm: { fontSize: 10, lineHeight: 14, fontFamily: font.semibold, letterSpacing: 0.8 },
  headlineSm: { fontSize: 20, lineHeight: 28, fontFamily: font.semibold },
};

const shadowSm = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

/* --------------------------- Filters & grouping -------------------------- */

type Filter = "all" | NotificationCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reminders", label: "Reminders" },
  { key: "wardrobe", label: "Wardrobe" },
  { key: "care", label: "Care & Wash" },
];

const DEFAULT_ICON: Record<NotificationCategory, IconName> = {
  reminders: "event",
  wardrobe: "checkroom",
  care: "local-laundry-service",
};

const GROUP_ORDER = ["Today", "Yesterday", "Earlier this week", "Earlier"] as const;
type GroupName = (typeof GROUP_ORDER)[number];

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function daysAgo(createdAt: string, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(createdAt))) / DAY_MS);
}

function groupOf(diff: number): GroupName {
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff <= 6) return "Earlier this week";
  return "Earlier";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatTime(createdAt: string, now: Date): string {
  const d = new Date(createdAt);
  const diff = daysAgo(createdAt, now);

  if (diff <= 0) {
    const mins = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60000));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  if (diff === 1) {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
  }
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/* --------------------------------- Screen -------------------------------- */

export default function NotificationsScreen() {
  const [fontsLoaded] = useFonts({ HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold });
  const hasHydrated = useHydrated();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const now = new Date();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, reminders: 0, wardrobe: 0, care: 0 };
    items.forEach((n) => (c[n.category] += 1));
    return c;
  }, [items]);

  const unreadCount = items.filter((n) => !n.read).length;
  const highPriority = items.filter((n) => n.priority === "high" && !n.read).length;

  const groups = useMemo(() => {
    const visible = items
      .filter((n) => filter === "all" || n.category === filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const map = new Map<GroupName, AppNotification[]>();
    visible.forEach((n) => {
      const g = groupOf(daysAgo(n.createdAt, new Date()));
      map.set(g, [...(map.get(g) ?? []), n]);
    });
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      name: g,
      items: map.get(g)!,
    }));
  }, [items, filter]);

  const allRead = items.length > 0 && unreadCount === 0;

  if (!hasHydrated || !fontsLoaded) {
    return <View style={[styles.screen, styles.centered]}><ActivityIndicator color={C.onSurface} /></View>;
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/main/today'))}
              style={({ pressed }) => [styles.iconBtn, { marginLeft: -4 }, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back-ios-new" size={20} color={C.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              accessibilityLabel="Mark all as read"
              disabled={unreadCount === 0}
              onPress={markAllRead}
              style={[styles.markBtn, unreadCount === 0 && { opacity: 0.4 }]}
            >
              <Text style={styles.markText}>{allRead ? "ALL READ" : "MARK READ"}</Text>
            </Pressable>
            <Pressable accessibilityLabel="Settings" style={styles.iconBtn}>
              <MaterialIcons name="tune" size={20} color={C.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 56 + insets.top,
          paddingBottom: 40 + insets.bottom,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [
                  styles.pill,
                  active ? styles.pillActive : styles.pillIdle,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pillText, { color: active ? C.onPrimary : C.onSurfaceVariant }]}>
                  {f.label} ({counts[f.key]})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Priority banner (only when there is something pending) */}
        {highPriority > 0 && (
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <MaterialIcons name="verified" size={18} color={C.onSecondaryFixed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                ATELIER CARE INTELLIGENCE
              </Text>
              <Text style={styles.bannerSub} numberOfLines={1}>
                {highPriority} high-priority {highPriority === 1 ? "action" : "actions"} awaiting
                confirmation
              </Text>
            </View>
          </View>
        )}

        {/* Stream */}
        {items.length === 0 ? (
          <EmptyState
            title="You're all caught up"
            subtitle="New alerts will appear here."
          />
        ) : groups.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            subtitle="No notifications in this category."
          />
        ) : (
          <View style={{ gap: 24 }}>
            {groups.map((g) => (
              <View key={g.name} style={{ gap: 8 }}>
                <View style={styles.groupHead}>
                  <View style={styles.groupTitleWrap}>
                    {g.name === "Today" && <View style={styles.groupDot} />}
                    <Text style={styles.groupTitle}>{g.name}</Text>
                  </View>
                  <Text style={styles.groupCount}>
                    {g.items.length} {g.items.length === 1 ? "ALERT" : "ALERTS"}
                  </Text>
                </View>

                {g.items.map((n) => (
                  <NotificationCard key={n.id} n={n} timeLabel={formatTime(n.createdAt, now)} />
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Preferences link */}
        <View style={{ marginTop: 40, paddingTop: 4 }}>
          <Pressable style={({ pressed }) => [styles.prefsLink, pressed && { backgroundColor: C.surfaceContainerLow }]}>
            <View style={styles.prefsLeft}>
              <View style={styles.prefsIcon}>
                <MaterialIcons name="notifications-active" size={20} color={C.onSurfaceVariant} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefsTitle} numberOfLines={1}>
                  Notification Preferences
                </Text>
                <Text style={styles.prefsSub} numberOfLines={1}>
                  Manage push frequency and schedule alerts
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={C.onSurfaceVariant} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------- Sub-components -------------------------- */

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="notifications-none" size={24} color={C.onSurfaceVariant} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

function NotificationCard({ n, timeLabel }: { n: AppNotification; timeLabel: string }) {
  const accent = n.iconTone === "accent";
  const unread = !n.read;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { backgroundColor: C.surfaceContainerLow }]}>
      <View style={styles.cardRow}>
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: accent ? C.secondaryFixed : C.surfaceContainerHigh },
          ]}
        >
          <MaterialIcons
            name={n.icon ?? DEFAULT_ICON[n.category]}
            size={20}
            color={accent ? C.onSecondaryFixed : C.onSurface}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.cardHead}>
            <View style={styles.cardTitleWrap}>
              {unread && <View style={styles.unreadDot} />}
              <Text
                style={[styles.cardTitle, { fontFamily: unread ? font.semibold : font.medium }]}
                numberOfLines={1}
              >
                {n.title}
              </Text>
            </View>
            <Text style={styles.cardTime}>{timeLabel}</Text>
          </View>

          <Text style={[styles.cardBody, (n.preview || n.highlight || n.badge || n.action) && { marginBottom: 8 }]}>
            {n.body}
          </Text>

          {n.preview && (
            <View style={styles.preview}>
              {n.preview.images?.map((uri) => (
                <View key={uri} style={styles.previewThumb}>
                  <Image source={{ uri }} style={styles.fill} resizeMode="cover" />
                </View>
              ))}
              <View style={{ flex: 1, paddingLeft: 4 }}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {n.preview.title.toUpperCase()}
                </Text>
                {n.preview.subtitle ? (
                  <Text style={styles.previewSub} numberOfLines={1}>
                    {n.preview.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {n.highlight && (
            <View style={styles.highlight}>
              <View style={styles.highlightImg}>
                {n.highlight.image ? (
                  <Image source={{ uri: n.highlight.image }} style={styles.fill} resizeMode="cover" />
                ) : (
                  <View style={[styles.fill, styles.centered]}>
                    <MaterialIcons name="checkroom" size={20} color={C.onSurfaceVariant} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                {n.highlight.eyebrow ? (
                  <Text style={styles.highlightEyebrow}>{n.highlight.eyebrow.toUpperCase()}</Text>
                ) : null}
                <Text style={styles.highlightTitle} numberOfLines={1}>
                  {n.highlight.title}
                </Text>
                {n.highlight.subtitle ? (
                  <Text style={styles.highlightSub}>{n.highlight.subtitle}</Text>
                ) : null}
              </View>
            </View>
          )}

          {n.badge && (
            <View style={styles.badge}>
              {n.badge.icon ? (
                <MaterialIcons name={n.badge.icon} size={14} color={C.onSurfaceVariant} />
              ) : null}
              <Text style={styles.badgeText}>{n.badge.label}</Text>
            </View>
          )}

          {n.action && <ActionButton action={n.action} />}
        </View>
      </View>
    </Pressable>
  );
}

function ActionButton({ action }: { action: NotificationAction }) {
  const primary = action.variant === "primary";
  const fg = primary ? C.onSecondary : C.onSurface;
  const icon = action.icon ? (
    <MaterialIcons name={action.icon} size={14} color={fg} />
  ) : null;

  return (
    <View style={{ paddingTop: 4, alignItems: "flex-start" }}>
      <Pressable
        onPress={action.onPress}
        style={({ pressed }) => [
          styles.action,
          primary ? styles.actionPrimary : styles.actionNeutral,
          pressed && styles.pressed,
        ]}
      >
        {action.iconPosition !== "trailing" && icon}
        <Text style={[styles.actionText, { color: fg }]}>{action.label}</Text>
        {action.iconPosition === "trailing" && icon}
      </Pressable>
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
    backgroundColor: "rgba(255,255,255,0.92)",
    ...shadowSm,
  },
  headerRow: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...T.headlineSm, letterSpacing: -0.2, color: C.onSurface },
  markBtn: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { ...T.labelMd, letterSpacing: 1, color: C.onSurfaceVariant },

  /* filters */
  filterScroll: { marginHorizontal: -16, marginBottom: 16, flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 4, gap: 8, alignItems: "center" },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  pillActive: { backgroundColor: C.primary, ...shadowSm },
  pillIdle: { backgroundColor: C.surfaceContainerHigh },
  pillText: { ...T.labelMd, letterSpacing: 0.6 },

  /* banner */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: C.white,
    ...shadowSm,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: { ...T.labelMd, letterSpacing: 0.6, color: C.onSurface },
  bannerSub: { ...T.bodySm, color: C.onSurfaceVariant },

  /* groups */
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  groupTitleWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.secondary },
  groupTitle: { ...T.headlineSm, letterSpacing: -0.2, color: C.onSurface },
  groupCount: { ...T.labelSm, letterSpacing: 1.5, color: C.onSurfaceVariant },

  /* card */
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: C.white,
    ...shadowSm,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 4,
  },
  cardTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.secondary },
  cardTitle: { ...T.bodyLg, color: C.onSurface, flexShrink: 1 },
  cardTime: { ...T.labelSm, color: C.onSurfaceVariant },
  cardBody: { ...T.bodyMd, lineHeight: 23, color: C.onSurfaceVariant },

  /* preview */
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    marginBottom: 8,
    borderRadius: 28,
    backgroundColor: C.surfaceContainerLow,
  },
  previewThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: C.surfaceContainer,
  },
  previewTitle: { ...T.labelSm, letterSpacing: 0.5, color: C.onSurface },
  previewSub: { ...T.bodySm, color: C.onSurfaceVariant },

  /* highlight */
  highlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    marginBottom: 8,
    borderRadius: 28,
    backgroundColor: C.surfaceContainerLow,
  },
  highlightImg: {
    width: 48,
    height: 56,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: C.surfaceContainer,
  },
  highlightEyebrow: { ...T.labelSm, letterSpacing: 0.5, color: C.onSurfaceVariant },
  highlightTitle: { ...T.bodyMd, fontFamily: font.medium, color: C.onSurface },
  highlightSub: { ...T.labelSm, color: C.onSurfaceVariant },

  /* badge */
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: C.surfaceContainer,
  },
  badgeText: { ...T.labelSm, color: C.onSurfaceVariant },

  /* actions */
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  actionNeutral: { backgroundColor: C.surfaceContainerHigh },
  actionPrimary: { backgroundColor: C.secondary, ...shadowSm },
  actionText: { ...T.labelMd },

  /* empty */
  empty: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { ...T.headlineSm, color: C.onSurface },
  emptySub: { ...T.bodyMd, color: C.onSurfaceVariant },

  /* preferences link */
  prefsLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: C.white,
    ...shadowSm,
  },
  prefsLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  prefsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  prefsTitle: { ...T.bodyMd, fontFamily: font.medium, color: C.onSurface },
  prefsSub: { ...T.bodySm, color: C.onSurfaceVariant },
});
