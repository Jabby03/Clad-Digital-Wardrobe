import { Slot } from 'expo-router';
import { View } from 'react-native';
import MainNavigation from '@/components/main-navigation';

export default function MainLayout() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}><Slot /></View>
      <MainNavigation />
    </View>
  );
}
