import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../theme';
import { accountingService } from '../services/accountingService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FormInput } from '../components/common/FormInput';

export function CashOutScreen({ onTransactionAdded }) {
  const { colors } = useTheme();
  const { t, formatCurrency, formatDate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentCashOuts, setRecentCashOuts] = useState([]);

  // Form State
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [accRes, catRes, txRes] = await Promise.all([
        accountingService.getAccounts(),
        accountingService.getCategories({ type: 'cash_out' }),
        accountingService.getTransactions({ type: 'cash_out', limit: 8 }),
      ]);

      const accs = accRes.accounts || [];
      const cats = catRes.categories || [];
      setAccounts(accs);
      setCategories(cats);
      setRecentCashOuts(txRes.transactions || []);

      if (accs.length > 0 && !accountId) setAccountId(String(accs[0].id));
      if (cats.length > 0 && !categoryId) setCategoryId(String(cats[0].id));
    } catch (e) {
      console.warn('Load cash out data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Nominal pengeluaran harus lebih besar dari 0.');
      return;
    }
    if (!accountId) {
      setErrorMsg('Pilih rekening sumber pembayaran.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Pilih pos kategori pengeluaran kas.');
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      setSubmitting(true);

      await accountingService.createTransaction({
        date,
        type: 'cash_out',
        amount: numAmount,
        account_id: parseInt(accountId),
        category_id: parseInt(categoryId),
        payment_method: paymentMethod,
        description: description.trim() || null,
      });

      setSuccessMsg(t('form.success_out'));
      setAmount('');
      setDescription('');

      const txRes = await accountingService.getTransactions({ type: 'cash_out', limit: 8 });
      setRecentCashOuts(txRes.transactions || []);

      if (onTransactionAdded) onTransactionAdded();
    } catch (e) {
      setErrorMsg(e.message || 'Gagal mencatat transaksi kas keluar.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = ['Transfer Bank', 'Tunai', 'Kartu Debit', 'Giro', 'Lainnya'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.layoutRow}>
        {/* Form Column */}
        <View style={styles.formCol}>
          <Card
            title={t('screen.cash_out.title')}
            subtitle={t('screen.cash_out.subtitle')}
          >
            {errorMsg ? <Text style={[styles.alertError, { backgroundColor: colors.cashOutBg, color: colors.cashOut }]}>⚠ {errorMsg}</Text> : null}
            {successMsg ? <Text style={[styles.alertSuccess, { backgroundColor: colors.cashInBg, color: colors.cashIn }]}>{successMsg}</Text> : null}

            <FormInput
              label={t('common.date')}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              required
            />

            <FormInput
              label={t('form.enter_amount')}
              value={amount}
              onChangeText={setAmount}
              placeholder="1500000"
              keyboardType="numeric"
              required
              helperText={t('common.rate_info')}
            />

            {/* Rekening Sumber Selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('common.account')} *</Text>
              <View style={styles.optionsWrap}>
                {accounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      String(acc.id) === String(accountId) && {
                        backgroundColor: colors.cashOutBg,
                        borderColor: colors.cashOutBorder,
                      },
                    ]}
                    onPress={() => setAccountId(String(acc.id))}
                  >
                    <Feather
                      name="credit-card"
                      size={12}
                      color={String(acc.id) === String(accountId) ? colors.cashOut : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.optionChipText,
                        { color: colors.textSecondary },
                        String(acc.id) === String(accountId) && { color: colors.cashOut, fontWeight: '700' },
                      ]}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kategori Pengeluaran Selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('common.category')} *</Text>
              <View style={styles.optionsWrap}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      String(cat.id) === String(categoryId) && {
                        backgroundColor: colors.cashOutBg,
                        borderColor: colors.cashOutBorder,
                      },
                    ]}
                    onPress={() => setCategoryId(String(cat.id))}
                  >
                    <Feather
                      name="tag"
                      size={12}
                      color={String(cat.id) === String(categoryId) ? colors.cashOut : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.optionChipText,
                        { color: colors.textSecondary },
                        String(cat.id) === String(categoryId) && { color: colors.cashOut, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Metode Pembayaran */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Metode Pembayaran</Text>
              <View style={styles.optionsWrap}>
                {paymentMethods.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      paymentMethod === m && {
                        backgroundColor: colors.primarySubtle,
                        borderColor: colors.primaryLight,
                      },
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        { color: colors.textSecondary },
                        paymentMethod === m && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FormInput
              label={t('common.notes')}
              placeholder={t('form.notes_placeholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Button
              title={submitting ? t('action.refreshing') : t('form.submit_out')}
              onPress={handleSubmit}
              loading={submitting}
              variant="danger"
              size="lg"
              icon={<Feather name="arrow-up-right" size={15} color="#ffffff" />}
            />
          </Card>
        </View>

        {/* Recent Transactions Column */}
        <View style={styles.recentCol}>
          <Card
            title={t('nav.cash_out')}
            subtitle={t('dashboard.recent_transactions')}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : recentCashOuts.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('dashboard.no_transactions')}</Text>
            ) : (
              recentCashOuts.map((tx) => (
                <View key={tx.id} style={[styles.recentRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.recentIndicator, { backgroundColor: colors.cashOutBg }]}>
                    <Feather name="arrow-up-right" size={13} color={colors.cashOut} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentDesc, { color: colors.textPrimary }]} numberOfLines={1}>
                      {tx.description || t('nav.cash_out')}
                    </Text>
                    <Text style={[styles.recentMeta, { color: colors.textMuted }]}>
                      {tx.category?.name} • {tx.account?.name} • {formatDate(tx.date, { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, { color: colors.cashOut }]}>
                    -{formatCurrency(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  formCol: {
    flex: 1.5,
    minWidth: 340,
  },
  recentCol: {
    flex: 1,
    minWidth: 300,
  },
  alertError: {
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: '500',
  },
  alertSuccess: {
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    padding: 16,
    textAlign: 'center',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recentIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
});
