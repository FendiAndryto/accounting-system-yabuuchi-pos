import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, theme } from '../theme';
import { accountingService } from '../services/accountingService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { FormInput } from '../components/common/FormInput';

export function CashInScreen({ onTransactionAdded }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentCashIns, setRecentCashIns] = useState([]);

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
        accountingService.getCategories({ type: 'cash_in' }),
        accountingService.getTransactions({ type: 'cash_in', limit: 8 }),
      ]);

      const accs = accRes.accounts || [];
      const cats = catRes.categories || [];
      setAccounts(accs);
      setCategories(cats);
      setRecentCashIns(txRes.transactions || []);

      if (accs.length > 0 && !accountId) setAccountId(String(accs[0].id));
      if (cats.length > 0 && !categoryId) setCategoryId(String(cats[0].id));
    } catch (e) {
      console.warn('Load cash in data error:', e);
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
      setErrorMsg('Nominal pemasukan harus lebih besar dari 0.');
      return;
    }
    if (!accountId) {
      setErrorMsg('Pilih rekening tujuan penerimaan kas.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Pilih kategori pemasukan kas.');
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      setSubmitting(true);

      await accountingService.createTransaction({
        date,
        type: 'cash_in',
        amount: numAmount,
        account_id: parseInt(accountId),
        category_id: parseInt(categoryId),
        payment_method: paymentMethod,
        description: description.trim() || null,
      });

      setSuccessMsg('✓ Kas masuk berhasil dicatat ke sistem!');
      setAmount('');
      setDescription('');

      const txRes = await accountingService.getTransactions({ type: 'cash_in', limit: 8 });
      setRecentCashIns(txRes.transactions || []);

      if (onTransactionAdded) onTransactionAdded();
    } catch (e) {
      setErrorMsg(e.message || 'Gagal mencatat transaksi kas masuk.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = ['Transfer Bank', 'Tunai', 'QRIS', 'Giro', 'Lainnya'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.layoutRow}>
        {/* Form Column */}
        <View style={styles.formCol}>
          <Card
            title="Catat Pemasukan Kas (Cash In)"
            subtitle="Entri penerimaan kas operasional atau pendapatan"
          >
            {errorMsg ? <Text style={styles.alertError}>⚠ {errorMsg}</Text> : null}
            {successMsg ? <Text style={styles.alertSuccess}>{successMsg}</Text> : null}

            <FormInput
              label="Tanggal Penerimaan"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              required
            />

            <FormInput
              label="Nominal Pemasukan (Rp)"
              value={amount}
              onChangeText={setAmount}
              placeholder="Contoh: 5000000"
              keyboardType="numeric"
              required
            />

            {/* Rekening Tujuan Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Rekening Tujuan Kas *</Text>
              <View style={styles.optionsWrap}>
                {accounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.optionChip,
                      String(acc.id) === String(accountId) && styles.optionChipActive,
                    ]}
                    onPress={() => setAccountId(String(acc.id))}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        String(acc.id) === String(accountId) && styles.optionChipTextActive,
                      ]}
                    >
                      🏦 {acc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kategori Pemasukan Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kategori Pemasukan *</Text>
              <View style={styles.optionsWrap}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.optionChip,
                      String(cat.id) === String(categoryId) && styles.optionChipActive,
                    ]}
                    onPress={() => setCategoryId(String(cat.id))}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        String(cat.id) === String(categoryId) && styles.optionChipTextActive,
                      ]}
                    >
                      🏷️ {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Metode Pembayaran */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Metode Pembayaran</Text>
              <View style={styles.optionsWrap}>
                {paymentMethods.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.optionChip,
                      paymentMethod === m && styles.optionChipActive,
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        paymentMethod === m && styles.optionChipTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FormInput
              label="Keterangan / Memo Transaksi"
              placeholder="Contoh: Pembayaran invoice PT Surya Jaya termin 1"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Button
              title={submitting ? 'Memproses...' : 'Catat Kas Masuk'}
              onPress={handleSubmit}
              loading={submitting}
              variant="success"
              size="lg"
              icon="↓"
            />
          </Card>
        </View>

        {/* Recent Transactions Column */}
        <View style={styles.recentCol}>
          <Card
            title="Kas Masuk Terbaru"
            subtitle="Penerimaan kas yang baru saja dicatat"
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : recentCashIns.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada penerimaan kas tercatat.</Text>
            ) : (
              recentCashIns.map((tx) => (
                <View key={tx.id} style={styles.recentRow}>
                  <View style={styles.recentIndicator}>
                    <Text style={styles.recentIndicatorText}>↓</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentDesc} numberOfLines={1}>
                      {tx.description || 'Penerimaan Kas'}
                    </Text>
                    <Text style={styles.recentMeta}>
                      {tx.category?.name} • {tx.account?.name} • {tx.date}
                    </Text>
                  </View>
                  <Text style={styles.recentAmount}>
                    +Rp {Number(tx.amount).toLocaleString('id-ID')}
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
    backgroundColor: colors.cashOutBg,
    color: colors.cashOut,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: '500',
  },
  alertSuccess: {
    backgroundColor: colors.cashInBg,
    color: colors.cashIn,
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
    color: colors.textPrimary,
    marginBottom: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionChipActive: {
    backgroundColor: colors.cashInBg,
    borderColor: colors.cashInBorder,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.cashIn,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    padding: 16,
    textAlign: 'center',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  recentIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cashInBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentIndicatorText: {
    color: colors.cashIn,
    fontWeight: '800',
  },
  recentDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cashIn,
    marginLeft: 8,
  },
});
