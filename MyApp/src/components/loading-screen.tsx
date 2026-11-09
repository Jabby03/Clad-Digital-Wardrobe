import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CladLogo from '@/components/clad-logo';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logoRing}>
          <CladLogo size={120} />
        </View>
        <Text style={styles.brand}>CLAD</Text>
        <Text style={styles.tagline}>WEAR IT, CLAD IT.</Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Loading your wardrobe" accessibilityState={{ busy: true }} style={styles.progress}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.message}>Preparing your wardrobe…</Text>
        </View>
      </View>
      <Text style={styles.footer}>YOUR STYLE, ORGANIZED.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbf9f8', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoRing: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, backgroundColor: '#fff', shadowColor: '#111827', shadowOpacity: 0.06, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  brand: { marginTop: 28, fontSize: 38, fontWeight: '700', color: '#111827', letterSpacing: 8, paddingLeft: 8 },
  tagline: { marginTop: 8, fontSize: 10, fontWeight: '600', letterSpacing: 2.5, color: '#4059aa', textAlign: 'center' },
  progress: { marginTop: 48, alignItems: 'center', gap: 14 },
  message: { fontSize: 14, lineHeight: 20, color: '#6b7280', textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingVertical: 24, fontSize: 9, fontWeight: '600', letterSpacing: 2, color: '#9ca3af', textAlign: 'center' },
});
