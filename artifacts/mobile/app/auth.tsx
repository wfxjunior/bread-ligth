/**
 * Auth screen — optional, minimalist.
 * Unlocks: cross-device sync (free) + premium features (separate).
 *
 * Visual concept: matches the web app's Clerk sign-in/sign-up screen —
 * a clean off-white card, burgundy primary action, and no decorative
 * theming. Kept in sync with `artifacts/bible-english/src/App.tsx`'s
 * `clerkAppearance` palette; if that changes, update the constants below too.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSignIn, useSignUp, useSSO } from '@clerk/expo';
import { useLanguage } from '@/context/LanguageContext';

// Handle any pending authentication sessions returning from the browser.
WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

// ── Palette — mirrors the web app's Clerk `clerkAppearance.variables` ───────
const BG          = '#FEFDFB'; // colorBackground   hsl(36 40% 99%)
const BORDER      = '#E7E2DA'; // colorNeutral      hsl(36 20% 88%)
const BORDER_SOFT = 'rgba(57,46,40,0.08)';
const INK         = '#392E28'; // colorForeground       hsl(21 18% 19%)
const INK_SOFT    = '#7E6F67'; // colorMutedForeground  hsl(21 10% 45%)
const INK_FAINT   = 'rgba(57,46,40,0.42)';
const PRIMARY     = '#6B1E2A'; // colorPrimary      hsl(353 43% 30%)
const PRIMARY_FG  = '#FAF8F4';
const INPUT_BG    = '#FAF8F5'; // colorInput        hsl(36 33% 97%)
const DANGER      = '#EF4343'; // colorDanger       hsl(0 84% 60%)

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
  const [verifying, setVerifying]     = useState(false);
  const [code, setCode]               = useState('');

  useWarmUpBrowser();

  const { signIn, errors: signInErrors } = useSignIn();
  const { signUp, errors: signUpErrors } = useSignUp();
  const { startSSOFlow } = useSSO();

  const isLogin = mode === 'login';
  const emailError = isLogin ? signInErrors.fields.identifier?.message : signUpErrors.fields.emailAddress?.message;
  const passwordError = isLogin ? signInErrors.fields.password?.message : signUpErrors.fields.password?.message;

  const haptic = () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); };

  const handleSkip = () => { haptic(); router.back(); };

  const goHome = () => { router.back(); };

  const startOAuth = useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    haptic();
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'goden' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId, navigate: () => goHome() });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow]);

  const handleGoogle = () => startOAuth('oauth_google');
  const handleApple  = () => startOAuth('oauth_apple');

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
    try {
      if (isLogin) {
        const { error } = await signIn.password({ emailAddress: email.trim(), password });
        if (error) return;

        if (signIn.status === 'complete') {
          await signIn.finalize({ navigate: () => goHome() });
        } else if (signIn.status === 'needs_second_factor') {
          Alert.alert(t('auth_login'), lang === 'pt'
            ? 'Este login exige verificação adicional, que não é suportada aqui.'
            : 'This sign-in requires additional verification, which isn\'t supported here.');
        }
      } else {
        const { error } = await signUp.password({ emailAddress: email.trim(), password });
        if (error) return;

        await signUp.verifications.sendEmailCode();
        setVerifying(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (loading || !code.trim()) return;
    haptic();
    setLoading(true);
    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: () => goHome() });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    haptic();
    setMode(m => m === 'login' ? 'register' : 'login');
    setConfirm('');
    setVerifying(false);
    setCode('');
  };

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
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
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Brand ── */}
          <View style={[styles.brandArea, { paddingTop: insets.top + 24 }]}>
            <Text style={styles.brandName}>Bread{'&'}Light</Text>
          </View>

          {/* ── Auth card ── */}
          <View style={styles.card}>
          {verifying ? (
            <>
              <Text style={styles.cardTitle}>{t('auth_verify_title')}</Text>
              <Text style={styles.cardSubtitle}>{t('auth_verify_subtitle')}</Text>

              <View style={styles.fields}>
                <InputField
                  placeholder={t('auth_verify_code_placeholder')}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  icon="key"
                />
              </View>
              {signUpErrors.fields.code && (
                <Text style={styles.fieldError}>{signUpErrors.fields.code.message}</Text>
              )}

              <TouchableOpacity onPress={handleVerify} activeOpacity={0.85} style={styles.submitBtn} disabled={loading}>
                {loading
                  ? <Feather name="loader" size={18} color={PRIMARY_FG} />
                  : <Text style={styles.submitText}>{t('auth_verify_button')}</Text>
                }
              </TouchableOpacity>

              <View style={styles.secondaryRow}>
                <TouchableOpacity onPress={() => { haptic(); signUp.verifications.sendEmailCode(); }}>
                  <Text style={styles.secondaryLink}>{t('auth_resend_code')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => { haptic(); setVerifying(false); setCode(''); }} style={styles.skipBtn} activeOpacity={0.7}>
                <Text style={styles.skipText}>{t('auth_start_over')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
            {/* Card header — matches web's Clerk headerTitle/headerSubtitle */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {isLogin ? t('auth_welcome_back_title') : t('auth_create_account_title')}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isLogin ? t('auth_welcome_back_subtitle') : t('auth_create_account_subtitle')}
              </Text>
            </View>

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

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth_or')}</Text>
              <View style={styles.dividerLine} />
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
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? <Feather name="loader" size={18} color={PRIMARY_FG} />
                : <Text style={styles.submitText}>
                    {isLogin ? t('auth_login') : t('auth_register')}
                  </Text>
              }
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

            {/* Required for sign-up flows — Clerk's bot sign-up protection */}
            {!isLogin && <View nativeID="clerk-captcha" />}
            </>
          )}
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
        selectionColor={PRIMARY}
      />
      {rightEl}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  root:   { flex: 1 },
  kav:    { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },

  closeBtn: {
    position: 'absolute',
    right:    20,
    zIndex:   10,
    width:    34,
    height:   34,
    borderRadius:    17,
    backgroundColor: 'rgba(57,46,40,0.05)',
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     BORDER,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Brand ────────────────────────────────────────────────────────────────
  brandArea: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize:    26,
    fontFamily:  'Lora_700Bold',
    color:       INK,
    letterSpacing: -0.3,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:      CARD_RADIUS,
    borderWidth:       StyleSheet.hairlineWidth,
    borderColor:       BORDER,
    marginHorizontal:  20,
    paddingTop:        28,
    paddingBottom:      28,
    paddingHorizontal: 24,
    gap:               16,
    shadowColor:       '#000',
    shadowOpacity:     0.06,
    shadowRadius:      16,
    shadowOffset:      { width: 0, height: 6 },
    elevation:         3,
  },
  cardHeader: {
    gap: 4,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize:    20,
    fontFamily:  'Lora_700Bold',
    color:       INK,
  },
  cardSubtitle: {
    fontSize:    13.5,
    fontFamily:  'Inter_400Regular',
    color:       INK_SOFT,
  },

  // ── Social ───────────────────────────────────────────────────────────────
  socialSection: { gap: 10 },
  socialBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
    height:          50,
    borderRadius:    10,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     BORDER,
    backgroundColor: '#FFFFFF',
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
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontSize:    11,
    fontFamily:  'Inter_500Medium',
    color:       INK_SOFT,
    letterSpacing: 0.4,
  },

  // ── Mode toggle ───────────────────────────────────────────────────────────
  modeToggle: {
    flexDirection:   'row',
    backgroundColor: INPUT_BG,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     BORDER,
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
    backgroundColor: '#FFFFFF',
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     BORDER,
  },
  modeTabText: {
    fontSize:    13,
    fontFamily:  'Inter_500Medium',
    color:       INK_SOFT,
  },
  modeTabTextActive: {
    color:       PRIMARY,
    fontFamily:  'Inter_600SemiBold',
  },

  // ── Fields ───────────────────────────────────────────────────────────────
  fields: {
    borderRadius:    10,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     BORDER,
    backgroundColor: INPUT_BG,
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
    backgroundColor: BORDER_SOFT,
    marginHorizontal: 14,
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn: {
    height:          50,
    borderRadius:    10,
    backgroundColor: PRIMARY,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  submitText: {
    fontSize:    15.5,
    fontFamily:  'Inter_600SemiBold',
    color:       PRIMARY_FG,
    letterSpacing: 0.1,
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
    color:       PRIMARY,
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

  // ── Errors ────────────────────────────────────────────────────────────────
  fieldError: {
    fontSize:    12,
    fontFamily:  'Inter_400Regular',
    color:       DANGER,
    marginTop:   -8,
  },
});
