import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  background: '#f8f9fa',
  card: '#ffffff',
  cardBorder: 'rgba(228,228,231,0.7)',
  inset: '#fafafa',
  insetBorder: '#f4f4f5',
  chip: '#f4f4f5',
  chipBorder: 'rgba(228,228,231,0.6)',
  title: '#18181b',
  strong: '#09090b',
  text: '#3f3f46',
  textDark: '#27272a',
  muted: '#71717a',
  quiet: '#a1a1aa',
  icon: '#52525b',
  white: '#ffffff',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  blueRing: '#dbeafe',
  blueText: '#1d4ed8',
  blueSoftBorder: 'rgba(191,219,254,0.6)',
  amber: '#f59e0b',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

const cladLogo = require('../../assets/images/clad-logo.png');

const tabs = [
  { key: 'today', label: 'Today', icon: 'auto-awesome' as const, active: true },
  { key: 'closet', label: 'Closet', icon: 'checkroom' as const },
  { key: 'add', label: 'Add item', icon: 'add' as const, primary: true },
  { key: 'calendar', label: 'Calendar', icon: 'calendar-today' as const },
  { key: 'laundry', label: 'Laundry', icon: 'local-laundry-service' as const },
];

// ---------------------------------------------------------------------------
// Dashboard data
// ---------------------------------------------------------------------------
type OutfitItem = {
  id: string;
  category: string;
  name: string;
  detail: string;
  imageUri: string;
  clean: boolean;
};

type DashboardData = {
  dressCode: { title: string; note: string; verified?: boolean } | null;
  weather: { summary: string; advice: string; status?: string } | null;
  outfit: OutfitItem[];
  laundry: { title: string; subtitle: string } | null;
  rotation: { days: number; note: string } | null;
  styleNote: { title: string; copy: string } | null;
};

// Nothing is wired up yet, so every section falls back to its empty state.
const emptyData: DashboardData = {
  dressCode: null,
  weather: null,
  outfit: [],
  laundry: null,
  rotation: null,
  styleNote: null,
};

// Sample content from the design mockup, for previewing the populated layout.
export const demoData: DashboardData = {
  dressCode: {
    title: 'Wednesday • Athletic Attire',
    note: 'Scheduled physical curriculum requirement active until 4:00 PM.',
    verified: true,
  },
  weather: {
    summary: '72°F / 22°C • Mostly Sunny',
    advice: 'Breathable high-mobility weave advised',
    status: 'Optimal',
  },
  outfit: [
    {
      id: 'bomber',
      category: 'Outerwear',
      name: 'Matte Obsidian Bomber',
      detail: 'Water-resistant nylon',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDW9hvT4tE3pZQOzS32ZV8ez1Lnhf8Y5h9FPz8T1poRd6v5s6ZuRG8siUGs4N9J9jhQIDa6WVVs_PDiSI3xEZ_4az0cMVZWl2JfC8yk37APYsaRhsyLnhDt1rwJ6nubzpvkHX2UOtWpYagfa5a3lcqg7WL2SxjZuRrVjcHcrLqdfeMMI4p_6oEutAo2oizpM72NGm4KYWhFtLAGce24u0vnTBre-aGhc4ndnC93Ytj6i2n6y6gze7LwQA',
      clean: true,
    },
    {
      id: 'tee',
      category: 'Top',
      name: 'Heather Boxy Tee',
      detail: '280gsm organic cotton',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBRlGSMopxhpMoukCHVu8A2kRmt5mXq9kmbEUJX7mJyeitunyGhQy6WODPb3Bu_HDbkEARoD0jTfP2wFXFZuAd3H2mpu-ZTk_rB2vPTzdDQXu22-qEQV7-mCARPMu7kRuOXrUUzKE1VxByzs7ejMH3MvN9wIcxdTd9yi8akhzGn6g5Z8wj2YWfwtxZMJ0RVG690_9MF6-hchMzRxUCSF3Tr-bmG2ambEvVZWqCWOJsm1EUpA-QuhI8ClA',
      clean: true,
    },
    {
      id: 'joggers',
      category: 'Bottom',
      name: 'Charcoal Tech Joggers',
      detail: '4-way technical stretch',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB-RfxcnHLur4vOYuD3avZf4RhrYKI33Py0zfOvK8DZZ8Iu7qd50OUmiT8-xYmJ2ZfnbD8n2FOc_mvouXlqWHlqJLg0D2p9XcqIyoMLx8555aDs3mSmTeHNUQgqpiKb_Ad_hxlSWsJvHZ9395E2ZwJDOYWxjNqr98wrG2rtu3Y9JV6s1n3yL9Kwb_-Xzm9feXaCwFqCYpuncWykKE4wtrMg3cmcfA7hW-_YIAf_RwmrYAafDH4XPYEG-w',
      clean: true,
    },
    {
      id: 'sneakers',
      category: 'Footwear',
      name: 'Atelier Low Court',
      detail: 'Calfskin monochrome',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCKRQAvp5XA23b5NEDJAU-kMVbWwiqjeVpWjVuQYnLYie2RCxgu13LJ-ILjF3_Bz8i2sfITUpcMq2QlfzgE7ZGtEtJicFrqUIarwrRAUP1O23G8vhooYiZxrgLL9Yu5pKVUPC3jHdb6qzvZCfLyBbUmFdpNWqjCvG0hFqbYP4a0tand0C7HSMc_7Rd4f8anWb2VfH-p97jHOBlhO0DrUJHIoX3mNipiGwdD6saKHPgIX_VIeFuESpSDxw',
      clean: true,
    },
  ],
  laundry: { title: '3 Tops in Wash', subtitle: 'Cycle scheduled for Sunday' },
  rotation: { days: 5, note: 'Zero repeats this week' },
  styleNote: {
    title: 'High-Low Athletic',
    copy: 'Elevate performance sweatpants with structured outerwear for class.',
  },
};

