import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="filter" options={{ presentation: 'modal', headerShown: true, title: 'Filters', headerTitleAlign: 'center', headerShadowVisible: false }} />
        <Stack.Screen name="book-professional" options={{ headerShown: false }} />
        <Stack.Screen name="booking-address-details" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
