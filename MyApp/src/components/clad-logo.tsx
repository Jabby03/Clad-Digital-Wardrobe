import { Image, StyleSheet } from 'react-native';

const logo = require('@/assets/branding/clad-logo.png');

export default function CladLogo({ size }: { size?: number }) {
  return (
    <Image
      source={logo}
      accessibilityLabel="CLAD logo"
      resizeMode="cover"
      style={[styles.logo, size !== undefined && { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
});
