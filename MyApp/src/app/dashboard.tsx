import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';

const colors = {
  background: '#131313',
  card: '#201f1f',
  inset: '#1c1b1b',
  raised: '#2a2a2a',
  raisedHigh: '#353534',
  text: '#e5e2e1',
  muted: '#c4c7c8',
  quiet: '#8e9192',
  white: '#ffffff',
  blue: '#3b82f6',
} as const;

const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
} as const;

const cladLogo = require('../../assets/images/clad-logo.png');

const tabs = [
  { label: 'Today', icon: 'auto-awesome' as const, active: true },
  { label: 'My Closet', icon: 'checkroom' as const },
  { label: 'Studio', icon: 'tune' as const },
  { label: 'Calendar', icon: 'calendar-today' as const },
  { label: 'Laundry', icon: 'local-laundry-service' as const },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setHasHydrated(true), []);

  if (!hasHydrated || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen((open) => !open)}
            style={styles.headerIconButton}
          >
            <MaterialIcons name="menu" size={25} color={colors.muted} />
          </Pressable>
          <View style={styles.brand}>
            <Image source={cladLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>CLAD</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => Alert.alert('Notifications', 'Notifications are not available yet.')}
              style={styles.headerIconButton}
            >
              <MaterialIcons name="notifications-none" size={23} color={colors.muted} />
            </Pressable>
            <View style={styles.profileCircle} accessibilityLabel="Profile">
              <MaterialIcons name="person-outline" size={18} color={colors.background} />
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
              <MaterialIcons name="person-outline" size={20} color={colors.muted} />
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
              <MaterialIcons name="settings" size={20} color={colors.muted} />
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
        <View style={styles.sectionCard}>
          <View style={styles.protocolRow}>
            <View style={styles.blueDot} />
            <Text style={styles.protocol}>TODAY</Text>
          </View>
          <Text style={styles.bannerTitle}>No dress code scheduled</Text>
          <Text style={styles.bannerCopy}>Your daily schedule will appear here when available.</Text>
          <View style={styles.weatherRow}>
            <View style={styles.weatherDetails}>
              <MaterialIcons name="cloud-off" size={21} color={colors.blue} />
              <View style={styles.weatherText}>
                <Text style={styles.weatherTitle}>Weather unavailable</Text>
                <Text style={styles.caption}>Weather details will appear here when enabled</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeadingRow}>
            <View style={styles.cardHeading}>
              <MaterialIcons name="style" size={20} color={colors.white} />
              <Text style={styles.cardTitle}>Outfit</Text>
            </View>
          </View>
          <View style={styles.emptyState}>
            <MaterialIcons name="checkroom" size={30} color={colors.quiet} />
            <Text style={styles.emptyTitle}>No outfit selected</Text>
            <Text style={styles.emptyCopy}>Add wardrobe pieces to see outfit suggestions here.</Text>
          </View>
        </View>

        <View style={styles.laundryCard}>
          <View style={styles.laundryInfo}>
            <View style={styles.laundryIcon}>
              <MaterialIcons name="local-laundry-service" size={22} color={colors.blue} />
            </View>
            <View style={styles.laundryCopy}>
              <Text style={styles.laundryTitle}>No laundry items</Text>
              <Text style={styles.laundrySubtitle} numberOfLines={1}>
                Laundry updates will appear here
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>ROTATION</Text>
              <MaterialIcons name="history" size={19} color={colors.quiet} />
            </View>
            <View>
              <View style={styles.rotationValueRow}>
                <Text style={styles.rotationValue}>—</Text>
              </View>
              <Text style={styles.statCopy}>Wear history will appear here</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>STYLE NOTE</Text>
              <MaterialIcons name="tips-and-updates" size={19} color={colors.white} />
            </View>
            <View>
              <Text style={styles.styleNoteTitle}>No style note yet</Text>
              <Text style={styles.styleNoteCopy}>
                Personalized styling tips will appear here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomBar}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.label}
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
                color={tab.active ? colors.white : colors.quiet}
              />
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
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
  headerSafe: {
    zIndex: 20,
    position: 'relative',
    backgroundColor: 'rgba(19,19,19,0.96)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    height: 56,
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
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 },
  menuDropdown: {
    position: 'absolute',
    top: 56,
    left: 12,
    minWidth: 210,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
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
  menuItemText: { fontFamily: font.medium, fontSize: 15, color: colors.text },
  logoutText: { color: colors.blue },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.raisedHigh, marginVertical: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 16 },
  greeting: { fontFamily: font.semibold, fontSize: 24, color: colors.white },
  sectionCard: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 10 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blueDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.blue },
  protocol: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.blue,
  },
  bannerTitle: {
    fontFamily: font.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.white,
  },
  bannerCopy: { fontFamily: font.regular, fontSize: 15, lineHeight: 20, color: colors.muted },
  weatherRow: {
    marginTop: 2,
    backgroundColor: colors.inset,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  weatherDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  weatherText: { flexShrink: 1 },
  weatherTitle: { fontFamily: font.semibold, fontSize: 13, color: colors.white },
  caption: { fontFamily: font.medium, fontSize: 10, color: colors.muted },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: font.semibold, fontSize: 17, color: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 12, gap: 6 },
  emptyTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  emptyCopy: { maxWidth: 280, textAlign: 'center', fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: colors.quiet },
  laundryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  laundryInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  laundryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111d42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laundryCopy: { flex: 1, minWidth: 0 },
  laundryTitle: { fontFamily: font.semibold, fontSize: 17, color: colors.white },
  laundrySubtitle: { fontFamily: font.regular, fontSize: 14, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    minHeight: 148,
    padding: 14,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'space-between',
    gap: 12,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontFamily: font.semibold, fontSize: 10, letterSpacing: 1, color: colors.muted },
  rotationValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  rotationValue: { fontFamily: font.bold, fontSize: 34, lineHeight: 38, color: colors.white },
  statCopy: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  styleNoteTitle: { fontFamily: font.semibold, fontSize: 13, color: colors.white },
  styleNoteCopy: { marginTop: 4, fontFamily: font.regular, fontSize: 11, lineHeight: 14, color: colors.muted },
  bottomSafe: {
    backgroundColor: 'rgba(19,19,19,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomBar: {
    minHeight: 62,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: { minWidth: 55, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 5 },
  tabLabel: { fontFamily: font.medium, fontSize: 10, color: colors.quiet },
  tabLabelActive: { fontFamily: font.semibold, color: colors.white },
});
