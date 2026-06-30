import { COLORS } from '@/app/CONSTS';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Input } from '../components/Input';
import { Text } from '../components/Text';
import { saveToken } from '../services/auth.service';
import { registerFcmToken } from '../services/fcm.service';

export default function SignUpScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ name?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const passwordRules = [
        { label: 'uppercase', met: /[A-Z]/.test(password) },
        { label: 'lowercase', met: /[a-z]/.test(password) },
        { label: 'number', met: /\d/.test(password) },
        { label: 'symbol', met: /[\W_]/.test(password) },
    ];

    const validate = () => {
        const newErrors: { name?: string; password?: string } = {};

        if (name.length < 5) {
            newErrors.name = 'At least 5 characters required';
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = 'Needs uppercase, lowercase, number & symbol';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch('https://designli-production.up.railway.app/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data.message || 'Something went wrong',
                });
                return;
            }

            const loginResponse = await fetch('https://designli-production.up.railway.app/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            const loginData = await loginResponse.json();
            await saveToken(loginData.token);
            await registerFcmToken();

            Toast.show({
                type: 'success',
                text1: 'Account created!',
                text2: 'Welcome to Designli',
            });

            router.push('/screens/Home');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Connection error',
                text2: 'Could not connect to server',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>DESIGNLI</Text>
                    <Text style={styles.title}>create account</Text>
                    <Text style={styles.subtitle}>
                        Track stocks. Get notified. Stay ahead.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="username"
                        value={name}
                        onChangeText={(t: string) => {
                            setName(t);
                            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                        }}
                        error={errors.name}
                    />

                    <Input
                        label="password"
                        value={password}
                        onChangeText={(t: string) => {
                            setPassword(t);
                            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                        }}
                        secureTextEntry
                        error={errors.password}
                    />

                    <View style={styles.rules}>
                        {passwordRules.map((rule) => (
                            <Text
                                key={rule.label}
                                style={[styles.rule, rule.met ? styles.ruleMet : styles.ruleUnmet]}
                            >
                                {rule.met ? '✓' : '○'} {rule.label}
                            </Text>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.MAIN_DARK} />
                        ) : (
                            <Text style={styles.buttonText}>save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/screens/Login')}>
                        <Text style={styles.footerLink}>sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: COLORS.MAIN_DARK,
    },
    container: {
        flexGrow: 1,
        padding: 28,
        paddingTop: 72,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
    },
    eyebrow: {
        fontSize: 11,
        color: COLORS.MAIN_GREEN,
        letterSpacing: 6,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        color: '#E8E8F0',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 13,
        color: '#4A4A6A',
        lineHeight: 20,
    },
    form: {
        gap: 8,
    },
    rules: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginBottom: 8,
    },
    rule: {
        fontSize: 11,
        letterSpacing: 0.5,
    },
    ruleMet: {
        color: COLORS.MAIN_GREEN,
    },
    ruleUnmet: {
        color: '#4A4A6A',
    },
    button: {
        backgroundColor: COLORS.MAIN_GREEN,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 14,
        color: COLORS.MAIN_DARK,
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#4A4A6A',
    },
    footerLink: {
        fontSize: 12,
        color: COLORS.MAIN_GREEN,
    },
});