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
import { Badge } from '../components/common/Badge';

export function DashboardScreen({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, accountsRes, txRes] = await Promise.all([
        accountingService.getFinancialOverview(),
        accountingService.getAccounts(),
        accountingService.getTransactions({ limit: 6 }),
      ]);

      setOverview(overviewRes);
      setAccounts(Array.isArray(accountsRes?.accounts) ? accountsRes.accounts : []);
      const txList = Array.isArray(txRes?.transactions)
        ? txRes.transactions
        : Array.isArray(txRes?.transactions?.data)
        ? txRes.transactions.data
        : [];
      setRecentTransactions(txList);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !overview) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat ikhtisar keuangan...</Text>
      </View>
    );
  }

  const cashFlow = overview?.cash_flow || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* KPI Cards Row */}
      <View style={styles.kpiGrid}>
        {/* Cash In Card */}
        <View style={[styles.kpiCard, styles.kpiCardIn]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>Total Cash In</Text>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.cashInBg }]}>
              <Text style={{ color: colors.cashIn, fontWeight: '700' }}>↓</Text>
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: colors.cashIn }]}>
            {cashFlow.total_cash_in_formatted || 'Rp 0'}
          </Text>
          <Text style={styles.kpiSub}>Total penerimaan kas tercatat</Text>
        </View>

        {/* Cash Out Card */}
        <View style={[styles.kpiCard, styles.kpiCardOut]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>Total Cash Out</Text>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.cashOutBg }]}>
              <Text style={{ color: colors.cashOut, fontWeight: '700' }}>↑</Text>
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: colors.cashOut }]}>
            {cashFlow.total_cash_out_formatted || 'Rp 0'}
          </Text>
          <Text style={styles.kpiSub}>Total pengeluaran kas periode ini</Text>
        </View>

        {/* Net Flow Card */}
        <View style={[styles.kpiCard, styles.kpiCardNet]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>Net Cash Flow</Text>
            <Badge
              label={cashFlow.status || 'Net Flow'}
              variant={cashFlow.net_cash_flow >= 0 ? 'success' : 'danger'}
              size="sm"
            />
          </View>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>
            {cashFlow.net_cash_flow_formatted || 'Rp 0'}
          </Text>
          <Text style={styles.kpiSub}>Surplus / defisit kas bersih</Text>
        </View>
      </View>

      {/* Accounts & Cash Balance Overview */}
      <Card
        title="Rekening Bank & Kas Aktif"
        subtitle="Daftar saldo berjalan setiap rekening"
        headerRight={
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('master_accounts')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Kelola Rekening →</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.accountsGrid}>
          {accounts.map((acc) => (
            <View key={acc.id} style={styles.accountCard}>
              <View style={styles.accHeader}>
                <View style={styles.accIconBox}>
                  <Text style={styles.accIcon}>🏦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accName} numberOfLines={1}>
                    {acc.name}
                  </Text>
                  <Text style={styles.accNumber}>
                    {acc.account_number || 'Kas Fisik / Operasional'}
                  </Text>
                </View>
              </View>

              <View style={styles.accDivider} />

              <View style={styles.accBalanceRow}>
                <Text style={styles.accBalanceLabel}>Saldo Berjalan</Text>
                <Text style={styles.accBalanceValue}>
                  {acc.current_balance_formatted || `Rp ${Number(acc.current_balance || 0).toLocaleString('id-ID')}`}
                </Text>
              </View>

              <View style={styles.accSubRow}>
                <Text style={styles.accSubText}>
                  Masuk: Rp {Number(acc.total_in || 0).toLocaleString('id-ID')}
                </Text>
                <Text style={styles.accSubText}>
                  Keluar: Rp {Number(acc.total_out || 0).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Recent Transactions Activity */}
      <Card
        title="Aktivitas Transaksi Terkini"
        subtitle="Transaksi kas masuk & keluar paling baru"
        headerRight={
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('history')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Lihat Semua (History) →</Text>
          </TouchableOpacity>
        }
      >
        {!Array.isArray(recentTransactions) || recentTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada riwayat transaksi tercatat.</Text>
          </View>
        ) : (
          recentTransactions.map((tx) => {
            const isIn = tx.type === 'cash_in';
            return (
              <View key={tx.id} style={styles.txRow}>
                <View
                  style={[
                    styles.txIndicator,
                    { backgroundColor: isIn ? colors.cashInBg : colors.cashOutBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.txIndicatorText,
                      { color: isIn ? colors.cashIn : colors.cashOut },
                    ]}
                  >
                    {isIn ? '↓' : '↑'}
                  </Text>
                </View>

                <View style={styles.txDetails}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description || (isIn ? 'Kas Masuk' : 'Kas Keluar')}
                  </Text>
                  <View style={styles.txMetaRow}>
                    <Badge
                      label={tx.category?.name || 'Umum'}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                    <Text style={styles.txMetaDot}>•</Text>
                    <Text style={styles.txMetaText}>{tx.account?.name || 'Kas'}</Text>
                    <Text style={styles.txMetaDot}>•</Text>
                    <Text style={styles.txMetaText}>{tx.date}</Text>
                  </View>
                </View>

                <View style={styles.txAmountContainer}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isIn ? colors.cashIn : colors.cashOut },
                    ]}
                  >
                    {isIn ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.txMethod}>{tx.payment_method}</Text>
                </View>
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...theme.shadows.sm,
  },
  kpiCardIn: {
    borderLeftWidth: 4,
    borderLeftColor: colors.cashIn,
  },
  kpiCardOut: {
    borderLeftWidth: 4,
    borderLeftColor: colors.cashOut,
  },
  kpiCardNet: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  accountCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 16,
  },
  accHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accIcon: {
    fontSize: 16,
  },
  accName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accNumber: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  accDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  accBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  accBalanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  accBalanceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  accSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accSubText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  txIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txIndicatorText: {
    fontSize: 14,
    fontWeight: '800',
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txMetaDot: {
    marginHorizontal: 6,
    color: colors.textLight,
    fontSize: 10,
  },
  txMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txMethod: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
