import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CladLogo from '@/components/clad-logo';

export default function ScreenPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.header}><CladLogo size={32} /><Text style={styles.brand}>CLAD</Text></View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbf9f8' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  description: { fontSize: 15, lineHeight: 24, textAlign: 'center', color: '#6b7280', maxWidth: 360 },
});
