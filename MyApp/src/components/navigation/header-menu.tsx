import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { HankenGrotesk_500Medium, useFonts } from '@expo-google-fonts/hanken-grotesk';

const links = [
  { label: 'Profile', href: '/main/profile', icon: 'person-outline' },
  { label: 'Settings', href: 'settings', icon: 'settings' },
  { label: 'Logout', href: '/', icon: 'logout' },
] as const;

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const [position, setPosition] = useState({ left: 12, top: 68 });
  const { width, height } = useWindowDimensions();
  useFonts({ HankenGrotesk_500Medium });
  const showMenu = () => {
    trigger.current?.measureInWindow((x, y, _width, buttonHeight) => {
      setPosition({ left: Math.max(8, Math.min(x - 4, width - 218)), top: Math.max(8, Math.min(y + buttonHeight + 14, height - 170)) });
      setOpen(true);
    });
  };
  return (
    <>
      <Pressable ref={trigger} accessibilityRole="button" accessibilityLabel="Open menu" accessibilityState={{ expanded: open }} onPress={showMenu} style={styles.trigger}>
        <MaterialIcons name="menu" size={25} color="#52525b" />
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close menu" style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View accessibilityRole="menu" style={[styles.panel, position]}>
            {links.map((link) => (
              <Pressable key={link.href} accessibilityRole="menuitem" onPress={() => { setOpen(false); if (link.href === 'settings') Alert.alert('Settings', 'Settings are not available yet.'); else if (link.href === '/') router.replace('/'); else router.push(link.href); }} style={({ pressed }) => [styles.link, link.href === '/' && styles.logoutRow, pressed && { backgroundColor: '#f3f4f6' }]}>
                <MaterialIcons name={link.icon} size={20} color={link.href === '/' ? '#2563eb' : '#52525b'} /><Text style={[styles.label, link.href === '/' && { color: '#2563eb' }]}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1 },
  panel: { position: 'absolute', width: 210, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(228,228,231,0.8)', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  link: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  logoutRow: { borderTopWidth: 1, borderTopColor: '#f4f4f5', marginTop: 4, paddingTop: 4 },
  label: { fontFamily: 'HankenGrotesk_500Medium', color: '#18181b', fontSize: 15 },
});
