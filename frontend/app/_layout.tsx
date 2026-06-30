import { JetBrainsMono_400Regular, useFonts } from '@expo-google-fonts/jetbrains-mono';
import messaging from '@react-native-firebase/messaging';
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { COLORS } from "./CONSTS";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title,
        text2: remoteMessage.notification?.body,
      });
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.GREEN_DARK }}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}