import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';

export function LoginScreen() {
  const { login } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'id', label: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'ja', label: 'JA', name: '日本語', flag: '🇯🇵' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Mohon isi email dan kata sandi Anda.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      {/* Top Floating Controls for Theme and Language */}
      <View style={styles.topBar}>
        <View style={styles.langWrapper}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setLangMenuOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={13} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>{currentLangObj.label}</Text>
            <Feather name={langMenuOpen ? 'chevron-up' : 'chevron-down'} size={12} color={colors.textMuted} style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          {langMenuOpen && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border, ...theme.shadows.md }]}>
              {languages.map((l) => {
                const isActive = l.code === language;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[styles.dropdownItem, isActive && { backgroundColor: colors.primarySubtle }]}
                    onPress={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{l.flag}</Text>
                    <Text style={[styles.dropdownItemText, { color: isActive ? colors.primary : colors.textPrimary }]}>
                      {l.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.controlBtn, styles.themeToggleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Feather name={isDark ? 'sun' : 'moon'} size={14} color={isDark ? '#fbbf24' : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.brandLogoBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>{t('app.title')}</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>{t('app.subtitle')}</Text>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: colors.cashOutBg, borderColor: colors.cashOutBorder }]}>
            <Feather name="alert-circle" size={14} color={colors.cashOut} style={{ marginRight: 8 }} />
            <Text style={[styles.errorText, { color: colors.cashOut }]}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <FormInput
          label="Email"
          placeholder="admin@aubeterra.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          required
        />

        <FormInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
        />

        <Button
          title={loading ? t('action.refreshing') : 'Sign In'}
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.loginBtn}
          icon={<Feather name="log-in" size={14} color="#ffffff" />}
        />

        <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.footerNote, { color: colors.textLight }]}>
            AUBE TERRA INDONESIA • Accounting & Financial System
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  langWrapper: {
    position: 'relative',
    zIndex: 2000,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    height: 34,
  },
  themeToggleBtn: {
    width: 36,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 140,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 4,
    zIndex: 3000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    borderWidth: 1,
    ...theme.shadows.md,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandLogoBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    padding: 6,
    ...theme.shadows.sm,
  },
  brandLogoImage: {
    width: 62,
    height: 62,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    textAlign: 'center',
  },
});
