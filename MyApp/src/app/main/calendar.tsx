import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* --------------------------------- Types --------------------------------- */

export type OutfitPiece = {
  id: string;
  name: string;
  color?: string;
  category?: string; // e.g. Top, Bottom, Shoes
  image?: string;
};

export type OutfitEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  pieces: OutfitPiece[];
  wears?: number;
  tagLabel?: string; // legend label, e.g. "PE Attire"
  tagColor?: string; // dot color for the day + legend
  starred?: boolean;
  archived?: boolean;
  compliance?: { title: string; description?: string };
};

/* Connect your data source here (store, Supabase, API, etc.). */
function useOutfitEntries(): OutfitEntry[] {
  return [];
}

/* ----------------------------- Design tokens ----------------------------- */

const C = {
  background: "#f8f9fa",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray900: "#111827",
  blue200: "#bfdbfe",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  emerald50: "#ecfdf5",
  emerald600: "#059669",
  emerald800: "#065f46",
  emerald950: "#022c22",
  amber500: "#f59e0b",
};

const T = {
  caption: { fontSize: 10, lineHeight: 12, fontWeight: "500" as const },
  labelSm: { fontSize: 11, lineHeight: 13, fontWeight: "600" as const },
  labelMd: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  titleSm: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  bodyLg: { fontSize: 17, lineHeight: 22, fontWeight: "400" as const },
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

/* ------------------------------ Date helpers ----------------------------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const keyToDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

type CalCell = { day: number; key: string; inMonth: boolean };

function buildCells(year: number, month: number): CalCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells: CalCell[] = [];
  for (let i = 0; i < total; i++) {
    const offset = i - firstWeekday + 1;
    if (offset < 1) {
      const d = new Date(year, month - 1, prevDays + offset);
      cells.push({ day: d.getDate(), key: toKey(d.getFullYear(), d.getMonth(), d.getDate()), inMonth: false });
    } else if (offset > daysInMonth) {
      const d = new Date(year, month + 1, offset - daysInMonth);
      cells.push({ day: d.getDate(), key: toKey(d.getFullYear(), d.getMonth(), d.getDate()), inMonth: false });
    } else {
      cells.push({ day: offset, key: toKey(year, month, offset), inMonth: true });
    }
  }
  return cells;
}

/* ---------------------------------- Nav ---------------------------------- */

type ViewTab = "month" | "week" | "history";
const TABS: { key: ViewTab; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "history", label: "History Log" },
];

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];
const NAV: { label: string; icon: IconName; active?: boolean }[] = [
  { label: "Today", icon: "auto-awesome" },
  { label: "Closet", icon: "checkroom" },
  { label: "Calendar", icon: "calendar-today", active: true },
  { label: "Laundry", icon: "local-laundry-service" },
];

