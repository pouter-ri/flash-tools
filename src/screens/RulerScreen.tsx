import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, PixelRatio, useWindowDimensions } from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ScreenHeader } from '../components/ui';
import { rulerDp, rulerTicks } from '../services/tools';
import { getRulerUnit, setRulerUnit, isSteelUnlocked, type RulerUnit } from '../services/prefs';
import { getExactDpi } from '../services/display';
import { t } from '../services/i18n';
import type { AdHandle } from '../components/AdMobManager';

const STEEL = {
  bg: '#9aa3ad',
  edge: '#6b7280',
  tick: '#1f2937',
  label: '#111827',
  sheen: '#d1d5db',
};

export default function RulerScreen({
  goBack,
  ads,
}: {
  goBack: () => void;
  ads: React.RefObject<AdHandle | null>;
}) {
  const [unit, setUnit] = useState<RulerUnit>('cm');
  const [steel, setSteel] = useState(false);
  const [busy, setBusy] = useState(false);
  const density = PixelRatio.get();
  // Exact panel DPI from the native module (DisplayMetrics.xdpi). Until it
  // resolves, fall back to the nominal density-bucket DPI.
  const [exactDpi, setExactDpi] = useState<number | null>(null);
  const dpi = exactDpi ?? density * 160;
  const { colors } = useTheme();
  const s = styles(colors);

  useEffect(() => {
    let active = true;
    (async () => {
      const [u, st, exact] = await Promise.all([getRulerUnit(), isSteelUnlocked(), getExactDpi()]);
      if (!active) return;
      setUnit(u);
      setSteel(st);
      if (exact) setExactDpi(exact.xdpi);
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleUnit = async () => {
    const next: RulerUnit = unit === 'cm' ? 'inch' : 'cm';
    setUnit(next);
    await setRulerUnit(next);
  };

  const unlock = async () => {
    if (steel || busy) return;
    setBusy(true);
    try {
      const res = await ads.current?.showRewarded();
      if (res?.shown && res?.earned) {
        const { unlockSteel } = await import('../services/prefs');
        await unlockSteel();
        setSteel(true);
      }
    } finally {
      setBusy(false);
    }
  };

  // Re-read on every rotation so the blade always fits the current width.
  const { width: windowWidth } = useWindowDimensions();
  const screenW = windowWidth - SPACING.lg * 2;
  const minor = unit === 'cm' ? 0.1 : 0.0625; // 1mm or 1/16in
  const major = unit === 'cm' ? 1 : 1;
  const maxUnits = unit === 'cm' ? 12 : 5;
  const ticks = rulerTicks(maxUnits, minor, major);
  // Exact physical dpi converted to dp — styles must get dp, not physical px.
  const pxPerUnit = rulerDp(1, unit, dpi, density) || 1;
  const pxPerMinor = pxPerUnit * minor;

  return (
    <View style={s.root}>
      <ScreenHeader
        title={t('ruler')}
        onBack={goBack}
        backLabel={t('back')}
        right={
          <Pressable onPress={toggleUnit} accessibilityRole="button" style={s.unitBtn}>
            <Text style={s.unitText}>{unit === 'cm' ? t('inch') : t('cm')}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal contentContainerStyle={s.scroll} showsHorizontalScrollIndicator={false}>
          <View style={[s.blade, steel ? s.bladeSteel : s.bladePlain, { width: Math.min(screenW, maxUnits * pxPerUnit) }]}>
            {steel ? <View style={s.sheen} /> : null}
            <View style={s.ticks}>
              {ticks.map((tk, i) => (
                <View key={i} style={[s.tickCol, { width: pxPerMinor }]}>
                  <View
                    style={[
                      s.tick,
                      tk.major ? s.tickMajor : s.tickMinor,
                      steel && s.tickSteel,
                    ]}
                  />
                  {tk.major ? <Text style={[s.tickLabel, steel && s.tickLabelSteel]}>{tk.value}</Text> : null}
                </View>
              ))}
            </View>
            <Text style={[s.unitLabel, steel && s.tickLabelSteel]}>
              {unit === 'cm' ? 'cm' : 'inch'}
            </Text>
          </View>
        </ScrollView>
        <View style={s.foot}>
        <View style={s.steelRow}>
          <Text style={s.steelTitle}>{t('steelTheme')}</Text>
          <Text style={s.steelState}>{steel ? t('unlocked') : t('steelLocked')}</Text>
        </View>
        {!steel ? (
          <Pressable
            onPress={unlock}
            disabled={busy}
            accessibilityRole="button"
            style={[s.unlockBtn, busy && s.unlockBusy]}
          >
            <Text style={s.unlockText}>{busy ? t('adLoading') : t('unlock')}</Text>
          </Pressable>
        ) : (
          <Text style={s.thanks}>{t('premiumThanks')}</Text>
        )}
        </View>
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
    },
    unitBtn: {
      backgroundColor: c.primaryGlow,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unitText: {
      ...TYPOGRAPHY.heading,
      color: c.primary,
    },
    scroll: {
      padding: SPACING.lg,
      alignItems: 'center',
    },
    blade: {
      height: 160,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      overflow: 'hidden',
      paddingTop: SPACING.md,
    },
    bladePlain: {
      backgroundColor: c.cardBgSolid,
      borderColor: c.cardBorder,
    },
    bladeSteel: {
      backgroundColor: STEEL.bg,
      borderColor: STEEL.edge,
    },
    sheen: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 44,
      backgroundColor: STEEL.sheen,
      opacity: 0.45,
    },
    ticks: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tickCol: {
      alignItems: 'flex-start',
    },
    tick: {
      width: 2,
    },
    tickMinor: {
      height: 14,
      backgroundColor: c.textMuted,
    },
    tickMajor: {
      height: 30,
      backgroundColor: c.text,
    },
    tickSteel: {
      backgroundColor: STEEL.tick,
    },
    tickLabel: {
      ...TYPOGRAPHY.caption,
      color: c.text,
      marginTop: 2,
    },
    tickLabelSteel: {
      color: STEEL.label,
    },
    unitLabel: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
      position: 'absolute',
      bottom: SPACING.md,
      right: SPACING.md,
    },
    foot: {
      padding: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    steelRow: {
      marginBottom: SPACING.md,
    },
    steelTitle: {
      ...TYPOGRAPHY.heading,
      color: c.text,
    },
    steelState: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
      marginTop: 2,
    },
    unlockBtn: {
      backgroundColor: c.primary,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    unlockBusy: {
      opacity: 0.6,
    },
    unlockText: {
      ...TYPOGRAPHY.heading,
      color: c.onPrimary,
    },
    thanks: {
      ...TYPOGRAPHY.body,
      color: c.positive,
    },
  });
