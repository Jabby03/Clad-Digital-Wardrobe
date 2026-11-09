import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { garmentCategories, useWardrobe, type GarmentCategory } from '@/context/wardrobe-context';

export default function CameraScreen() {
  const router = useRouter();
  const { addGarment } = useWardrobe();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const saving = useRef(false);
  const capturing = useRef(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => () => {
    setCameraOpen(false);
    setReady(false);
  }, []));

  const openCamera = async () => {
    setError(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (!result.granted) {
        setError('Camera access is turned off. Allow camera access in settings, or choose an existing photo.');
        return;
      }
      setReady(false);
      setPhoto(null);
      setCameraOpen(true);
    } catch {
      setError('The camera could not be opened. Check your camera permissions or choose a photo instead.');
    }
  };

  const takePhoto = async () => {
    if (!ready || !camera.current || capturing.current) return;
    capturing.current = true;
    setBusy(true);
    setError(null);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.8 });
      if (!picture?.uri) throw new Error('No photo returned');
      setPhoto(picture.uri);
      setCameraOpen(false);
      setReady(false);
    } catch {
      setError('The photo could not be taken. Please try again.');
    } finally {
      capturing.current = false;
      setBusy(false);
    }
  };

  const choosePhoto = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhoto(result.assets[0].uri);
        setCameraOpen(false);
        setReady(false);
      }
    } catch {
      setError('The photo could not be opened. Please choose another image.');
    }
  };

  const save = () => {
    if (saving.current) return;
    if (!photo || !name.trim()) {
      setError('Add a photo and a clothing name before saving.');
      return;
    }
    saving.current = true;
    const label = garmentCategories.find((entry) => entry.key === category)!.label;
    addGarment({ name: name.trim(), brand: brand.trim() || 'My wardrobe', category, imageUri: photo, meta: [label, size.trim()].filter(Boolean).join(' • ') });
    router.replace('/main/closet');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to closet" onPress={() => router.replace('/main/closet')} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View><Text style={styles.title}>Add clothes</Text><Text style={styles.subtitle}>Capture a piece for your wardrobe</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="contain" accessibilityLabel="Clothing photo preview" />
          ) : cameraOpen ? (
            <CameraView
              key={facing}
              ref={camera}
              style={StyleSheet.absoluteFill}
              facing={facing}
              mode="picture"
              onCameraReady={() => setReady(true)}
              onMountError={() => { setCameraOpen(false); setReady(false); setError('No camera is available. You can choose a clothing photo instead.'); }}
            />
          ) : (
            <View style={styles.prompt}>
              <MaterialIcons name="add-a-photo" size={52} color="#6b7280" />
              <Text style={styles.promptTitle}>Give your clothes a place</Text>
              <Text style={styles.help}>Lay your item flat in good light, then take a photo or choose one from your device.</Text>
            </View>
          )}
        </View>

        {cameraOpen && !photo ? (
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Switch camera" disabled={busy} onPress={() => { setReady(false); setFacing((previous) => previous === 'back' ? 'front' : 'back'); }} style={styles.iconButton}>
              <MaterialIcons name="flip-camera-ios" size={28} color="#111827" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Take clothing photo" disabled={!ready || busy} onPress={takePhoto} style={[styles.shutter, (!ready || busy) && styles.disabled]}>
              {busy ? <ActivityIndicator color="#111827" /> : <View style={styles.shutterCenter} />}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Close camera" disabled={busy} onPress={() => { setCameraOpen(false); setReady(false); }} style={styles.iconButton}>
              <MaterialIcons name="close" size={28} color="#111827" />
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={openCamera} style={styles.primary}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" /><Text style={styles.primaryText}>{photo ? 'Retake photo' : 'Open camera'}</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" disabled={busy} onPress={choosePhoto} style={styles.secondary}>
          <MaterialIcons name="photo-library" size={20} color="#111827" /><Text style={styles.secondaryText}>{photo ? 'Choose a different photo' : 'Choose from photos'}</Text>
        </Pressable>
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {permission && !permission.granted && !permission.canAskAgain && Platform.OS !== 'web' && (
          <Pressable accessibilityRole="button" onPress={() => Linking.openSettings().catch(() => setError('Open your device settings to allow camera access.'))} style={styles.secondary}><Text style={styles.secondaryText}>Open camera settings</Text></Pressable>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>Item details</Text>
          <Text style={styles.label}>Clothing name *</Text>
          <TextInput accessibilityLabel="Clothing name, required" value={name} onChangeText={setName} placeholder="e.g. White cotton shirt" maxLength={80} style={styles.input} />
          <Text style={styles.label}>Category</Text>
          <View style={styles.categories}>
            {garmentCategories.map((entry) => (
              <Pressable key={entry.key} accessibilityRole="button" accessibilityState={{ selected: category === entry.key }} onPress={() => setCategory(entry.key)} style={[styles.chip, category === entry.key && styles.chipSelected]}>
                <Text style={category === entry.key ? styles.primaryText : styles.secondaryText}>{entry.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Brand (optional)</Text>
          <TextInput accessibilityLabel="Brand, optional" value={brand} onChangeText={setBrand} placeholder="e.g. Uniqlo" maxLength={60} style={styles.input} />
          <Text style={styles.label}>Size (optional)</Text>
          <TextInput accessibilityLabel="Size, optional" value={size} onChangeText={setSize} placeholder="e.g. Medium" maxLength={30} style={styles.input} />
          <Pressable accessibilityRole="button" disabled={busy} onPress={save} style={[styles.primary, busy && styles.disabled]}>
            <MaterialIcons name="checkroom" size={20} color="#fff" /><Text style={styles.primaryText}>Add to closet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbfbfb' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  content: { padding: 16, paddingTop: 0, gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' },
  preview: { width: '100%', aspectRatio: 3 / 4, maxHeight: 440, borderRadius: 24, overflow: 'hidden', backgroundColor: '#f0f1f3', borderWidth: 1, borderColor: '#e5e7eb' },
  previewImage: { width: '100%', height: '100%' },
  prompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 16 },
  promptTitle: { fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center' },
  help: { fontSize: 14, lineHeight: 22, color: '#6b7280', textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingVertical: 8 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  shutterCenter: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111827' },
  primary: { minHeight: 50, padding: 14, backgroundColor: '#111827', borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondary: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { color: '#111827', fontSize: 14, fontWeight: '500' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 24, gap: 12, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 8 },
  formTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  label: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  input: { minHeight: 48, backgroundColor: '#f3f4f6', paddingHorizontal: 14, borderRadius: 12, color: '#111827', fontSize: 15 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f3f4f6' },
  chipSelected: { backgroundColor: '#111827' },
  error: { color: '#b91c1c', fontSize: 14, lineHeight: 22 },
  disabled: { opacity: 0.4 },
});
