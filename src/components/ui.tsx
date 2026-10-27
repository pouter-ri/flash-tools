import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const s = styles(colors);
  return (
    <View style={s.wrap}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} style={s.back}>
        <Text style={s.backText}>{'‹'} {backLabel}</Text>
      </Pressable>
      <View style={s.titles}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const styles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
      backgroundColor: c.headerBg,
    },
    back: {
      paddingVertical: SPACING.sm,
      paddingRight: SPACING.md,
      minWidth: 88,
      minHeight: 44,
      justifyContent: 'center',
    },
    backText: {
      ...TYPOGRAPHY.body,
      color: c.primary,
    },
    titles: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...TYPOGRAPHY.heading,
      color: c.text,
    },
    subtitle: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
      marginTop: 2,
    },
    right: {
      minWidth: 88,
      alignItems: 'flex-end',
    },
  });

export function ToolCard({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const s = cardStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [s.card, pressed && s.pressed]}
    >
      <View style={s.iconWrap}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <View style={s.texts}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{desc}</Text>
      </View>
      <Text style={s.chev}>{'›'}</Text>
    </Pressable>
  );
}

const cardStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.cardBgSolid,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
    },
    pressed: {
      borderColor: c.cardBorderHover,
      backgroundColor: c.surfaceAlt,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: RADIUS.md,
      backgroundColor: c.primaryGlow,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.lg,
    },
    icon: {
      fontSize: 26,
    },
    texts: {
      flex: 1,
    },
    title: {
      ...TYPOGRAPHY.heading,
      color: c.text,
    },
    desc: {
      ...TYPOGRAPHY.caption,
      color: c.textMuted,
      marginTop: 2,
    },
    chev: {
      fontSize: 24,
      color: c.textMuted,
      marginLeft: SPACING.sm,
    },
  });
