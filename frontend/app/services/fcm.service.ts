import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { updateFcmToken } from './auth.service';

export async function registerFcmToken() {
    try {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: 'Permission denied', text2: status });
            return;
        }

        const fcmToken = await messaging().getToken();

        if (fcmToken) {
            await updateFcmToken(fcmToken);
            Toast.show({ type: 'success', text1: 'FCM Token saved', text2: fcmToken.substring(0, 30) + '...' });
        } else {
            Toast.show({ type: 'error', text1: 'FCM Token null', text2: 'messaging().getToken() returned null' });
        }
    } catch (error: any) {
        Toast.show({ type: 'error', text1: 'FCM Error', text2: error.message });
    }
}