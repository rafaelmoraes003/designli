import { COLORS } from '@/app/CONSTS';
import { getToken, removeToken } from '@/app/services/auth.service';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Text } from '../components/Text';

const BASE_URL = 'https://designli-production.up.railway.app';

const MUTED = '#4A4A6A';
const SURFACE = '#12121A';
const BORDER = '#1E1E2E';
const TEXT = '#E8E8F0';

// ─── Types ───────────────────────────────────────────────

interface Stock {
    symbol: string;
    description: string;
    type: string;
}

interface Quote {
    c: number;
    h: number;
    l: number;
    o: number;
    pc: number;
}

interface Alert {
    _id: string;
    symbol: string;
    targetPrice: number;
    triggered: boolean;
    createdAt: string;
}

// ─── Quote Bar ───────────────────────────────────────────

function QuoteBar({ label, value, max }: { label: string; value: number; max: number }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <View style={chart.row}>
            <Text style={chart.label}>{label}</Text>
            <View style={chart.track}>
                <View style={[chart.fill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={chart.value}>${value.toFixed(2)}</Text>
        </View>
    );
}

// ─── Stock Modal ─────────────────────────────────────────

function StockModal({ stock, onClose }: { stock: Stock; onClose: () => void }) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${BASE_URL}/finnhub/quote/${stock.symbol}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setQuote(data);
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load quote' });
            } finally {
                setLoading(false);
            }
        })();
    }, [stock.symbol]);

    const max = quote ? Math.max(quote.h, quote.o, quote.pc) * 1.05 : 1;
    const change = quote ? quote.c - quote.pc : 0;
    const changePct = quote ? (change / quote.pc) * 100 : 0;
    const positive = change >= 0;

    return (
        <Modal visible animationType="slide" transparent onRequestClose={onClose}>
            <View style={modal.overlay}>
                <View style={modal.sheet}>
                    <View style={modal.handle} />
                    <View style={modal.header}>
                        <View>
                            <Text style={modal.eyebrow}>DESIGNLI / STOCKS</Text>
                            <Text style={modal.symbol}>{stock.symbol}</Text>
                            <Text style={modal.desc} numberOfLines={1}>{stock.description}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
                            <Text style={modal.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={COLORS.MAIN_GREEN} style={{ marginTop: 40 }} />
                    ) : quote ? (
                        <View style={modal.body}>
                            <View style={modal.priceRow}>
                                <Text style={modal.price}>${quote.c.toFixed(2)}</Text>
                                <Text style={[modal.change, positive ? modal.positive : modal.negative]}>
                                    {positive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                                </Text>
                            </View>
                            <Text style={modal.chartTitle}>// today's range</Text>
                            <View style={chart.container}>
                                <QuoteBar label="OPEN " value={quote.o} max={max} />
                                <QuoteBar label="HIGH " value={quote.h} max={max} />
                                <QuoteBar label="CURR " value={quote.c} max={max} />
                                <QuoteBar label="LOW  " value={quote.l} max={max} />
                                <QuoteBar label="PREV " value={quote.pc} max={max} />
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

// ─── Stocks Tab ──────────────────────────────────────────

function StocksTab() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [filtered, setFiltered] = useState<Stock[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Stock | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${BASE_URL}/finnhub/stocks`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setStocks(data);
                setFiltered(data.slice(0, 50));
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load stocks' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSearch = useCallback((text: string) => {
        setSearch(text);
        if (!text) {
            setFiltered(stocks.slice(0, 50));
            return;
        }
        const q = text.toUpperCase();
        setFiltered(
            stocks
                .filter((s) => s.symbol.includes(q) || s.description.toUpperCase().includes(q))
                .slice(0, 50)
        );
    }, [stocks]);

    const renderItem = useCallback(({ item }: { item: Stock }) => (
        <TouchableOpacity style={styles.item} onPress={() => setSelected(item)} activeOpacity={0.7}>
            <View style={styles.itemLeft}>
                <Text style={styles.itemSymbol}>{item.symbol}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>
    ), []);

    return (
        <View style={styles.tab}>
            <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={handleSearch}
                    placeholder="search symbol or name..."
                    placeholderTextColor={MUTED}
                    autoCapitalize="characters"
                />
                {search ? (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Text style={styles.clearBtn}>✕</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.MAIN_GREEN} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.symbol}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
            )}

            {selected && <StockModal stock={selected} onClose={() => setSelected(null)} />}
        </View>
    );
}

// ─── Alerts Tab ──────────────────────────────────────────

function AlertsTab() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [symbol, setSymbol] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchAlerts = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/alerts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setAlerts(data);
        } catch {
            Toast.show({ type: 'error', text1: 'Failed to load alerts' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const handleCreate = async () => {
        if (!symbol || !targetPrice) {
            Toast.show({ type: 'error', text1: 'Fill all fields' });
            return;
        }

        setCreating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ symbol: symbol.toUpperCase(), targetPrice: Number(targetPrice) }),
            });

            if (!res.ok) {
                const data = await res.json();
                Toast.show({ type: 'error', text1: 'Error', text2: data.message });
                return;
            }

            Toast.show({ type: 'success', text1: 'Alert created!' });
            setSymbol('');
            setTargetPrice('');
            setShowForm(false);
            fetchAlerts();
        } catch {
            Toast.show({ type: 'error', text1: 'Connection error' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = await getToken();
            await fetch(`${BASE_URL}/alerts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            Toast.show({ type: 'success', text1: 'Alert removed' });
            fetchAlerts();
        } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete alert' });
        }
    };

    return (
        <View style={styles.tab}>
            {showForm && (
                <View style={alertStyles.form}>
                    <Text style={alertStyles.formTitle}>// new alert</Text>
                    <View style={alertStyles.row}>
                        <TextInput
                            style={[alertStyles.input, { flex: 1 }]}
                            value={symbol}
                            onChangeText={setSymbol}
                            placeholder="SYMBOL"
                            placeholderTextColor={MUTED}
                            autoCapitalize="characters"
                        />
                        <TextInput
                            style={[alertStyles.input, { flex: 1 }]}
                            value={targetPrice}
                            onChangeText={setTargetPrice}
                            placeholder="target price"
                            placeholderTextColor={MUTED}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={alertStyles.row}>
                        <TouchableOpacity
                            style={alertStyles.cancelBtn}
                            onPress={() => setShowForm(false)}
                        >
                            <Text style={alertStyles.cancelText}>cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={alertStyles.createBtn}
                            onPress={handleCreate}
                            disabled={creating}
                        >
                            {creating
                                ? <ActivityIndicator color={COLORS.MAIN_DARK} />
                                : <Text style={alertStyles.createText}>create</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!showForm && (
                <TouchableOpacity style={alertStyles.addBtn} onPress={() => setShowForm(true)}>
                    <Text style={alertStyles.addText}>+ new alert</Text>
                </TouchableOpacity>
            )}

            {loading ? (
                <ActivityIndicator color={COLORS.MAIN_GREEN} style={{ marginTop: 40 }} />
            ) : alerts.length === 0 ? (
                <View style={alertStyles.empty}>
                    <Text style={alertStyles.emptyTitle}>no alerts yet</Text>
                    <Text style={alertStyles.emptySubtitle}>create one to get notified when a stock hits your target</Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={alertStyles.alertItem}>
                            <View style={alertStyles.alertLeft}>
                                <View style={alertStyles.alertHeader}>
                                    <Text style={alertStyles.alertSymbol}>{item.symbol}</Text>
                                    <View style={[alertStyles.badge, item.triggered ? alertStyles.badgeTriggered : alertStyles.badgePending]}>
                                        <Text style={alertStyles.badgeText}>
                                            {item.triggered ? 'triggered' : 'pending'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={alertStyles.alertPrice}>target: ${item.targetPrice.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item._id)} style={alertStyles.deleteBtn}>
                                <Text style={alertStyles.deleteText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

// ─── Profile Tab ─────────────────────────────────────────

function ProfileTab() {
    const router = useRouter();

    const handleLogout = async () => {
        await removeToken();
        router.replace('/screens/Login');
    };

    return (
        <View style={[styles.tab, profileStyles.container]}>
            <Text style={styles.eyebrow}>DESIGNLI</Text>
            <Text style={profileStyles.title}>profile</Text>

            <View style={profileStyles.divider} />

            <TouchableOpacity style={profileStyles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={profileStyles.logoutText}>logout</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Home ────────────────────────────────────────────────

const TABS = ['stocks', 'alerts', 'profile'];

export default function Home() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.eyebrow}>DESIGNLI</Text>
                <Text style={styles.title}>{TABS[activeTab]}</Text>
            </View>

            <View style={{ flex: 1 }}>
                {activeTab === 0 && <StocksTab />}
                {activeTab === 1 && <AlertsTab />}
                {activeTab === 2 && <ProfileTab />}
            </View>

            <View style={tabBar.container}>
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={tab}
                        style={tabBar.item}
                        onPress={() => setActiveTab(index)}
                        activeOpacity={0.7}
                    >
                        <Text style={[tabBar.label, activeTab === index && tabBar.labelActive]}>
                            {tab}
                        </Text>
                        {activeTab === index && <View style={tabBar.dot} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.MAIN_DARK,
        paddingTop: 56,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    eyebrow: {
        fontSize: 11,
        color: COLORS.MAIN_GREEN,
        letterSpacing: 6,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        color: TEXT,
        letterSpacing: -0.5,
    },
    tab: {
        flex: 1,
        paddingHorizontal: 24,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SURFACE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchIcon: {
        fontSize: 18,
        color: MUTED,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: TEXT,
        fontFamily: 'JetBrainsMono',
        paddingVertical: 12,
    },
    clearBtn: {
        fontSize: 12,
        color: MUTED,
        padding: 4,
    },
    list: {
        paddingBottom: 32,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    itemLeft: {
        flex: 1,
    },
    itemSymbol: {
        fontSize: 14,
        color: COLORS.MAIN_GREEN,
        marginBottom: 2,
    },
    itemDesc: {
        fontSize: 11,
        color: MUTED,
    },
    itemArrow: {
        fontSize: 20,
        color: MUTED,
    },
    separator: {
        height: 1,
        backgroundColor: BORDER,
    },
});

const tabBar = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: BORDER,
        backgroundColor: SURFACE,
        paddingBottom: 24,
        paddingTop: 12,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    label: {
        fontSize: 11,
        color: MUTED,
        letterSpacing: 2,
    },
    labelActive: {
        color: COLORS.MAIN_GREEN,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.MAIN_GREEN,
    },
});

const alertStyles = StyleSheet.create({
    addBtn: {
        borderWidth: 1,
        borderColor: COLORS.MAIN_GREEN,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    addText: {
        fontSize: 13,
        color: COLORS.MAIN_GREEN,
        letterSpacing: 1,
    },
    form: {
        backgroundColor: SURFACE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },
    formTitle: {
        fontSize: 11,
        color: MUTED,
        letterSpacing: 2,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        backgroundColor: COLORS.MAIN_DARK,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: TEXT,
        fontFamily: 'JetBrainsMono',
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 13,
        color: MUTED,
    },
    createBtn: {
        flex: 1,
        backgroundColor: COLORS.MAIN_GREEN,
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
    },
    createText: {
        fontSize: 13,
        color: COLORS.MAIN_DARK,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        color: MUTED,
    },
    emptySubtitle: {
        fontSize: 12,
        color: MUTED,
        textAlign: 'center',
        lineHeight: 18,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    alertLeft: {
        flex: 1,
        gap: 4,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alertSymbol: {
        fontSize: 14,
        color: COLORS.MAIN_GREEN,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgePending: {
        backgroundColor: '#1E1E2E',
    },
    badgeTriggered: {
        backgroundColor: '#00FF9420',
    },
    badgeText: {
        fontSize: 10,
        color: MUTED,
        letterSpacing: 1,
    },
    alertPrice: {
        fontSize: 11,
        color: MUTED,
    },
    deleteBtn: {
        padding: 8,
    },
    deleteText: {
        fontSize: 14,
        color: MUTED,
    },
});

const profileStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        color: TEXT,
        letterSpacing: -0.5,
        marginBottom: 32,
    },
    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginBottom: 32,
    },
    logoutBtn: {
        borderWidth: 1,
        borderColor: '#FF4566',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        color: '#FF4566',
        letterSpacing: 1,
    },
});

const modal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: SURFACE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: BORDER,
        padding: 24,
        paddingBottom: 48,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: BORDER,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    eyebrow: {
        fontSize: 10,
        color: MUTED,
        letterSpacing: 3,
        marginBottom: 4,
    },
    symbol: {
        fontSize: 24,
        color: TEXT,
        marginBottom: 2,
    },
    desc: {
        fontSize: 12,
        color: MUTED,
        maxWidth: 260,
    },
    closeBtn: {
        padding: 4,
    },
    closeText: {
        fontSize: 16,
        color: MUTED,
    },
    body: {
        gap: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
    },
    price: {
        fontSize: 32,
        color: TEXT,
    },
    change: {
        fontSize: 14,
    },
    positive: {
        color: COLORS.MAIN_GREEN,
    },
    negative: {
        color: '#FF4566',
    },
    chartTitle: {
        fontSize: 11,
        color: MUTED,
        letterSpacing: 2,
    },
});

const chart = StyleSheet.create({
    container: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 10,
        color: MUTED,
        width: 40,
        letterSpacing: 1,
    },
    track: {
        flex: 1,
        height: 4,
        backgroundColor: BORDER,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: COLORS.MAIN_GREEN,
        borderRadius: 2,
    },
    value: {
        fontSize: 11,
        color: TEXT,
        width: 70,
        textAlign: 'right',
    },
});