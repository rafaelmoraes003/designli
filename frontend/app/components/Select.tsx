import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';

const COLORS = {
    bg: '#0A0A0F',
    surface: '#12121A',
    border: '#1E1E2E',
    borderFocus: '#00FF94',
    accent: '#00FF94',
    textPrimary: '#E8E8F0',
    textMuted: '#4A4A6A',
    itemHover: '#1A1A2E',
};

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

export function Select({ label, options, value, onChange, error }: SelectProps) {
    const [open, setOpen] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const selected = options.find((o) => o.value === value);

    const handleOpen = () => {
        setOpen(true);
        bottomSheetRef.current?.expand();
    };

    const handleSelect = (option: Option) => {
        onChange(option.value);
        bottomSheetRef.current?.close();
        setOpen(false);
    };

    const handleClose = useCallback(() => setOpen(false), []);

    return (
        <>
            <View style={styles.wrapper}>
                <TouchableOpacity
                    style={[
                        styles.trigger,
                        open && styles.triggerOpen,
                        error ? styles.triggerError : null,
                    ]}
                    onPress={handleOpen}
                    activeOpacity={0.8}
                >
                    <Text style={styles.triggerLabel}>{label}</Text>
                    <Text style={selected ? styles.triggerValue : styles.triggerPlaceholder}>
                        {selected ? selected.label : 'select...'}
                    </Text>
                    <Text style={[styles.arrow, open && styles.arrowOpen]}>›</Text>
                </TouchableOpacity>
                {error ? <Text style={styles.error}>⚠ {error}</Text> : null}
            </View>

            {open && (
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={['40%', '60%']}
                    onClose={handleClose}
                    enablePanDownToClose
                    backgroundStyle={styles.sheet}
                    handleIndicatorStyle={styles.handle}
                >
                    <BottomSheetView style={styles.sheetContent}>
                        <Text style={styles.sheetTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.value === value && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {item.value === value ? '✓ ' : '○ '}
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </BottomSheetView>
                </BottomSheet>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 8,
    },
    trigger: {
        borderWidth: 1,
        borderColor: '#1E1E2E',
        borderRadius: 8,
        backgroundColor: '#12121A',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    triggerOpen: {
        borderColor: '#00FF94',
        backgroundColor: '#00FF9420',
    },
    triggerError: {
        borderColor: '#FF4566',
        backgroundColor: '#FF456620',
    },
    triggerLabel: {
        fontSize: 11,
        color: '#4A4A6A',
        marginRight: 8,
    },
    triggerValue: {
        flex: 1,
        fontSize: 15,
        color: '#E8E8F0',
    },
    triggerPlaceholder: {
        flex: 1,
        fontSize: 15,
        color: '#4A4A6A',
    },
    arrow: {
        fontSize: 20,
        color: '#4A4A6A',
        transform: [{ rotate: '90deg' }],
    },
    arrowOpen: {
        color: '#00FF94',
        transform: [{ rotate: '-90deg' }],
    },
    error: {
        fontSize: 11,
        color: '#FF4566',
        marginTop: 4,
        marginLeft: 4,
    },
    sheet: {
        backgroundColor: '#12121A',
        borderTopWidth: 1,
        borderTopColor: '#1E1E2E',
    },
    handle: {
        backgroundColor: '#4A4A6A',
    },
    sheetContent: {
        padding: 24,
    },
    sheetTitle: {
        fontSize: 11,
        color: '#00FF94',
        letterSpacing: 4,
        marginBottom: 16,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginBottom: 2,
    },
    optionSelected: {
        backgroundColor: '#00FF9420',
    },
    optionText: {
        fontSize: 14,
        color: '#4A4A6A',
    },
    optionTextSelected: {
        color: '#00FF94',
    },
});