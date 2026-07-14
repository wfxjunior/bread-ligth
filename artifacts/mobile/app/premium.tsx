/**
 * Bread&Light Premium — mobile paywall.
 *
 * Mirrors the web app's Pricing page (same plan, same feature list, same
 * copy) but as a native modal screen. Purchase/restore are wired through
 * `PremiumContext`, which is currently a stub until the RevenueCat connector
 * is attached — see that file for what changes once it is.
 */
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { usePremium } from '@/context/PremiumContext';

function formatMoney(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const { isPremium, prices, pricesLoading, purchase, restore } = usePremium();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [pending, setPending] = useState(false);

  const monthlyPrice = prices.find(p => p.interval === 'month');
  const yearlyPrice  = prices.find(p => p.interval === 'year');
  const selectedPrice = useMemo(
    () => prices.find(p => p.interval === interval),
    [prices, interval],
  );

  const features = [
    t('premium_feature_atmospheres'),
    t('premium_feature_accents'),
    t('premium_feature_mission'),
    t('premium_feature_early_access'),
    t('premium_feature_priority_support'),
  ];

  const handleClose = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.back();
  };

  const handleSubscribe = async () => {
    if (!selectedPrice || pending) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setPending(true);
    try {
      await purchase(selectedPrice.id);
    } finally {
      setPending(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    await restore();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.backRow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>{t('premium_back')}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '14' }]}>
            <Feather name="award" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>{t('premium_eyebrow').toUpperCase()}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{t('premium_title')}</Text>
        </View>

        {isPremium ? (
          <View style={[styles.alreadyCard, { borderColor: colors.primary + '30', backgroundColor: colors.card }]}>
            <View style={[styles.alreadyIcon, { backgroundColor: colors.primary + '14' }]}>
              <Feather name="check" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.alreadyTitle, { color: colors.foreground }]}>{t('premium_already_title')}</Text>
            <Text style={[styles.alreadySub, { color: colors.mutedForeground }]}>{t('premium_already_sub')}</Text>
          </View>
        ) : (
          <View style={[styles.planCard, { borderColor: colors.primary + '30' }]}>
            {/* Monthly/yearly toggle */}
            <View style={[styles.toggleWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              {(['month', 'year'] as const).map(iv => {
                const active = interval === iv;
                return (
                  <TouchableOpacity
                    key={iv}
                    onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setInterval(iv); }}
                    activeOpacity={0.8}
                    style={[
                      styles.toggleBtn,
                      { backgroundColor: active ? colors.background : 'transparent', borderRadius: colors.radius / 1.6 },
                    ]}
                  >
                    <Text style={[styles.toggleText, { color: active ? colors.primary : colors.mutedForeground }]}>
                      {t(iv === 'month' ? 'premium_billed_monthly' : 'premium_billed_yearly')}
                    </Text>
                    {iv === 'year' && yearlyPrice && (
                      <View style={[styles.saveBadge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.saveBadgeText}>{t('premium_yearly_save_badge')}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.priceBlock}>
              <Text style={[styles.planTitle, { color: colors.foreground }]}>{t('premium_title')}</Text>
              <Text style={[styles.planSubtitle, { color: colors.mutedForeground }]}>{t('premium_subtitle')}</Text>
              {pricesLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
              ) : selectedPrice ? (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceValue, { color: colors.primary }]}>
                    {formatMoney(selectedPrice.unitAmount, selectedPrice.currency, lang === 'pt' ? 'pt-BR' : 'en-US')}
                  </Text>
                  <Text style={[styles.pricePer, { color: colors.mutedForeground }]}>
                    {t(interval === 'month' ? 'premium_per_month' : 'premium_per_year')}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.priceError, { color: colors.mutedForeground }]}>{t('premium_price_error')}</Text>
              )}
            </View>

            <View style={styles.featureList}>
              {features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <View style={[styles.featureCheck, { backgroundColor: colors.accent + '20' }]}>
                    <Feather name="check" size={11} color={colors.accent} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={pending || !selectedPrice}
              activeOpacity={0.85}
              style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: (pending || !selectedPrice) ? 0.7 : 1 }]}
            >
              {pending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Feather name="award" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>{t('premium_trial_cta')}</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>{t('premium_trial_disclaimer')}</Text>
            {monthlyPrice && (
              <Text style={[styles.disclaimerSmall, { color: colors.mutedForeground }]}>
                {formatMoney(monthlyPrice.unitAmount, monthlyPrice.currency, lang === 'pt' ? 'pt-BR' : 'en-US')}{t('premium_per_month')}
              </Text>
            )}

            <Pressable onPress={handleRestore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.restoreBtn}>
              <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>{t('premium_restore')}</Text>
            </Pressable>
          </View>
        )}

        <View style={[styles.freeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.freeTitle, { color: colors.mutedForeground }]}>{t('premium_always_free_title').toUpperCase()}</Text>
          <Text style={[styles.freeDesc, { color: colors.foreground }]}>{t('premium_always_free_desc')}</Text>
          <Text style={[styles.freeNote, { color: colors.mutedForeground }]}>{t('premium_no_card_required')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  backRow:         { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 18, alignSelf: 'flex-start' },
  backText:        { fontSize: 14, fontFamily: 'Inter_500Medium' },
  header:          { alignItems: 'center', marginBottom: 22, gap: 8 },
  iconCircle:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  eyebrow:         { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2 },
  title:           { fontSize: 24, fontFamily: 'Lora_700Bold', textAlign: 'center' },

  alreadyCard:     { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: 28, alignItems: 'center', gap: 6 },
  alreadyIcon:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  alreadyTitle:    { fontSize: 18, fontFamily: 'Lora_700Bold' },
  alreadySub:      { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  planCard:        { borderWidth: 1, borderRadius: 20, padding: 20 },
  toggleWrap:      { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 3, alignSelf: 'center', marginBottom: 18 },
  toggleBtn:       { paddingHorizontal: 18, paddingVertical: 9, position: 'relative' },
  toggleText:      { fontSize: 13.5, fontFamily: 'Inter_600SemiBold' },
  saveBadge:       { position: 'absolute', top: -9, right: -8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  saveBadgeText:   { fontSize: 8.5, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.3 },

  priceBlock:      { alignItems: 'center', marginBottom: 20 },
  planTitle:       { fontSize: 18, fontFamily: 'Lora_700Bold', marginBottom: 3 },
  planSubtitle:    { fontSize: 12.5, fontFamily: 'Inter_400Regular', marginBottom: 6, textAlign: 'center' },
  priceRow:        { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 },
  priceValue:      { fontSize: 38, fontFamily: 'Lora_700Bold' },
  pricePer:        { fontSize: 13, fontFamily: 'Inter_400Regular' },
  priceError:      { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 8 },

  featureList:     { gap: 11, marginBottom: 22 },
  featureRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck:    { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  featureText:     { fontSize: 13.5, fontFamily: 'Inter_400Regular', flex: 1 },

  ctaBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  ctaText:         { fontSize: 15.5, fontFamily: 'Inter_600SemiBold' },
  disclaimer:      { fontSize: 11.5, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 10 },
  disclaimerSmall: { fontSize: 10.5, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 2, opacity: 0.8 },
  restoreBtn:      { alignItems: 'center', marginTop: 16 },
  restoreText:     { fontSize: 12.5, fontFamily: 'Inter_500Medium', textDecorationLine: 'underline' },

  freeCard:        { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 18, marginTop: 22, gap: 6 },
  freeTitle:       { fontSize: 10.5, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  freeDesc:        { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  freeNote:        { fontSize: 11.5, fontFamily: 'Inter_400Regular' },
});
