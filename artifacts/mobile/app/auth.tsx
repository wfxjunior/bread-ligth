/**
 * Auth screen — optional, modal, minimalist.
 * Unlocks: cross-device sync (free) + premium features (separate).
 *
 * Visual concept: an old explorer's treasure map — cream parchment, sepia
 * ink, a faint compass rose watermark, a dotted "trail" divider, a
 * map-cartouche border with corner ticks, and a wax-seal mark on the
 * primary action. Clean and light, not gloomy — the opposite mood of the
 * dark leather bookshelf, on purpose.
 */
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/context/LanguageContext';

// ── Parchment palette ───────────────────────────────────────────────────────
const PARCHMENT: [string, string] = ['#F7EFDA', '#EEDDB2'];
const INK        = '#4A3620';
const INK_SOFT   = 'rgba(74,54,32,0.62)';
const INK_FAINT  = 'rgba(74,54,32,0.36)';
const LINE       = 'rgba(74,54,32,0.22)';
const LINE_SOFT  = 'rgba(74,54,32,0.14)';
const SEAL       = '#7A2E1D';
const PAPER      = 'rgba(255,251,240,0.58)';

// ── Types ─────────────────────────────────────────────────────────────────────
type FormMode = 'login' | 'register';

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const insets   = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const [mode, setMode]               = useState<FormMode>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);

  const haptic = () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); };

  const handleSkip = () => { haptic(); router.back(); };

  const handleGoogle = async () => {
    haptic();
    // TODO: expo-auth-session Google OAuth
  };

  const handleApple = async () => {
    haptic();
    // TODO: expo-apple-authentication
  };

  const handleSubmit = async () => {
    if (loading) return;
    haptic();
    if (!email.trim() || !password) return;
    if (!isLogin && confirm !== password) {
      Alert.alert(
        t('auth_register'),
        lang === 'pt' ? 'As senhas não coincidem.' : 'Passwords do not match.',
      );
      return;
    }
    setLoading(true);
    // TODO: wire to auth provider
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
  };

  const toggleMode = () => {
    haptic();
    setMode(m => m === 'login' ? 'register' : 'login');
    setConfirm('');
  };

  const isLogin = mode === 'login';

  return (
    <View style={styles.root}>
      {/* ── Parchment background ── */}
      <LinearGradient colors={PARCHMENT} style={StyleSheet.absoluteFill} />

      {/* aged vignette at the edges */}
      <LinearGradient
        colors={['rgba(74,54,32,0.16)', 'rgba(74,54,32,0)']}
        style={[styles.vignette, { top: 0, height: 140 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(74,54,32,0)', 'rgba(74,54,32,0.14)']}
        style={[styles.vignette, { bottom: 0, height: 160 }]}
        pointerEvents="none"
      />

      {/* compass rose watermark */}
      <MaterialCommunityIcons
        name="compass-rose"
        size={260}
        color="rgba(74,54,32,0.05)"
        style={styles.compassWatermark}
        pointerEvents="none"
      />

      {/* map-cartouche border */}
      <View style={styles.mapBorder} pointerEvents="none">
        <CornerTick pos="tl" /><CornerTick pos="tr" />
        <CornerTick pos="bl" /><CornerTick pos="br" />
      </View>

      {/* ── Close ── */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 14 }]}
        onPress={handleSkip}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel={lang === 'pt' ? 'Fechar' : 'Close'}
        accessibilityRole="button"
      >
        <Feather name="x" size={18} color={INK_SOFT} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Brand ── */}
          <View style={[styles.brandArea, { paddingTop: insets.top + 56 }]}>
            <View style={styles.brandRow}>
              <MaterialCommunityIcons name="compass-outline" size={22} color={INK_SOFT} />
              <Text style={styles.eyebrow}>{lang === 'pt' ? 'SUA JORNADA PELAS ESCRITURAS' : 'YOUR JOURNEY THROUGH SCRIPTURE'}</Text>
            </View>
            <Text style={styles.brandName}>Bread{'&'}Light</Text>
            <Text style={styles.tagline}>{t('auth_tagline')}</Text>

            {/* sync badge */}
            <View style={styles.syncBadge}>
              <Feather name="feather" size={10} color={INK_SOFT} />
              <Text style={styles.syncText}>{t('auth_sync_badge')}</Text>
            </View>
          </View>

          {/* spacer between brand and card */}
          <View style={{ flex: 1, minHeight: 32 }} />

        {/* ── Auth card ── */}
        <View style={[styles.card, { paddingBottom: insets.bottom + 32 }]}>

          {/* Social buttons */}
          <View style={styles.socialSection}>
            <SocialButton
              icon={<MaterialCommunityIcons name="google" size={17} color={INK} />}
              label={t('auth_google')}
              onPress={handleGoogle}
            />
            <SocialButton
              icon={<MaterialCommunityIcons name="apple" size={19} color={INK} />}
              label={t('auth_apple')}
              onPress={handleApple}
            />
          </View>

          {/* Divider — dotted trail */}
          <View style={styles.dividerRow}>
            <DottedTrail />
            <Text style={styles.dividerText}>{t('auth_or')}</Text>
            <DottedTrail />
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              onPress={() => { if (!isLogin) toggleMode(); }}
              style={[styles.modeTab, isLogin && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, isLogin && styles.modeTabTextActive]}>
                {t('auth_login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { if (isLogin) toggleMode(); }}
              style={[styles.modeTab, !isLogin && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, !isLogin && styles.modeTabTextActive]}>
                {t('auth_register')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input fields */}
          <View style={styles.fields}>
            <InputField
              placeholder={t('auth_email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
            />
            <View style={styles.fieldDivider} />
            <InputField
              placeholder={t('auth_password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              icon="lock"
              rightEl={
                <TouchableOpacity
                  onPress={() => setShowPw(s => !s)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={showPw ? (lang === 'pt' ? 'Ocultar senha' : 'Hide password') : (lang === 'pt' ? 'Mostrar senha' : 'Show password')}
                  accessibilityRole="button"
                >
                  <Feather name={showPw ? 'eye-off' : 'eye'} size={15} color={INK_FAINT} />
                </TouchableOpacity>
              }
            />
            {!isLogin && (
              <>
                <View style={styles.fieldDivider} />
                <InputField
                  placeholder={t('auth_confirm_password')}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPw}
                  icon="lock"
                />
              </>
            )}
          </View>

          {/* Submit — wax-seal style */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.submitBtn}
          >
            {loading
              ? <Feather name="loader" size={18} color="#F6ECD6" />
              : <Text style={styles.submitText}>
                  {isLogin ? t('auth_login') : t('auth_register')}
                </Text>
            }
            <View style={styles.wax}>
              <MaterialCommunityIcons name="fire" size={13} color="#F6ECD6" />
            </View>
          </TouchableOpacity>

          {/* Forgot / toggle */}
          <View style={styles.secondaryRow}>
            {isLogin && (
              <TouchableOpacity onPress={haptic}>
                <Text style={styles.secondaryLink}>{t('auth_forgot')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Skip */}
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>{t('auth_skip')}</Text>
            <Feather name="arrow-right" size={12} color={INK_FAINT} />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SocialButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.socialBtn}>
      {icon}
      <Text style={styles.socialText}>{label}</Text>
    </TouchableOpacity>
  );
}

function InputField({
  placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon, rightEl,
}: {
  placeholder: string; value: string; onChangeText: (v: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any;
  icon: string; rightEl?: React.ReactNode;
}) {
  return (
    <View style={styles.inputRow}>
      <Feather name={icon as any} size={15} color={INK_FAINT} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={INK_FAINT}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        selectionColor={SEAL}
      />
      {rightEl}
    </View>
  );
}

function DottedTrail() {
  const dots = Array.from({ length: 9 });
  return (
    <View style={styles.dottedTrail}>
      {dots.map((_, i) => <View key={i} style={styles.trailDot} />)}
    </View>
  );
}

function CornerTick({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const top    = pos === 'tl' || pos === 'tr';
  const left   = pos === 'tl' || pos === 'bl';
  return (
    <View style={[
      styles.cornerTick,
      top ? { top: 0 } : { bottom: 0 },
      left ? { left: 0 } : { right: 0 },
    ]}>
      <View style={[styles.tickLine, styles.tickLineH, left ? { left: 0 } : { right: 0 }]} />
      <View style={[styles.tickLine, styles.tickLineV, top ? { top: 0 } : { bottom: 0 }]} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 26;

const styles = StyleSheet.create({
  root:   { flex: 1 },
  kav:    { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },

  vignette: {
    position: 'absolute',
    left: 0, right: 0,
  },
  compassWatermark: {
    position: 'absolute',
    top: -30,
    right: -60,
  },
  mapBorder: {
    position: 'absolute',
    top: 14, left: 14, right: 14, bottom: 14,
  },
  cornerTick: {
    position: 'absolute',
    width: 22, height: 22,
  },
  tickLine: {
    position: 'absolute',
    backgroundColor: LINE,
  },
  tickLineH: { top: 0, width: 14, height: StyleSheet.hairlineWidth },
  tickLineV: { left: 0, width: StyleSheet.hairlineWidth, height: 14 },

  closeBtn: {
    position: 'absolute',
    right:    20,
    zIndex:   10,
    width:    34,
    height:   34,
    borderRadius:    17,
    backgroundColor: 'rgba(74,54,32,0.06)',
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     LINE_SOFT,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Brand ────────────────────────────────────────────────────────────────
  brandArea: {
    paddingHorizontal: 32,
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: INK_SOFT,
    letterSpacing: 1.4,
  },
  brandName: {
    fontSize:    42,
    fontFamily:  'Lora_700Bold',
    color:       INK,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize:    15,
    fontFamily:  'Inter_400Regular',
    color:       INK_SOFT,
    lineHeight:  22,
  },
  syncBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    marginTop:       4,
  },
  syncText: {
    fontSize:    11,
    fontFamily:  'Inter_500Medium',
    color:       INK_FAINT,
    letterSpacing: 0.2,
  },

  // ── Card (parchment panel) ────────────────────────────────────────────────
  card: {
    backgroundColor: PAPER,
    borderTopLeftRadius:  CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    borderTopWidth:       StyleSheet.hairlineWidth,
    borderLeftWidth:      StyleSheet.hairlineWidth,
    borderRightWidth:     StyleSheet.hairlineWidth,
    borderColor:          LINE,
    paddingTop:           28,
    paddingHorizontal:    24,
    gap:                  16,
  },

  // ── Social ───────────────────────────────────────────────────────────────
  socialSection: { gap: 10 },
  socialBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
    height:          50,
    borderRadius:    12,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     LINE,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  socialText: {
    fontSize:    15,
    fontFamily:  'Inter_500Medium',
    color:       INK,
    letterSpacing: 0.1,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
  },
  dottedTrail: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trailDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: LINE,
  },
  dividerText: {
    fontSize:    11,
    fontFamily:  'Inter_500Medium',
    color:       INK_FAINT,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // ── Mode toggle ───────────────────────────────────────────────────────────
  modeToggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(74,54,32,0.06)',
    borderRadius:    10,
    padding:         3,
  },
  modeTab: {
    flex:            1,
    paddingVertical: 8,
    alignItems:      'center',
    borderRadius:    8,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  modeTabText: {
    fontSize:    13,
    fontFamily:  'Inter_500Medium',
    color:       INK_FAINT,
  },
  modeTabTextActive: {
    color:       INK,
    fontFamily:  'Inter_600SemiBold',
  },

  // ── Fields ───────────────────────────────────────────────────────────────
  fields: {
    borderRadius:    12,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     LINE,
    backgroundColor: 'rgba(255,255,255,0.4)',
    overflow:        'hidden',
  },
  inputRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 14,
    height:         50,
    gap:            10,
  },
  inputIcon: {},
  input: {
    flex:        1,
    fontSize:    15,
    fontFamily:  'Inter_400Regular',
    color:       INK,
    height:      50,
  },
  fieldDivider: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: LINE_SOFT,
    marginHorizontal: 14,
  },

  // ── Submit (wax seal) ─────────────────────────────────────────────────────
  submitBtn: {
    height:          52,
    borderRadius:    12,
    backgroundColor: SEAL,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  submitText: {
    fontSize:    16,
    fontFamily:  'Inter_600SemiBold',
    color:       '#F6ECD6',
    letterSpacing: 0.2,
  },
  wax: {
    position: 'absolute',
    right: -6, top: -6,
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: '#5C2115',
    borderWidth: 1.5,
    borderColor: '#F6ECD6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  // ── Secondary ─────────────────────────────────────────────────────────────
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -4,
  },
  secondaryLink: {
    fontSize:    13,
    fontFamily:  'Inter_400Regular',
    color:       INK_FAINT,
  },

  // ── Skip ──────────────────────────────────────────────────────────────────
  skipBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            5,
    paddingVertical: 4,
  },
  skipText: {
    fontSize:    13,
    fontFamily:  'Inter_400Regular',
    color:       INK_FAINT,
  },
});
