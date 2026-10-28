import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { RADIUS, SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ScreenHeader } from '../components/ui';
import { headingFromMagnetometer, cardinalFromHeading } from '../services/tools';
import { t } from '../services/i18n';

export default function CompassScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [heading, setHeading] = useState<number | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let active = true;
    (async () => {
      try {
        const ok = await Magnetometer.isAvailableAsync();
        if (!active) return;
        if (!ok) {
          setAvailable(false);
          return;
        }
        Magnetometer.setUpdateInterval(200);
        sub = Magnetometer.addListener((reading) => {
          setHeading(headingFromMagnetometer({ x: reading.x, y: reading.y, z: reading.z }));
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

  const cardinal = heading === null ? '--' : cardinalFromHeading(heading);

  // Shrink the dial on short (landscape) screens so nothing clips.
  const { height: windowHeight } = useWindowDimensions();
  const dialSize = Math.min(260, Math.max(150, Math.floor(windowHeight * 0.5)));

  return (
    <View style={s.root}>
      <ScreenHeader title={t('compass')} onBack={goBack} backLabel={t('back')} />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {!available ? (
          <View style={s.unavail}>
            <Text style={s.unavailText}>{t('sensorUnavailable')}</Text>
          </View>
        ) : (
          <>
            <View style={[s.dial, { width: dialSize, height: dialSize, borderRadius: dialSize / 2 }]}>
              <View style={[s.needleWrap, { transform: [{ rotate: `${360 - (heading ?? 0)}deg` }] }]}>
                <Text style={s.needleNorth}>▲ N</Text>
              </View>
              <View style={s.center}>
                <Text style={s.degrees}>{heading === null ? '…' : `${Math.round(heading)}°`}</Text>
                <Text style={s.cardinal}>{cardinal}</Text>
              </View>
            </View>
            <Text style={s.cal}>{t('calibrating')}</Text>
          </>
        )}
      </ScrollView>
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
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    dial: {
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: c.cardBgSolid,
      borderWidth: 2,
      borderColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    needleWrap: {
      position: 'absolute',
      top: 12,
      alignItems: 'center',
    },
    needleNorth: {
      ...TYPOGRAPHY.heading,
      color: c.negative,
    },
    center: {
      alignItems: 'center',
    },
    degrees: {
      ...TYPOGRAPHY.display,
      color: c.text,
    },
    cardinal: {
      ...TYPOGRAPHY.title,
      color: c.primary,
      marginTop: 4,
    },
    cal: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
      marginTop: SPACING.xl,
      textAlign: 'center',
    },
    unavail: {
      padding: SPACING.xl,
      borderRadius: RADIUS.lg,
      backgroundColor: c.cardBgSolid,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    unavailText: {
      ...TYPOGRAPHY.body,
      color: c.text,
      textAlign: 'center',
    },
  });