// Swap `emptyData` for `demoData` to preview the populated design.
const dashboard: DashboardData = emptyData;

export default function DashboardScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const hasHydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const [worn, setWorn] = useState(false);

  const [spin] = useState(() => new Animated.Value(0));
  const wornTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wornTimer.current) clearTimeout(wornTimer.current);
    };
  }, []);

  if (!hasHydrated || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.title} />
      </View>
    );
  }

  const { dressCode, weather, outfit, laundry, rotation, styleNote } = dashboard;
  const hasOutfit = outfit.length > 0;
  const allClean = hasOutfit && outfit.every((item) => item.clean);

  const outfitRows: OutfitItem[][] = [];
  for (let i = 0; i < outfit.length; i += 2) outfitRows.push(outfit.slice(i, i + 2));

  const handleWear = () => {
    // TODO: persist the wear log once outfit data is connected.
    setWorn(true);
    if (wornTimer.current) clearTimeout(wornTimer.current);
    wornTimer.current = setTimeout(() => setWorn(false), 2500);
  };

  const handleShuffle = () => {
    // TODO: request a new outfit suggestion once outfit data is connected.
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 300, useNativeDriver: true }).start(() =>
      spin.setValue(0),
    );
  };

  const spinRotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen((open) => !open)}
            style={styles.headerIconButton}
          >
            <MaterialIcons name="menu" size={25} color={colors.icon} />
          </Pressable>
          <View style={styles.brand}>
            <Image
              source={cladLogo}
              style={styles.logo}
              resizeMode="contain"
              tintColor={colors.strong}
            />
            <Text style={styles.brandText}>CLAD</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => Alert.alert('Notifications', 'Notifications are not available yet.')}
              style={styles.headerIconButton}
            >
              <MaterialIcons name="notifications-none" size={23} color={colors.icon} />
            </Pressable>
            <View style={styles.profileCircle} accessibilityLabel="Profile">
              <MaterialIcons name="person-outline" size={18} color={colors.white} />
            </View>
          </View>
        </View>
        {menuOpen && (
          <View style={styles.menuDropdown} accessibilityRole="menu">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMenuOpen(false);
                Alert.alert('Profile', 'Jabi\njabi@clad.demo');
              }}
              style={styles.menuItem}
            >
              <MaterialIcons name="person-outline" size={20} color={colors.icon} />
              <Text style={styles.menuItemText}>Profile</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMenuOpen(false);
                Alert.alert('Settings', 'Settings are not available yet.');
              }}
              style={styles.menuItem}
            >
              <MaterialIcons name="settings" size={20} color={colors.icon} />
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMenuOpen(false);
                router.replace('/');
              }}
              style={styles.menuItem}
            >
              <MaterialIcons name="logout" size={20} color={colors.blue} />
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {menuOpen && (
        <Pressable
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}
          style={styles.menuBackdrop}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome, Jabi</Text>

        {/* Dress code & weather */}
        <View style={styles.sectionCard}>
          <View style={styles.bannerTop}>
            <View style={styles.protocolRow}>
              <View style={styles.blueDot} />
              <Text style={styles.protocol}>{dressCode ? 'UNIFORM PROTOCOL' : 'TODAY'}</Text>
            </View>
            {dressCode?.verified && (
              <View style={styles.verifiedPill}>
                <MaterialIcons name="verified" size={14} color={colors.blue} />
                <Text style={styles.verifiedText}>Uniform Rule Verified</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.bannerTitle}>
              {dressCode ? dressCode.title : 'No dress code scheduled'}
            </Text>
            <Text style={styles.bannerCopy}>
              {dressCode ? dressCode.note : 'Your daily schedule will appear here when available.'}
            </Text>
          </View>
          <View style={styles.weatherRow}>
            {weather ? (
              <>
                <View style={styles.weatherDetails}>
                  <MaterialIcons name="wb-sunny" size={20} color={colors.amber} />
                  <View style={styles.weatherText}>
                    <Text style={styles.weatherTitle}>{weather.summary}</Text>
                    <Text style={styles.caption}>{weather.advice}</Text>
                  </View>
                </View>
                {weather.status ? (
                  <View style={styles.weatherBadge}>
                    <Text style={styles.weatherBadgeText}>{weather.status}</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.weatherDetails}>
                <MaterialIcons name="cloud-off" size={21} color={colors.blue} />
                <View style={styles.weatherText}>
                  <Text style={styles.weatherTitle}>Weather unavailable</Text>
                  <Text style={styles.caption}>Weather details will appear here when enabled</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Outfit */}
        <View style={[styles.sectionCard, styles.outfitCard]}>
          <View style={styles.cardHeadingRow}>
            <View style={styles.cardHeading}>
              <MaterialIcons name="style" size={20} color={colors.title} />
              <Text style={styles.cardTitle}>{hasOutfit ? 'Curated Ensemble' : 'Outfit'}</Text>
            </View>
            {allClean && (
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{`All ${outfit.length} items Available & Clean`}</Text>
              </View>
            )}
          </View>

          {hasOutfit ? (
            <>
              <View style={styles.outfitGrid}>
                {outfitRows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.outfitRow}>
                    {row.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemImageWrap}>
                          <Image
                            source={{ uri: item.imageUri }}
                            style={styles.itemImage}
                            resizeMode="cover"
                            accessibilityLabel={item.name}
                          />
                          <View style={styles.itemBadge}>
                            <Text style={styles.itemBadgeText}>{item.category}</Text>
                          </View>
                        </View>
                        <View style={styles.itemTextWrap}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.itemDetail}>{item.detail}</Text>
                        </View>
                      </View>
                    ))}
                    {row.length === 1 && <View style={styles.itemSpacer} />}
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleWear}
                  style={({ pressed }) => [
                    styles.wearBtn,
                    worn && styles.wearBtnDone,
                    pressed && styles.pressedScale,
                  ]}
                >
                  <MaterialIcons name={worn ? 'done-all' : 'check'} size={20} color={colors.white} />
                  <Text style={styles.wearText}>{worn ? 'Logged for Today' : 'Wear Today'}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Shuffle outfit suggestion"
                  accessibilityRole="button"
                  onPress={handleShuffle}
                  style={({ pressed }) => [styles.shuffleBtn, pressed && styles.pressedScale]}
                >
                  <Animated.View style={{ transform: [{ rotate: spinRotation }] }}>
                    <MaterialIcons name="shuffle" size={22} color={colors.textDark} />
                  </Animated.View>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="checkroom" size={30} color={colors.quiet} />
              <Text style={styles.emptyTitle}>No outfit selected</Text>
              <Text style={styles.emptyCopy}>Add wardrobe pieces to see outfit suggestions here.</Text>
            </View>
          )}
        </View>

        {/* Laundry */}
        <View style={styles.laundryCard}>
          <View style={styles.laundryInfo}>
            <View style={styles.laundryIcon}>
              <MaterialIcons name="local-laundry-service" size={22} color={colors.blue} />
            </View>
            <View style={styles.laundryCopy}>
              <Text style={styles.laundryTitle} numberOfLines={1}>
                {laundry ? laundry.title : 'No laundry items'}
              </Text>
              <Text style={styles.laundrySubtitle} numberOfLines={1}>
                {laundry ? laundry.subtitle : 'Laundry updates will appear here'}
              </Text>
            </View>
          </View>
          {laundry && (
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Laundry', 'Laundry details are coming soon.')}
              style={({ pressed }) => [styles.inspectBtn, pressed && styles.pressedScale]}
            >
              <Text style={styles.inspectText}>Inspect</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.textDark} />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>ROTATION</Text>
              <MaterialIcons
                name={rotation ? 'verified' : 'history'}
                size={18}
                color={rotation ? colors.blue : colors.quiet}
              />
            </View>
            <View>
              <View style={styles.rotationValueRow}>
                <Text style={styles.rotationValue}>{rotation ? rotation.days : '—'}</Text>
                {rotation && <Text style={styles.rotationUnit}>Days</Text>}
              </View>
              <Text style={styles.statCopy}>
                {rotation ? rotation.note : 'Wear history will appear here'}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>STYLE NOTE</Text>
              <MaterialIcons
                name="tips-and-updates"
                size={18}
                color={styleNote ? colors.amber : colors.quiet}
              />
            </View>
            <View>
              <Text style={styles.styleNoteTitle}>
                {styleNote ? styleNote.title : 'No style note yet'}
              </Text>
              <Text style={styles.styleNoteCopy}>
                {styleNote ? styleNote.copy : 'Personalized styling tips will appear here.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomBar}>
          {tabs.map((tab) =>
            tab.primary ? (
              <Pressable
                key={tab.key}
                accessibilityLabel={tab.label}
                accessibilityRole="button"
                onPress={() => Alert.alert(tab.label, `${tab.label} is coming soon.`)}
                style={({ pressed }) => [styles.tabButton, pressed && styles.pressedScale]}
              >
                <View style={styles.addButton}>
                  <MaterialIcons name={tab.icon} size={24} color={colors.white} />
                </View>
              </Pressable>
            ) : (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={{ selected: Boolean(tab.active) }}
                onPress={() => {
                  if (!tab.active) Alert.alert(tab.label, `${tab.label} is coming soon.`);
                }}
                style={styles.tabButton}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={22}
                  color={tab.active ? colors.strong : colors.muted}
                />
                <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </SafeAreaView>
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

  // Header
  headerSafe: {
    zIndex: 20,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228,228,231,0.8)',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
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
  logo: { width: 30, height: 30 },
  brandText: {
    color: colors.strong,
    fontFamily: font.bold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.title,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
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
    borderColor: 'rgba(228,228,231,0.8)',
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
  menuItemText: { fontFamily: font.medium, fontSize: 15, color: colors.title },
  logoutText: { color: colors.blue },
  menuDivider: { height: 1, backgroundColor: colors.insetBorder, marginVertical: 4 },

  // Layout
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 24 },
  greeting: { fontFamily: font.semibold, fontSize: 24, color: colors.title },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  // Dress code banner
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  protocolRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  protocol: {
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.55,
    color: colors.blue,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: 'rgba(228,228,231,0.5)',
  },
  verifiedText: { fontFamily: font.medium, fontSize: 10, letterSpacing: -0.2, color: colors.text },
  bannerTitle: {
    fontFamily: font.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.title,
  },
  bannerCopy: { fontFamily: font.regular, fontSize: 15, lineHeight: 20, color: colors.muted },
  weatherRow: {
    marginTop: 4,
    backgroundColor: colors.inset,
    borderWidth: 1,
    borderColor: colors.insetBorder,
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  weatherDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  weatherText: { flexShrink: 1 },
  weatherTitle: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.title },
  caption: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.muted },
  weatherBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(228,228,231,0.7)',
  },
  weatherBadgeText: { fontFamily: font.medium, fontSize: 11, lineHeight: 13, color: colors.text },

  // Outfit
  outfitCard: { gap: 16, shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardTitle: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: colors.title },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.blueSoft,
    borderWidth: 1,
    borderColor: colors.blueSoftBorder,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.blue },
  statusText: { fontFamily: font.medium, fontSize: 11, lineHeight: 13, color: colors.blueText },

  outfitGrid: { gap: 8 },
  outfitRow: { flexDirection: 'row', gap: 8 },
  itemSpacer: { flex: 1 },
  itemCard: {
    flex: 1,
    padding: 8,
    gap: 4,
    borderRadius: 16,
    backgroundColor: colors.inset,
    borderWidth: 1,
    borderColor: 'rgba(228,228,231,0.6)',
  },
  itemImageWrap: {
    width: '100%',
    height: 128,
    borderRadius: 16,
    backgroundColor: 'rgba(228,228,231,0.6)',
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(228,228,231,0.5)',
  },
  itemBadgeText: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.textDark },
  itemTextWrap: { minWidth: 0 },
  itemName: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.title },
  itemDetail: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, color: colors.muted },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  wearBtn: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    backgroundColor: colors.strong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  wearBtnDone: { backgroundColor: colors.blue },
  wearText: { fontFamily: font.medium, fontSize: 17, lineHeight: 22, color: colors.white },
  shuffleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: 'rgba(228,228,231,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  emptyState: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 12, gap: 6 },
  emptyTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.title },
  emptyCopy: {
    maxWidth: 280,
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },

  // Laundry
  laundryCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  laundryInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  laundryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueSoft,
    borderWidth: 1,
    borderColor: colors.blueRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laundryCopy: { flex: 1, minWidth: 0 },
  laundryTitle: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: colors.title },
  laundrySubtitle: { fontFamily: font.regular, fontSize: 15, lineHeight: 20, color: colors.muted },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  inspectText: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.textDark },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    padding: 16,
    gap: 8,
    borderRadius: 32,
    backgroundColor: colors.card,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontFamily: font.semibold, fontSize: 10, lineHeight: 12, letterSpacing: 0.5, color: colors.muted },
  rotationValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  rotationValue: { fontFamily: font.bold, fontSize: 34, lineHeight: 38, color: colors.strong },
  rotationUnit: { fontFamily: font.semibold, fontSize: 13, color: colors.blue },
  statCopy: { marginTop: 4, fontFamily: font.regular, fontSize: 15, lineHeight: 20, color: colors.muted },
  styleNoteTitle: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.title },
  styleNoteCopy: { marginTop: 4, fontFamily: font.medium, fontSize: 10, lineHeight: 13, color: colors.muted },

  // Bottom bar
  bottomSafe: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228,228,231,0.8)',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  bottomBar: {
    height: 64,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: { minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontFamily: font.medium, fontSize: 10, lineHeight: 12, letterSpacing: -0.2, color: colors.muted },
  tabLabelActive: { fontFamily: font.semibold, color: colors.strong },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.strong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});