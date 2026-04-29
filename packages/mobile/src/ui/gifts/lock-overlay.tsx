import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface LockOverlayProps {
  unpackDate: string;
  senderName?: string;
}

export function LockOverlay({ unpackDate, senderName }: LockOverlayProps) {
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    const target = new Date(unpackDate).getTime();
    const update = () => {
      setTimeLeftMs(Math.max(0, target - Date.now()));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [unpackDate]);

  const formattedUnlockDate = new Date(unpackDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };

  if (timeLeftMs <= 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Image source={require('../../../assets/logo-7.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.unlockDateText}>
        {senderName ? (
          <Text>
            FROM {senderName.toUpperCase()}
            {'\n'}
          </Text>
        ) : null}
        CAN BE UNPACKED {formattedUnlockDate}
      </Text>

      <Text style={styles.countdownText}>{formatTime(timeLeftMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderRadius: 0,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  unlockDateText: {
    color: 'rgb(43, 42, 44)',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  countdownText: {
    color: 'rgb(43, 42, 44)',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1, // 0.05em * 20
    fontWeight: 'bold',
    lineHeight: 20, // leading-none
    marginTop: 4,
  },
});
