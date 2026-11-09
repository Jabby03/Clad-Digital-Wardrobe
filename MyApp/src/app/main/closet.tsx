import LoadingScreen from '@/components/loading-screen';
import HeaderMenu from '@/components/navigation/header-menu';
import CladLogo from '@/components/clad-logo';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useHydrated } from '@/hooks/use-hydrated';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';

// Design tokens (light theme, from code.html)
const colors = {
  background: '#fbfbfb',
  card: '#ffffff',
  primary: '#111827',
  white: '#ffffff',
  border: '#e5e7eb',
  borderCard: 'rgba(229,231,235,0.9)',
  gray100: '#f3f4f6',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray800: '#1f2937',
  emerald: '#059669',
  emerald400: '#34d399',
  emeraldSoft: '#ecfdf5',
  emeraldSoftBorder: '#a7f3d0',
  emeraldText: '#047857',
  amber: '#f59e0b',
  amber600: '#d97706',
  amber700: '#b45309',
  rose: '#f43f5e',
  rose600: '#e11d48',
  blue: '#2563eb',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

const monoFont = Platform.select({ ios: 'Menlo', default: 'monospace' });


// ---------------------------------------------------------------------------
// Closet data
// ---------------------------------------------------------------------------
type GarmentCategory = 'tops' | 'bottoms' | 'footwear' | 'outerwear' | 'accessories';
type GarmentStatus = 'available' | 'laundry' | 'dirty';

type Garment = {
  id: string;
  brand: string;
  name: string;
  category: GarmentCategory;
  status: GarmentStatus;
  wears: number;
  meta: string; // e.g. "Top • S"
  note?: string; // e.g. "Dry Clean"
  noteTone?: 'neutral' | 'positive';
  imageUri: string;
};

// Closet data isn't connected yet, so the screen renders its empty state.
const garments: Garment[] = [];

const categories: { key: 'all' | GarmentCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'footwear', label: 'Footwear' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'accessories', label: 'Accessories' },
];

const statusFilters: { key: 'all' | GarmentStatus; label: string; dot?: string }[] = [
  { key: 'all', label: 'All Status' },
  { key: 'available', label: 'Available', dot: colors.emerald },
  { key: 'laundry', label: 'In Laundry', dot: colors.amber },
  { key: 'dirty', label: 'Needs Wash', dot: colors.rose },
];

const statusLabels: Record<GarmentStatus, string> = {
  available: 'Ready',
  laundry: 'Laundry',
  dirty: 'Hamper',
};

const statusColors: Record<GarmentStatus, { dot: string; text: string }> = {
  available: { dot: colors.emerald, text: colors.gray800 },
  laundry: { dot: colors.amber, text: colors.amber700 },
  dirty: { dot: colors.rose, text: colors.rose600 },
};

const slotCategories = [
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'footwear', label: 'Footwear' },
] as const;

type SlotKey = (typeof slotCategories)[number]['key'];


// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------
function GarmentCard({ item }: { item: Garment }) {
  const status = statusColors[item.status];
  const inLaundry = item.status === 'laundry';
  const noteColor =
    item.status === 'laundry'
      ? colors.amber600
      : item.status === 'dirty'
        ? colors.rose600
        : item.noteTone === 'positive'
          ? colors.emerald
          : colors.gray500;

  return (
    <View style={styles.garmentCard}>
      <View style={styles.garmentImageWrap}>
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.garmentImage, inLaundry && styles.garmentImageMuted]}
          resizeMode="cover"
          accessibilityLabel={item.name}
        />
        {inLaundry && (
          <View style={styles.laundryOverlay}>
            <MaterialIcons name="local-laundry-service" size={26} color={colors.amber600} />
            <Text style={styles.laundryOverlayText}>IN LAUNDRY</Text>
          </View>
        )}
        {!inLaundry && (
          <View style={styles.wearsPill}>
            <MaterialIcons name="repeat" size={12} color={colors.emerald400} />
            <Text style={styles.wearsText}>{`${item.wears}x`}</Text>
          </View>
        )}
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          <Text style={[styles.statusText, { color: status.text }]}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      <View style={styles.garmentText}>
        <Text style={styles.garmentBrand} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.garmentName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.garmentMetaRow}>
          <Text style={styles.garmentMeta} numberOfLines={1}>
            {item.meta}
          </Text>
          {item.note ? (
            <Text style={[styles.garmentNote, { color: noteColor }]} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

type BuilderSlotProps = {
  label: string;
  item?: Garment;
  position: number;
  total: number;
  locked: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleLock: () => void;
};

function BuilderSlot({
  label,
  item,
  position,
  total,
  locked,
  onPrev,
  onNext,
  onToggleLock,
}: BuilderSlotProps) {
  const canCycle = total > 1 && !locked;

  return (
    <View style={styles.slotCard}>
      <View style={styles.slotImageWrap}>
        {item ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.slotImage}
            resizeMode="cover"
            accessibilityLabel={item.name}
          />
        ) : (
          <MaterialIcons name="checkroom" size={28} color={colors.gray400} />
        )}
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>{label}</Text>
        </View>
      </View>
      <View style={styles.slotInfo}>
        {item ? (
          <>
            <Text style={styles.garmentBrand} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={styles.garmentName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.slotMeta} numberOfLines={1}>
              {item.meta}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.garmentName} numberOfLines={1}>
              {`No ${label.toLowerCase()} yet`}
            </Text>
            <Text style={styles.slotMeta}>Add pieces to fill this slot</Text>
          </>
        )}
        <View style={styles.slotControls}>
          <Pressable
            accessibilityLabel={`Previous ${label.toLowerCase()}`}
            disabled={!canCycle}
            onPress={onPrev}
            style={[styles.arrowBtn, !canCycle && styles.disabled]}
          >
            <MaterialIcons name="chevron-left" size={16} color={colors.primary} />
          </Pressable>
          <Text style={styles.slotCounter}>{`${total > 0 ? position + 1 : 0} of ${total}`}</Text>
          <Pressable
            accessibilityLabel={`Next ${label.toLowerCase()}`}
            disabled={!canCycle}
            onPress={onNext}
            style={[styles.arrowBtn, !canCycle && styles.disabled]}
          >
            <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </View>
      <Pressable
        accessibilityLabel={locked ? `Unlock ${label.toLowerCase()} slot` : `Lock ${label.toLowerCase()} slot`}
        accessibilityState={{ selected: locked }}
        onPress={onToggleLock}
        style={[styles.lockBtn, locked && styles.lockBtnActive]}
      >
        <MaterialIcons
          name={locked ? 'lock' : 'lock-open'}
          size={18}
          color={locked ? colors.white : colors.gray600}
        />
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ClosetScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const hasHydrated = useHydrated();
  const [view, setView] = useState<'grid' | 'builder'>('grid');
  const [category, setCategory] = useState<'all' | GarmentCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | GarmentStatus>('all');
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sort, setSort] = useState<'most-worn' | 'least-worn'>('most-worn');
  const [slotIndex, setSlotIndex] = useState<Record<SlotKey, number>>({
    tops: 0,
    bottoms: 0,
    footwear: 0,
  });
  const [slotLocked, setSlotLocked] = useState<Record<SlotKey, boolean>>({
    tops: false,
    bottoms: false,
    footwear: false,
  });

  if (!hasHydrated || !fontsLoaded) {
    return <LoadingScreen />;
  }

  // Counts for the filter pills
  const total = garments.length;
  const categoryCount = (key: 'all' | GarmentCategory) =>
    key === 'all' ? total : garments.filter((g) => g.category === key).length;
  const statusCount = (key: 'all' | GarmentStatus) =>
    key === 'all' ? total : garments.filter((g) => g.status === key).length;
  const availablePct = total > 0 ? Math.round((statusCount('available') / total) * 100) : 0;

  // Filtered + sorted list
  const normalizedQuery = query.trim().toLowerCase();
  const visible = garments
    .filter((g) => {
      const matchCategory = category === 'all' || g.category === category;
      const matchStatus = statusFilter === 'all' || g.status === statusFilter;
      const haystack = [g.brand, g.name, g.meta, g.note ?? '', statusLabels[g.status]]
        .join(' ')
        .toLowerCase();
      const matchSearch = normalizedQuery === '' || haystack.includes(normalizedQuery);
      return matchCategory && matchStatus && matchSearch;
    })
    .sort((a, b) => (sort === 'most-worn' ? b.wears - a.wears : a.wears - b.wears));

  const rows: Garment[][] = [];
  for (let i = 0; i < visible.length; i += 2) rows.push(visible.slice(i, i + 2));

  const resetFilters = () => {
    setCategory('all');
    setStatusFilter('all');
    setQuery('');
  };

  // Outfit builder
  const slotItems = (key: SlotKey) => garments.filter((g) => g.category === key);
  const cycleSlot = (key: SlotKey, step: 1 | -1) => {
    const count = slotItems(key).length;
    if (count < 2) return;
    setSlotIndex((prev) => ({ ...prev, [key]: (prev[key] + step + count) % count }));
  };
  const toggleLock = (key: SlotKey) => setSlotLocked((prev) => ({ ...prev, [key]: !prev[key] }));
  const canSchedule = slotCategories.every(({ key }) => slotItems(key).length > 0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <HeaderMenu />
          <View style={styles.brand}>
            <CladLogo size={30} />
            <Text style={styles.brandText}>CLAD</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => router.push('/main/notification')}
              style={styles.headerIconButton}
            >
              <MaterialIcons name="notifications-none" size={23} color={colors.primary} />
            </Pressable>
            <View style={styles.profileCircle} accessibilityLabel="Profile">
              <MaterialIcons name="person-outline" size={18} color={colors.white} />
            </View>
          </View>
        </View>

      </SafeAreaView>



      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* View switcher */}
        <View style={styles.switcher}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: view === 'grid' }}
            onPress={() => setView('grid')}
            style={[styles.switchBtn, view === 'grid' && styles.switchBtnActive]}
          >
            <MaterialIcons
              name="grid-view"
              size={18}
              color={view === 'grid' ? colors.white : colors.gray500}
            />
            <Text style={[styles.switchText, view === 'grid' && styles.switchTextActive]}>
              Wardrobe Grid
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: view === 'builder' }}
            onPress={() => setView('builder')}
            style={[styles.switchBtn, view === 'builder' && styles.switchBtnActive]}
          >
            <MaterialIcons
              name="tune"
              size={18}
              color={view === 'builder' ? colors.white : colors.gray500}
            />
            <Text style={[styles.switchText, view === 'builder' && styles.switchTextActive]}>
              Outfit Builder
            </Text>
          </Pressable>
        </View>

        {view === 'grid' ? (
          <>
            {/* Search */}
            <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
              <MaterialIcons name="search" size={20} color={colors.gray400} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search by tag, color, fit..."
                placeholderTextColor={colors.gray400}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>

            {/* Category pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.bleedContent}
            >
              <View style={styles.categoryTrack}>
                {categories.map(({ key, label }) => {
                  const active = category === key;
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setCategory(key)}
                      style={[styles.categoryPill, active && styles.categoryPillActive]}
                    >
                      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                        {label}{' '}
                        <Text style={[styles.categoryCount, active && styles.categoryCountActive]}>
                          {categoryCount(key)}
                        </Text>
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Status chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.bleed, styles.statusScroll]}
              contentContainerStyle={styles.bleedContent}
            >
              <View style={styles.statusTrack}>
                {statusFilters.map(({ key, label, dot }) => {
                  const active = statusFilter === key;
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setStatusFilter(key)}
                      style={[styles.statusChip, active && styles.statusChipActive]}
                    >
                      {dot && !active ? <View style={[styles.chipDot, { backgroundColor: dot }]} /> : null}
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {key === 'all' ? label : `${label} (${statusCount(key)})`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>ARCHIVED PIECES</Text>
                {total > 0 && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{`${availablePct}% Active`}</Text>
                  </View>
                )}
              </View>
              {total > 1 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSort((s) => (s === 'most-worn' ? 'least-worn' : 'most-worn'))}
                  style={styles.sortBtn}
                >
                  <MaterialIcons name="swap-vert" size={16} color={colors.gray600} />
                  <Text style={styles.sortText}>{sort === 'most-worn' ? 'Most Worn' : 'Least Worn'}</Text>
                </Pressable>
              )}
            </View>

            {/* Garment grid / empty states */}
            {total === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="checkroom" size={32} color={colors.gray500} />
                </View>
                <Text style={styles.emptyTitle}>Your closet is empty</Text>
                <Text style={styles.emptyCopy}>
                  Add your first piece to start building your wardrobe.
                </Text>
              </View>
            ) : visible.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="checkroom" size={32} color={colors.gray500} />
                </View>
                <Text style={styles.emptyTitle}>No Pieces Found</Text>
                <Text style={styles.emptyCopy}>
                  No garments match your active filters. Clear them to explore your complete closet.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={resetFilters}
                  style={({ pressed }) => [styles.resetBtn, pressed && styles.pressedScale]}
                >
                  <Text style={styles.resetText}>Reset All Filters</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.grid}>
                {rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.gridRow}>
                    {row.map((item) => (
                      <GarmentCard key={item.id} item={item} />
                    ))}
                    {row.length === 1 && <View style={styles.gridSpacer} />}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.builder}>
            <View style={styles.builderHeading}>
              <Text style={styles.summaryLabel}>MATRIX CANVAS (3-TIER)</Text>
            </View>
            <View style={styles.slotList}>
              {slotCategories.map(({ key, label }) => {
                const items = slotItems(key);
                const position = items.length > 0 ? slotIndex[key] % items.length : 0;
                return (
                  <BuilderSlot
                    key={key}
                    label={label}
                    item={items[position]}
                    position={position}
                    total={items.length}
                    locked={slotLocked[key]}
                    onPrev={() => cycleSlot(key, -1)}
                    onNext={() => cycleSlot(key, 1)}
                    onToggleLock={() => toggleLock(key)}
                  />
                );
              })}
            </View>
            <View style={styles.builderActions}>
              <Pressable
                accessibilityRole="button"
                disabled={!canSchedule}
                onPress={() => Alert.alert('Schedule Outfit', 'Scheduling is coming soon.')}
                style={({ pressed }) => [
                  styles.scheduleBtn,
                  !canSchedule && styles.disabledBtn,
                  pressed && styles.pressedScale,
                ]}
              >
                <MaterialIcons name="calendar-today" size={20} color={colors.white} />
                <Text style={styles.scheduleText}>Schedule Outfit</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Save to lookbook"
                accessibilityRole="button"
                disabled={!canSchedule}
                onPress={() => Alert.alert('Lookbook', 'Lookbook is coming soon.')}
                style={({ pressed }) => [
                  styles.saveBtn,
                  !canSchedule && styles.disabledBtn,
                  pressed && styles.pressedScale,
                ]}
              >
                <MaterialIcons name="bookmark-border" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  pressedScale: { transform: [{ scale: 0.95 }] },
  disabled: { opacity: 0.4 },
  disabledBtn: { opacity: 0.5 },

  // Header
  headerSafe: {
    zIndex: 20,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,231,235,0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: {
    color: colors.primary,
    fontFamily: font.semibold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu
  menuBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 },
  menuDropdown: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    left: 12,
    minWidth: 210,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    zIndex: 30,
  },
  menuItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: { fontFamily: font.medium, fontSize: 15, color: colors.primary },
  logoutText: { color: colors.blue },
  menuDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: 4 },

  // Layout
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  bleed: { marginHorizontal: -16, flexGrow: 0 },
  bleedContent: { paddingHorizontal: 16 },

  // View switcher
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 16,
    borderRadius: 9999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  switchBtnActive: { backgroundColor: colors.primary },
  switchText: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.gray500 },
  switchTextActive: { color: colors.white },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 9999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.8)',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchWrapFocused: { borderColor: colors.primary },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.primary,
  },

  // Category pills
  categoryTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 9999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.7)',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9999 },
  categoryPillActive: { backgroundColor: colors.primary },
  categoryText: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.gray600 },
  categoryTextActive: { color: colors.white },
  categoryCount: { fontSize: 11, color: 'rgba(75,85,99,0.6)' },
  categoryCountActive: { color: 'rgba(255,255,255,0.75)' },

  // Status chips
  statusScroll: { marginTop: 8, marginBottom: 24 },
  statusTrack: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.55,
    color: colors.gray500,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldSoftBorder,
  },
  activeBadgeText: { fontFamily: font.semibold, fontSize: 10, lineHeight: 12, color: colors.emeraldText },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.gray600 },

  // Garment grid
  grid: { gap: 12, marginBottom: 32 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridSpacer: { flex: 1 },
  garmentCard: {
    flex: 1,
    padding: 10,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  garmentImageWrap: {
    width: '100%',
    aspectRatio: 4 / 5,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentImage: { width: '100%', height: '100%' },
  garmentImageMuted: { opacity: 0.6 },
  laundryOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  laundryOverlayText: {
    fontFamily: font.semibold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
    color: colors.amber700,
  },
  wearsPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  wearsText: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.white },
  statusPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.5)',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: font.medium, fontSize: 10, lineHeight: 12 },
  garmentText: { minWidth: 0 },
  garmentBrand: {
    fontFamily: font.medium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.gray500,
  },
  garmentName: {
    marginTop: 2,
    fontFamily: font.semibold,
    fontSize: 17,
    lineHeight: 21,
    color: colors.primary,
  },
  garmentMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  garmentMeta: { flexShrink: 1, fontFamily: font.medium, fontSize: 11, lineHeight: 14, color: colors.gray500 },
  garmentNote: { flexShrink: 1, fontFamily: font.medium, fontSize: 11, lineHeight: 14, textAlign: 'right' },

  // Empty states
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    borderRadius: 32,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginBottom: 4,
    fontFamily: font.semibold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.primary,
    textAlign: 'center',
  },
  emptyCopy: {
    maxWidth: 320,
    marginBottom: 16,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.gray500,
    textAlign: 'center',
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  resetText: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.white },

  // Outfit builder
  builder: { paddingBottom: 32 },
  builderHeading: { marginBottom: 8, paddingHorizontal: 2 },
  slotList: { gap: 12, marginBottom: 24 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  slotImageWrap: {
    width: 80,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotImage: { width: '100%', height: '100%' },
  slotBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.6)',
  },
  slotBadgeText: {
    fontFamily: font.medium,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  slotInfo: { flex: 1, minWidth: 0 },
  slotMeta: { marginTop: 2, fontFamily: font.medium, fontSize: 11, lineHeight: 14, color: colors.gray500 },
  slotControls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCounter: { fontFamily: monoFont, fontSize: 11, lineHeight: 14, color: colors.gray500 },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnActive: { backgroundColor: colors.primary },
  builderActions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  scheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scheduleText: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.white },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  // Bottom bar
  bottomSafe: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,231,235,0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -1 },
  },
  bottomBar: {
    height: 64,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: { minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, letterSpacing: -0.2, color: colors.gray500 },
  tabLabelActive: { fontFamily: font.semibold, color: colors.primary },
  addWrap: { alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -12 }] },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});