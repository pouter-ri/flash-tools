import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { RADIUS, SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ScreenHeader } from '../components/ui';
import { t } from '../services/i18n';

export default function FlashlightScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [on, setOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const granted = permission?.granted === true;

  // Real torch when the camera is available; otherwise the full-screen
  // white fallback below still gives light.
  const useTorch = granted && on;

  return (
    <View style={s.root}>
      <ScreenHeader title={t('flashlight')} onBack={goBack} backLabel={t('back')} />
      {useTorch ? <CameraView style={s.camera} enableTorch={true} facing="back" /> : null}
      <Pressable
        onPress={() => setOn((v) => !v)}
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        accessibilityLabel={on ? t('tapToTurnOff') : t('tapToTurnOn')}
        style={[s.light, on ? s.lightOn : s.lightOff]}
      >
        <Text style={on ? s.bulbOn : s.bulb}>🔦</Text>
        <Text style={on ? s.stateOn : s.state}>{on ? t('torchOn') : t('torchOff')}</Text>
        <Text style={on ? s.hintOn : s.hint}>{on ? t('tapToTurnOff') : t('tapToTurnOn')}</Text>
      </Pressable>
      {!granted ? (
        <View style={s.permBox}>
          <Text style={s.permText}>{t('cameraPermissionNeeded')}</Text>
          <Pressable onPress={requestPermission} style={s.permBtn} accessibilityRole="button">
            <Text style={s.permBtnText}>{t('allowCamera')}</Text>
          </Pressable>
        </View>
      ) : null}
      {!granted && on ? (
        <View style={s.fallbackNote}>
          <Text style={s.fallbackText}>{t('screenLightNote')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    camera: {
      width: 2,
      height: 2,
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: 0,
    },
    light: {
      flex: 1,
      margin: SPACING.lg,
      borderRadius: RADIUS.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    lightOn: {
      // Full-bright white screen = fallback light source, legible in both themes.
      backgroundColor: '#ffffff',
      borderColor: '#ffffff',
    },
    lightOff: {
      backgroundColor: c.cardBgSolid,
      borderColor: c.cardBorder,
    },
    bulb: {
      fontSize: 72,
      opacity: 0.45,
    },
    bulbOn: {
      fontSize: 72,
    },
    state: {
      ...TYPOGRAPHY.title,
      color: c.text,
      marginTop: SPACING.lg,
    },
    stateOn: {
      ...TYPOGRAPHY.title,
      color: '#111111',
      marginTop: SPACING.lg,
    },
    hint: {
      ...TYPOGRAPHY.body,
      color: c.textMuted,
      marginTop: SPACING.sm,
    },
    hintOn: {
      ...TYPOGRAPHY.body,
      color: '#555555',
      marginTop: SPACING.sm,
    },
    permBox: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      backgroundColor: c.warningGlow,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    permText: {
      ...TYPOGRAPHY.body,
      color: c.text,
      marginBottom: SPACING.md,
    },
    permBtn: {
      backgroundColor: c.primary,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
    },
    permBtnText: {
      ...TYPOGRAPHY.heading,
      color: c.onPrimary,
    },
    fallbackNote: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      alignItems: 'center',
    },
    fallbackText: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
    },
  });
