import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ScreenHeader } from '../components/ui';
import { tiltFromAccelerometer, isLevel, type Tilt } from '../services/tools';
import { t } from '../services/i18n';

const BUBBLE_RANGE_PX = 90;

export default function LevelScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let active = true;
    (async () => {
      try {
        const ok = await Accelerometer.isAvailableAsync();
        if (!active) return;
        if (!ok) {
          setAvailable(false);
          return;
        }
        Accelerometer.setUpdateInterval(150);
        sub = Accelerometer.addListener((reading) => {
          setTilt(tiltFromAccelerometer({ x: reading.x, y: reading.y, z: reading.z }));
        });
      } catch (e) {
        if (active) setAvailable(false);
      }
    })();
    return () => {
      active = false;
      try {
        sub?.remove();
      } catch (e) {}
    };
  }, []);

  const level = tilt !== null && isLevel(tilt);
  const dx = tilt ? (tilt.pitch / 45) * BUBBLE_RANGE_PX : 0;
  const dy = tilt ? (tilt.roll / 45) * BUBBLE_RANGE_PX : 0;

  return (
    <View style={s.root}>
      <ScreenHeader title={t('level')} subtitle={t('levelHint')} onBack={goBack} backLabel={t('back')} />
      <View style={s.body}>
        {!available || tilt === null ? (
          <Text style={s.msg}>{available ? t('loading') : t('sensorUnavailable')}</Text>
        ) : (
          <>
            <View style={[s.pad, level && s.padLevel]}>
              <View style={s.ring} />
              <View style={[s.bubble, { transform: [{ translateX: dx }, { translateY: dy }] }]} />
            </View>
            <Text style={[s.readout, level && s.readoutLevel]}>
              {level ? t('levelFlat') : `${tilt.deviation.toFixed(1)}°`}
            </Text>
            <Text style={s.detail}>
              {tilt.pitch.toFixed(1)}° / {tilt.roll.toFixed(1)}°
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    msg: {
      ...TYPOGRAPHY.body,
      color: c.textMuted,
    },
    pad: {
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: c.cardBgSolid,
      borderWidth: 2,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    padLevel: {
      borderColor: c.positive,
      backgroundColor: c.positiveBg,
    },
    ring: {
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: c.textMuted,
    },
    bubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.primary,
    },
    readout: {
      ...TYPOGRAPHY.display,
      color: c.text,
      marginTop: SPACING.xl,
    },
    readoutLevel: {
      color: c.positive,
    },
    detail: {
      ...TYPOGRAPHY.body,
      color: c.textMuted,
      marginTop: SPACING.sm,
    },
  });
