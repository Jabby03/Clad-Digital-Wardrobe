import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const mainScreens = [
  { href: '/main/today', label: 'Today', icon: 'auto-awesome' },
  { href: '/main/closet', label: 'Closet', icon: 'checkroom' },
  { href: '/main/camera', label: 'Add item', icon: 'add' },
  { href: '/main/calendar', label: 'Calendar', icon: 'calendar-today' },
  { href: '/main/laundry', label: 'Laundry', icon: 'local-laundry-service' },
] as const;

export default function MainNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buttons}>
        {mainScreens.map((screen) => {
          const selected = pathname === screen.href;
          return (
            <Pressable
              key={screen.href}
              accessibilityRole="button"
              accessibilityLabel={screen.label}
              accessibilityState={{ selected }}
              onPress={() => { if (!selected) router.navigate(screen.href); }}
              style={({ pressed }) => [styles.button, selected && styles.selected, pressed && styles.pressed]}
            >
              {screen.href === '/main/camera' ? (
                <View style={styles.addCircle}><MaterialIcons name="add" size={28} color="#fff" /></View>
              ) : (
                <MaterialIcons name={screen.icon} size={22} color={selected ? '#111827' : '#6b7280'} />
              )}
              <Text style={[styles.label, selected && styles.selectedLabel]}>{screen.label}</Text>
              <View style={[styles.indicator, selected && styles.activeIndicator]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  addCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  buttons: { flexGrow: 1, paddingHorizontal: 4 },
  button: { flex: 1, minWidth: 64, minHeight: 64, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6, alignItems: 'center', justifyContent: 'center', gap: 4 },
  selected: { backgroundColor: '#f3f4f6' },
  pressed: { opacity: 0.65 },
  label: { fontSize: 10, color: '#6b7280' },
  selectedLabel: { color: '#111827', fontWeight: '700' },
  indicator: { height: 3, width: 16, borderRadius: 2, backgroundColor: 'transparent' },
  activeIndicator: { backgroundColor: '#111827' },
});
