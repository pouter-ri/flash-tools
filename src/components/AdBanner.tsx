import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { resolveAdUnitId } from '../services/ads';

const BANNER_UNIT_ID =
  Platform.OS === 'ios'
    ? TestIds.BANNER
    : resolveAdUnitId(process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID, TestIds.BANNER);

/** Persistent anchored banner for the Home screen. Test ads until real IDs land in .env. */
export default function AdBanner() {
  return (
    <View style={s.wrap} testID="ad-banner">
      <BannerAd unitId={BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'flex-end' },
});
