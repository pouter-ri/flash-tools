import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { ToolCard } from '../components/ui';
import { t } from '../services/i18n';

export type ToolRoute = 'Flashlight' | 'Compass' | 'Ruler' | 'Level';

export default function HomeScreen({ navigate }: { navigate: (name: ToolRoute) => void }) {
  const { mode, colors, toggle } = useTheme();
  const s = styles(colors);
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.appName}>{t('appName')}</Text>
        <Text style={s.tagline}>{t('tagline')}</Text>
      </View>
      <ToolCard icon="🔦" title={t('flashlight')} desc={t('flashlightDesc')} onPress={() => navigate('Flashlight')} />
      <ToolCard icon="🧭" title={t('compass')} desc={t('compassDesc')} onPress={() => navigate('Compass')} />
      <ToolCard icon="📏" title={t('ruler')} desc={t('rulerDesc')} onPress={() => navigate('Ruler')} />
      <ToolCard icon="🫧" title={t('level')} desc={t('levelDesc')} onPress={() => navigate('Level')} />
      <Pressable onPress={toggle} accessibilityRole="button" style={s.themeRow}>
        <Text style={s.themeLabel}>{t('theme')}</Text>
        <Text style={s.themeValue}>{mode === 'dark' ? t('darkMode') : t('lightMode')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    content: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xxl,
    },
    hero: {
      marginVertical: SPACING.xl,
    },
    appName: {
      ...TYPOGRAPHY.title,
      color: c.text,
    },
    tagline: {
      ...TYPOGRAPHY.body,
      color: c.textMuted,
      marginTop: 4,
    },
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.cardBgSolid,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.sm,
    },
    themeLabel: {
      ...TYPOGRAPHY.heading,
      color: c.text,
    },
    themeValue: {
      ...TYPOGRAPHY.body,
      color: c.primary,
    },
  });
