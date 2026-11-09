import { Slot } from 'expo-router';
import { View } from 'react-native';
import MainNavigation from '@/components/navigation/main-navigation';
import { WardrobeProvider } from '@/context/wardrobe-context';

export default function MainLayout() {
  return (
    <WardrobeProvider>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}><Slot /></View>
        <MainNavigation />
      </View>
    </WardrobeProvider>
  );
}
