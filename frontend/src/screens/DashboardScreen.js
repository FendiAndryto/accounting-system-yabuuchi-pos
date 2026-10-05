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
import { Badge } from '../components/common/Badge';

export function DashboardScreen({ onNavigate }) {
  const { colors } = useTheme();
  const { t, formatCurrency, formatDate } = useLanguage();
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('app.loading')}</Text>
      </View>
    );
  }

  const cashFlow = overview?.cash_flow || {};
  const totalIn = cashFlow.total_cash_in !== undefined ? Number(cashFlow.total_cash_in) : 0;
  const totalOut = cashFlow.total_cash_out !== undefined ? Number(cashFlow.total_cash_out) : 0;
  const netFlow = cashFlow.net_cash_flow !== undefined ? Number(cashFlow.net_cash_flow) : (totalIn - totalOut);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* KPI Cards Row */}
      <View style={styles.kpiGrid}>
        {/* Cash In Card */}
        <View style={[styles.kpiCard, styles.kpiCardIn, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.cashIn }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{t('dashboard.total_cash_in')}</Text>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.cashInBg }]}>
              <Feather name="arrow-down-left" size={14} color={colors.cashIn} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: colors.cashIn }]}>
            {formatCurrency(totalIn)}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>{t('common.rate_info')}</Text>
        </View>

        {/* Cash Out Card */}
        <View style={[styles.kpiCard, styles.kpiCardOut, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.cashOut }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{t('dashboard.total_cash_out')}</Text>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.cashOutBg }]}>
              <Feather name="arrow-up-right" size={14} color={colors.cashOut} />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: colors.cashOut }]}>
            {formatCurrency(totalOut)}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>{t('common.rate_info')}</Text>
        </View>

        {/* Net Flow Card */}
        <View style={[styles.kpiCard, styles.kpiCardNet, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{t('dashboard.net_flow')}</Text>
            <Badge
              label={netFlow >= 0 ? '+ Surplus' : '- Defisit'}
              variant={netFlow >= 0 ? 'success' : 'danger'}
              size="sm"
            />
          </View>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>
            {formatCurrency(netFlow)}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>{t('dashboard.net_flow')}</Text>
        </View>
      </View>

      {/* Accounts & Cash Balance Overview */}
      <Card
        title={t('dashboard.active_accounts')}
        subtitle={t('screen.master_accounts.subtitle')}
        headerRight={
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('master_accounts')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>{t('nav.master_accounts')} →</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.accountsGrid}>
          {accounts.map((acc) => (
            <View key={acc.id} style={[styles.accountCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={styles.accHeader}>
                <View style={[styles.accIconBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Feather name="credit-card" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {acc.name}
                  </Text>
                  <Text style={[styles.accNumber, { color: colors.textMuted }]}>
                    {acc.account_number || 'Operasional / Cash'}
                  </Text>
                </View>
              </View>

              <View style={[styles.accDivider, { backgroundColor: colors.border }]} />

              <View style={styles.accBalanceRow}>
                <Text style={[styles.accBalanceLabel, { color: colors.textSecondary }]}>{t('dashboard.total_balance')}</Text>
                <Text style={[styles.accBalanceValue, { color: colors.textPrimary }]}>
                  {formatCurrency(acc.current_balance || 0)}
                </Text>
              </View>

              <View style={styles.accSubRow}>
                <Text style={[styles.accSubText, { color: colors.cashIn }]}>
                  In: {formatCurrency(acc.total_in || 0)}
                </Text>
                <Text style={[styles.accSubText, { color: colors.cashOut }]}>
                  Out: {formatCurrency(acc.total_out || 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Recent Transactions Activity */}
      <Card
        title={t('dashboard.recent_transactions')}
        subtitle={t('screen.history.subtitle')}
        headerRight={
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('history')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>{t('nav.history')} →</Text>
          </TouchableOpacity>
        }
      >
        {!Array.isArray(recentTransactions) || recentTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('dashboard.no_transactions')}</Text>
          </View>
        ) : (
          recentTransactions.map((tx) => {
            const isIn = tx.type === 'cash_in';
            return (
              <View key={tx.id} style={[styles.txRow, { borderBottomColor: colors.borderLight }]}>
                <View
                  style={[
                    styles.txIndicator,
                    { backgroundColor: isIn ? colors.cashInBg : colors.cashOutBg },
                  ]}
                >
                  <Feather
                    name={isIn ? 'arrow-down-left' : 'arrow-up-right'}
                    size={14}
                    color={isIn ? colors.cashIn : colors.cashOut}
                  />
                </View>

                <View style={styles.txDetails}>
                  <Text style={[styles.txDesc, { color: colors.textPrimary }]} numberOfLines={1}>
                    {tx.description || (isIn ? t('nav.cash_in') : t('nav.cash_out'))}
                  </Text>
                  <View style={styles.txMetaRow}>
                    <Badge
                      label={tx.category?.name || t('common.all')}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                    <Text style={[styles.txMetaDot, { color: colors.textLight }]}>•</Text>
                    <Text style={[styles.txMetaText, { color: colors.textMuted }]}>{tx.account?.name || 'Kas'}</Text>
                    <Text style={[styles.txMetaDot, { color: colors.textLight }]}>•</Text>
                    <Text style={[styles.txMetaText, { color: colors.textMuted }]}>
                      {formatDate(tx.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.txAmountContainer}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isIn ? colors.cashIn : colors.cashOut },
                    ]}
                  >
                    {isIn ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
                  <Text style={[styles.txMethod, { color: colors.textMuted }]}>{tx.payment_method}</Text>
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
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: 20,
    ...theme.shadows.sm,
  },
  kpiCardIn: {
    borderLeftWidth: 4,
  },
  kpiCardOut: {
    borderLeftWidth: 4,
  },
  kpiCardNet: {
    borderLeftWidth: 4,
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
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  accountCard: {
    flex: 1,
    minWidth: 240,
    borderWidth: 1,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accName: {
    fontSize: 14,
    fontWeight: '700',
  },
  accNumber: {
    fontSize: 11,
    marginTop: 1,
  },
  accDivider: {
    height: 1,
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
    fontWeight: '500',
  },
  accBalanceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  accSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  txIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txMetaDot: {
    marginHorizontal: 6,
    fontSize: 10,
  },
  txMetaText: {
    fontSize: 12,
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
    marginTop: 2,
  },
});
