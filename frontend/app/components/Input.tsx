// components/Input.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';

const COLORS = {
    bg: '#0A0A0F',
    surface: '#12121A',
    border: '#1E1E2E',
    borderFocus: '#00FF94',
    accent: '#00FF94',
    accentDim: '#00FF9420',
    textPrimary: '#E8E8F0',
    textMuted: '#4A4A6A',
    error: '#FF4566',
    errorDim: '#FF456620',
};

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

export function Input({ label, error, value, onChangeText, ...rest }: InputProps) {
    const [focused, setFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;
    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: focused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();

        Animated.timing(labelAnim, {
            toValue: focused || value ? 1 : 0,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [focused, value]);

    const borderColor = error
        ? COLORS.error
        : borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.border, COLORS.borderFocus],
        });

    const bgColor = error
        ? COLORS.errorDim
        : borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.surface, COLORS.accentDim],
        });

    const labelTop = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 6],
    });

    const labelSize = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 11],
    });

    const labelColor = error ? COLORS.error : focused ? COLORS.accent : COLORS.textMuted;

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.container, { borderColor, backgroundColor: bgColor }]}>
                <Animated.Text
                    style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}
                >
                    {label}
                </Animated.Text>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={styles.input}
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    {...rest}
                />
            </Animated.View>
            {error ? <Text style={styles.error}>⚠ {error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 8,
    },
    container: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 22,
        paddingBottom: 10,
    },
    label: {
        position: 'absolute',
        left: 16,
        fontFamily: 'JetBrainsMono',
    },
    input: {
        fontSize: 15,
        color: '#E8E8F0',
        fontFamily: 'JetBrainsMono',
        padding: 0,
    },
    error: {
        fontSize: 11,
        color: '#FF4566',
        marginTop: 4,
        marginLeft: 4,
    },
});