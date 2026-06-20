import React, { useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';

import CounterButton from '../../components/CounterButton';

const RESET_VALUE = 100;
const MAX_HISTORY = 20;

export default function HomeScreen() {
  const [count, setCount] = useState(RESET_VALUE);
  const [statMin, setStatMin] = useState(RESET_VALUE);
  const [statMax, setStatMax] = useState(RESET_VALUE);
  const [changes, setChanges] = useState(0);
  const [history, setHistory] = useState<number[]>([RESET_VALUE]);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const addInterval = useRef<any>(null);
  const minusInterval = useRef<any>(null);
  const toastTimer = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [toastOpacity]);

  const bumpAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const updateCount = useCallback((updater: (prev: number) => number) => {
    setCount(prev => {
      const next = updater(prev);
      setStatMin(m => Math.min(m, next));
      setStatMax(m => Math.max(m, next));
      setChanges(c => c + 1);
      setHistory(h => {
        const updated = [...h, next];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });
      bumpAnimation();
      return next;
    });
  }, [bumpAnimation]);

  // Add
  const addCount = () => updateCount(prev => prev + 1);
  const startAdding = () => {
    showToast('Holding add...');
    addInterval.current = setInterval(() => updateCount(prev => prev + 1), 80);
  };
  const stopAdding = () => {
    if (addInterval.current) clearInterval(addInterval.current);
  };

  // Minus
  const minusCount = () => updateCount(prev => prev - 1);
  const startMinus = () => {
    showToast('Holding minus...');
    minusInterval.current = setInterval(() => updateCount(prev => prev - 1), 80);
  };
  const stopMinus = () => {
    if (minusInterval.current) clearInterval(minusInterval.current);
  };

  // Reset
  const resetCount = () => {
    setCount(RESET_VALUE);
    setStatMin(RESET_VALUE);
    setStatMax(RESET_VALUE);
    setChanges(0);
    setHistory([RESET_VALUE]);
    bumpAnimation();
    showToast('Reset to 100');
  };

  const countColor =
    count > 0 ? '#00E5A8' : count < 0 ? '#ff6b6b' : '#B8B8D1';

  // Progress bar: maps -200..200 → 0..100%
  const progressPct = Math.min(100, Math.max(0, ((count + 200) / 400) * 100));
  const progressColor = count >= 0 ? '#00E5A8' : '#ff6b6b';

  // Sparkline
  const histMin = Math.min(...history);
  const histMax = Math.max(...history);
  const histRange = Math.max(1, histMax - histMin);
  const BAR_MAX_H = 28;

  return (
    <View style={styles.maincontainer}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.parentTitle}>Counter Display</Text>

        {/* State Locker */}
        <View style={styles.stateLocker}>

          {/* Toast */}
          <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
            <Text style={styles.toastText}>{toast}</Text>
          </Animated.View>

          <Text style={styles.stateTitle}>STATE LOCKER</Text>

          <Animated.Text
            style={[styles.stateValue, { color: countColor, transform: [{ scale: scaleAnim }] }]}
          >
            {count}
          </Animated.Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct}%` as any, backgroundColor: progressColor },
              ]}
            />
          </View>

          {/* Mini stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>MIN</Text>
              <Text style={styles.statValue}>{statMin}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>MAX</Text>
              <Text style={styles.statValue}>{statMax}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>CHANGES</Text>
              <Text style={styles.statValue}>{changes}</Text>
            </View>
          </View>

          {/* Sparkline */}
          {history.length > 1 && (
            <View style={styles.sparkline}>
              {history.map((v, i) => {
                const h = Math.max(3, Math.round(((v - histMin) / histRange) * BAR_MAX_H));
                const barColor =
                  v >= RESET_VALUE ? '#00E5A8' : v < 0 ? '#ff6b6b' : '#B8B8D1';
                return (
                  <View
                    key={i}
                    style={[
                      styles.sparkBar,
                      { height: h, backgroundColor: barColor, opacity: 0.7 },
                    ]}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Counter Controls</Text>

          <CounterButton
            title="➕  Add Count"
            backgroundColor="#4a7c18"
            onPress={addCount}
            onLongPress={startAdding}
            onPressOut={stopAdding}
          />

          <CounterButton
            title="➖  Minus Count"
            backgroundColor="#1a6b3a"
            onPress={minusCount}
            onLongPress={startMinus}
            onPressOut={stopMinus}
          />

          <CounterButton
            title="🔄  Reset Count"
            backgroundColor="#555"
            onPress={resetCount}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },

  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },

  parentTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },

  stateLocker: {
    backgroundColor: '#2A2D3E',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#3a3d55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 25,
    overflow: 'hidden',
  },

  toast: {
    position: 'absolute',
    top: 12,
    right: 14,
    backgroundColor: '#3a3d55',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  toastText: {
    color: '#B8B8D1',
    fontSize: 12,
  },

  stateTitle: {
    color: '#B8B8D1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },

  stateValue: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 88,
  },

  progressTrack: {
    height: 4,
    backgroundColor: '#3a3d55',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 14,
    marginHorizontal: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statLabel: {
    color: '#6b6e8a',
    fontSize: 10,
    letterSpacing: 1,
  },
  statValue: {
    color: '#B8B8D1',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
  },

  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 32,
    marginTop: 14,
    gap: 3,
  },
  sparkBar: {
    width: 10,
    borderRadius: 3,
    minHeight: 3,
  },

  card: {
    backgroundColor: '#2A2D3E',
    borderRadius: 20,
    padding: 25,
    borderWidth: 0.5,
    borderColor: '#3a3d55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
});