/* --------------------------------- Screen -------------------------------- */

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const entries = useOutfitEntries();

  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [activeTab, setActiveTab] = useState<ViewTab>("month");
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  const entryByDate = useMemo(() => {
    const map: Record<string, OutfitEntry> = {};
    entries.forEach((e) => (map[e.date] = e));
    return map;
  }, [entries]);

  const cells = useMemo(() => buildCells(view.year, view.month), [view]);

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  // legend built from entries in the visible month
  const legend = useMemo(() => {
    const prefix = `${view.year}-${pad(view.month + 1)}-`;
    const items: { label: string; color?: string; star?: boolean }[] = [];
    entries
      .filter((e) => e.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((e) => {
        const day = `${MONTHS_SHORT[view.month]} ${Number(e.date.slice(8))}`;
        if (e.tagLabel) items.push({ label: `${day}: ${e.tagLabel}`, color: e.tagColor });
        else if (e.starred) items.push({ label: `${day}: ${e.name}`, star: true });
      });
    return items;
  }, [entries, view]);

  // history: entries within the last 14 days (before today), newest first
  const history = useMemo(() => {
    const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    return entries
      .filter((e) => {
        const d = keyToDate(e.date);
        return d < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && d >= cutoff;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, todayKey]);

  const totalWears = entries.reduce((sum, e) => sum + (e.wears ?? 0), 0);

  const selectedEntry = entryByDate[selectedKey];
  const selectedDate = keyToDate(selectedKey);
  const selectedLabel = `${WEEKDAYS[selectedDate.getDay()]}, ${MONTHS_SHORT[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  // card "press" pulse when a day is tapped
  const cardScale = useRef(new Animated.Value(1)).current;
  const selectDay = (key: string): void => {
    setSelectedKey(key);
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.99, duration: 75, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 75, useNativeDriver: true }),
    ]).start();
  };

  // pulsing "Active Selection" dot
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

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Menu" style={styles.iconBtn}>
            <MaterialIcons name="menu" size={24} color={C.gray700} />
          </Pressable>

          <View style={styles.brand}>
            <Image
              source={{ uri: LOGO }}
              accessibilityLabel="Clad Logo"
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>CLAD</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable accessibilityLabel="Notifications" style={styles.iconBtn}>
              <MaterialIcons name="notifications-none" size={22} color={C.gray700} />
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
        <View style={styles.stack}>
          {/* Segmented switcher */}
          <View style={{ paddingTop: 4 }}>
            <View style={styles.segment}>
              {TABS.map((t) => {
                const active = t.key === activeTab;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setActiveTab(t.key)}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: active ? C.gray900 : C.gray600 },
                        active && { fontWeight: "600" },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Month header */}
          <View style={styles.monthRow}>
            <View style={styles.monthTitle}>
              <Text style={styles.monthName}>{MONTHS[view.month]}</Text>
              <Text style={styles.monthYear}>{view.year}</Text>
            </View>
            <View style={styles.monthNav}>
              <Pressable
                accessibilityLabel="Previous Month"
                onPress={() => shiftMonth(-1)}
                style={styles.navCircle}
              >
                <MaterialIcons name="chevron-left" size={18} color={C.gray700} />
              </Pressable>
              <Pressable
                accessibilityLabel="Next Month"
                onPress={() => shiftMonth(1)}
                style={styles.navCircle}
              >
                <MaterialIcons name="chevron-right" size={18} color={C.gray700} />
              </Pressable>
            </View>
          </View>

          {/* Calendar grid */}
          <View style={styles.card}>
            <View style={styles.dayNames}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <Text key={i} style={styles.dayName}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell) => (
                <View key={cell.key} style={styles.cellWrap}>
                  <DayCell
                    cell={cell}
                    entry={entryByDate[cell.key]}
                    selected={cell.key === selectedKey}
                    isToday={cell.key === todayKey}
                    onPress={selectDay}
                  />
                </View>
              ))}
            </View>

            {legend.length > 0 && (
              <View style={styles.legend}>
                {legend.map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    {l.star ? (
                      <MaterialIcons name="star" size={12} color={C.amber500} />
                    ) : (
                      <View style={[styles.legendDot, { backgroundColor: l.color ?? C.gray400 }]} />
                    )}
                    <Text style={styles.legendText}>{l.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Inspector card */}
          <Animated.View
            style={[styles.card, { gap: 16, transform: [{ scale: cardScale }] }]}
          >
            <View style={styles.inspectorHead}>
              <View style={{ flex: 1 }}>
                <View style={styles.eyebrowRow}>
                  <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />
                  <Text style={styles.eyebrow}>ACTIVE SELECTION</Text>
                </View>
                <Text style={styles.cardTitle}>
                  {selectedLabel}
                  {selectedEntry ? " • Scheduled Outfit" : ""}
                </Text>
              </View>
              <MaterialIcons name="more-horiz" size={20} color={C.gray400} />
            </View>

            {selectedEntry ? (
              <>
                {selectedEntry.compliance && (
                  <View style={styles.banner}>
                    <View style={styles.bannerCheck}>
                      <MaterialIcons name="check" size={16} color={C.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bannerTitle} numberOfLines={1}>
                        {selectedEntry.compliance.title}
                      </Text>
                      {selectedEntry.compliance.description ? (
                        <Text style={styles.bannerSub}>
                          {selectedEntry.compliance.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )}

                {selectedEntry.pieces.length > 0 && (
                  <View style={styles.pieces}>
                    {selectedEntry.pieces.slice(0, 3).map((p) => (
                      <View key={p.id} style={styles.piece}>
                        <View style={styles.pieceImgWrap}>
                          {p.image ? (
                            <Image source={{ uri: p.image }} style={styles.fill} resizeMode="cover" />
                          ) : (
                            <View style={[styles.fill, styles.centered]}>
                              <MaterialIcons name="checkroom" size={24} color={C.gray300} />
                            </View>
                          )}
                          {p.category ? <Text style={styles.pieceTag}>{p.category}</Text> : null}
                        </View>
                        <View style={{ paddingHorizontal: 2 }}>
                          <Text style={styles.pieceName} numberOfLines={1}>
                            {p.name}
                          </Text>
                          {p.color ? <Text style={styles.pieceColor}>{p.color}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.actions}>
                  <Pressable style={[styles.actionBtn, styles.actionLight]}>
                    <MaterialIcons name="swap-horiz" size={16} color={C.gray900} />
                    <Text style={[styles.actionText, { color: C.gray900 }]}>Change Outfit</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, styles.actionDark]}>
                    <MaterialIcons name="content-copy" size={16} color={C.white} />
                    <Text style={[styles.actionText, { color: C.white }]}>Duplicate Day</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.empty}>
                  <MaterialIcons name="checkroom" size={28} color={C.gray300} />
                  <Text style={styles.emptyText}>No outfit planned for this day.</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={[styles.actionBtn, styles.actionDark]}>
                    <MaterialIcons name="add" size={16} color={C.white} />
                    <Text style={[styles.actionText, { color: C.white }]}>Plan Outfit</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>

          {/* History */}
          <View style={[styles.card, { gap: 16 }]}>
            <View style={styles.inspectorHead}>
              <View>
                <View style={styles.eyebrowRow}>
                  <MaterialIcons name="history" size={16} color={C.blue600} />
                  <Text style={styles.eyebrow}>OUTFIT HISTORY</Text>
                </View>
                <Text style={styles.cardTitle}>Recent Rotation & Logs</Text>
              </View>
              <Text style={styles.pill}>Last 14 Days</Text>
            </View>

            {history.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="history" size={28} color={C.gray300} />
                <Text style={styles.emptyText}>No outfit history yet.</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {history.map((h) => {
                  const d = keyToDate(h.date);
                  const sub = `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}${
                    h.pieces.length ? " • " + h.pieces.map((p) => p.name).join(" + ") : ""
                  }`;
                  const thumb = h.pieces.find((p) => p.image)?.image;
                  return (
                    <View key={h.id} style={styles.historyItem}>
                      <View style={styles.historyLeft}>
                        <View style={[styles.historyThumb, styles.centered]}>
                          {thumb ? (
                            <Image source={{ uri: thumb }} style={styles.fill} resizeMode="cover" />
                          ) : (
                            <MaterialIcons name="checkroom" size={18} color={C.gray400} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.historyTitleRow}>
                            <Text style={styles.historyTitle} numberOfLines={1}>
                              {h.name}
                            </Text>
                            {h.tagColor ? (
                              <View style={[styles.historyDot, { backgroundColor: h.tagColor }]} />
                            ) : null}
                          </View>
                          <Text style={styles.historySub} numberOfLines={1}>
                            {sub}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.historyRight}>
                        {h.wears !== undefined && (
                          <Text style={styles.wears}>
                            {h.wears} {h.wears === 1 ? "Wear" : "Wears"}
                          </Text>
                        )}
                        {h.archived ? <Text style={styles.archived}>Archived</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {entries.length > 0 && (
              <Pressable style={styles.logLink}>
                <Text style={styles.logLinkText}>
                  View Complete Log History ({totalWears} {totalWears === 1 ? "Wear" : "Wears"})
                </Text>
                <MaterialIcons name="chevron-right" size={16} color={C.gray600} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

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

function DayCell({
  cell,
  entry,
  selected,
  isToday,
  onPress,
}: {
  cell: CalCell;
  entry?: OutfitEntry;
  selected: boolean;
  isToday: boolean;
  onPress: (key: string) => void;
}) {
  if (!cell.inMonth) {
    return (
      <View style={[styles.cell, { opacity: 0.3 }]}>
        <Text style={[styles.cellDay, { color: C.gray400 }]}>{cell.day}</Text>
      </View>
    );
  }

  const thumb = entry?.pieces.find((p) => p.image)?.image;

  return (
    <Pressable
      onPress={() => onPress(cell.key)}
      style={[styles.cell, selected && styles.cellSelected]}
    >
      <Text
        style={[
          styles.cellDay,
          { color: C.gray700 },
          (isToday || entry) && { color: C.gray900, fontWeight: "700" },
          selected && { color: C.blue700, fontWeight: "700" },
        ]}
      >
        {cell.day}
      </Text>

      {entry && (
        <View style={[styles.thumb, selected && styles.thumbSelected]}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={styles.fill} resizeMode="cover" />
          ) : (
            <View style={[styles.fill, styles.centered]}>
              <MaterialIcons name="checkroom" size={12} color={C.gray400} />
            </View>
          )}
        </View>
      )}

      {entry?.tagColor ? (
        <View style={[styles.cellDot, { backgroundColor: entry.tagColor }]} />
      ) : null}
      {entry?.starred ? (
        <MaterialIcons name="star" size={11} color={C.amber500} style={{ marginTop: 2 }} />
      ) : null}
      {!entry && isToday ? <View style={[styles.cellDot, { backgroundColor: C.gray900 }]} /> : null}
    </Pressable>
  );
}

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: IconName;
  active?: boolean;
}) {
  const color = active ? C.gray900 : C.gray400;
  return (
    <Pressable style={styles.navItem}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[styles.navLabel, { color }, active && { fontWeight: "600" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  fill: { width: "100%", height: "100%" },
  centered: { alignItems: "center", justifyContent: "center" },
  stack: { gap: 24 },

  /* header */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.92)",
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
    fontWeight: "700",
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
    ...shadowSm,
  },

  /* segmented */
  segment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 9999,
    backgroundColor: "rgba(229,231,235,0.7)",
    borderWidth: 1,
    borderColor: C.gray200,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    alignItems: "center",
  },
  segmentBtnActive: { backgroundColor: C.white, ...shadowSm },
  segmentText: { ...T.labelMd },

  /* month header */
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  monthTitle: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  monthName: { ...T.headlineLg, fontWeight: "700", letterSpacing: -0.7, color: C.gray900 },
  monthYear: { ...T.bodyLg, fontWeight: "500", color: C.gray500 },
  monthNav: { flexDirection: "row", alignItems: "center", gap: 4 },
  navCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    alignItems: "center",
    justifyContent: "center",
    ...shadowSm,
  },

  /* cards */
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.gray200,
    ...shadowSm,
  },

  /* calendar grid */
  dayNames: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
  },
  dayName: { flex: 1, textAlign: "center", ...T.labelSm, color: C.gray400 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: `${100 / 7}%`, paddingHorizontal: 2, marginBottom: 8 },
  cell: {
    minHeight: 58,
    padding: 4,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "transparent",
  },
  cellSelected: {
    backgroundColor: "rgba(239,246,255,0.8)",
    borderColor: C.blue200,
    ...shadowSm,
  },
  cellDay: { ...T.labelSm },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 2,
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  thumbSelected: { backgroundColor: C.white, borderWidth: 2, borderColor: C.blue500 },
  cellDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },

  /* legend */
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 16,
    marginTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: C.gray100,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...T.caption, color: C.gray700 },

  /* inspector */
  inspectorHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyebrow: { ...T.labelSm, letterSpacing: 0.55, color: C.blue600 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue600 },
  cardTitle: { ...T.titleSm, color: C.gray900, marginTop: 2 },

  empty: { alignItems: "center", gap: 8, paddingVertical: 16 },
  emptyText: { ...T.labelMd, color: C.gray500 },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: C.emerald50,
    borderWidth: 1,
    borderColor: "rgba(167,243,208,0.8)",
  },
  bannerCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.emerald600,
    alignItems: "center",
    justifyContent: "center",
    ...shadowSm,
  },
  bannerTitle: { ...T.labelMd, fontWeight: "600", color: C.emerald950 },
  bannerSub: { ...T.caption, color: C.emerald800 },

  pieces: { flexDirection: "row", gap: 12 },
  piece: {
    flex: 1,
    padding: 4,
    gap: 4,
    borderRadius: 16,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  pieceImgWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.6)",
  },
  pieceTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "500",
    color: C.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  pieceName: { ...T.labelSm, color: C.gray900 },
  pieceColor: { ...T.caption, color: C.gray500 },

  actions: { flexDirection: "row", gap: 12, paddingTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9999,
    ...shadowSm,
  },
  actionLight: { backgroundColor: C.white, borderWidth: 1, borderColor: C.gray300 },
  actionDark: { backgroundColor: C.gray900 },
  actionText: { ...T.labelMd, fontWeight: "600" },

  /* history */
  pill: {
    ...T.caption,
    color: C.gray600,
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: C.gray200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 16,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  historyLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  historyThumb: {
    width: 40,
    height: 40,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.gray200,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  historyTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  historyTitle: { ...T.labelMd, fontWeight: "600", color: C.gray900, flexShrink: 1 },
  historyDot: { width: 6, height: 6, borderRadius: 3 },
  historySub: { ...T.caption, color: C.gray500 },
  historyRight: { alignItems: "flex-end", paddingLeft: 8 },
  wears: { ...T.labelSm, color: C.gray900 },
  archived: { ...T.caption, color: C.gray400 },
  logLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  logLinkText: { ...T.labelMd, color: C.gray600 },

  /* bottom nav */
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderTopWidth: 1,
    borderTopColor: C.gray200,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.gray900,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
