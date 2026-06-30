import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://designli-production.up.railway.app';

export async function saveToken(token: string) {
    await AsyncStorage.setItem('jwt_token', token);
}

export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem('jwt_token');
}

export async function removeToken() {
    await AsyncStorage.removeItem('jwt_token');
}

export async function updateFcmToken(fcmToken: string) {
    const token = await getToken();
    if (!token) return;

    await fetch(`${BASE_URL}/users/fcm-token`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fcmToken }),
    });
}