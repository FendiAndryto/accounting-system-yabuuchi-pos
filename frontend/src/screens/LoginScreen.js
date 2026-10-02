import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      style={styles.screen}
    >
      <View style={styles.card}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIcon}>AT</Text>
          </View>
          <Text style={styles.brandTitle}>AUBE TERRA INDONESIA</Text>
          <Text style={styles.brandSubtitle}>Sistem Informasi Akuntansi & Arus Kas</Text>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <FormInput
          label="Email Perusahaan"
          placeholder="admin@aubeterra.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          required
        />

        <FormInput
          label="Kata Sandi"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
        />

        <Button
          title={loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={styles.loginBtn}
        />

        <View style={styles.cardFooter}>
          <Text style={styles.footerNote}>
            Keamanan terenkripsi • Hanya staf dan manajemen berwenang
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.md,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  brandIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.cashOutBg,
    borderColor: colors.cashOutBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
    color: colors.cashOut,
    fontSize: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.cashOut,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
});
