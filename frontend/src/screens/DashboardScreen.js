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
import { useResponsive } from '../context/ResponsiveContext';
import { theme } from '../theme';
import { accountingService } from '../services/accountingService';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function DashboardScreen({ onNavigate }) {
  const { colors } = useTheme();
  const { t, formatCurrency, formatDate, getLocalizedName } = useLanguage();
  const { isMobile } = useResponsive();
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
    <ScrollView
      style={[
        styles.container,
        isMobile && styles.containerMobile,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={{ paddingBottom: 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* KPI Cards */}
      {isMobile ? (
        <View style={styles.kpiContainerMobile}>
          {/* Row 1: Cash In & Cash Out in 1 row */}
          <View style={styles.kpiPairRowMobile}>
            {/* Cash In Card */}
            <View style={[styles.kpiCard, styles.kpiCardHalfMobile, styles.kpiCardIn, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.cashIn }]}>
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, styles.kpiLabelMobile, { color: colors.textSecondary }]} numberOfLines={1}>{t('dashboard.total_cash_in')}</Text>
                <View style={[styles.kpiIconBox, styles.kpiIconBoxMobile, { backgroundColor: colors.cashInBg }]}>
                  <Feather name="arrow-down-left" size={13} color={colors.cashIn} />
                </View>
              </View>
              <Text style={[styles.kpiValue, styles.kpiValueMobile, { color: colors.cashIn }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(totalIn)}
              </Text>
            </View>

            {/* Cash Out Card */}
            <View style={[styles.kpiCard, styles.kpiCardHalfMobile, styles.kpiCardOut, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.cashOut }]}>
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, styles.kpiLabelMobile, { color: colors.textSecondary }]} numberOfLines={1}>{t('dashboard.total_cash_out')}</Text>
                <View style={[styles.kpiIconBox, styles.kpiIconBoxMobile, { backgroundColor: colors.cashOutBg }]}>
                  <Feather name="arrow-up-right" size={13} color={colors.cashOut} />
                </View>
              </View>
              <Text style={[styles.kpiValue, styles.kpiValueMobile, { color: colors.cashOut }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(totalOut)}
              </Text>
            </View>
          </View>

          {/* Row 2: Net Flow Card (Full Width) */}
          <View style={[styles.kpiCard, styles.kpiCardFullMobile, styles.kpiCardNet, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
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
          </View>
        </View>
      ) : (
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
          </View>
        </View>
      )}

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
            <View key={acc.id} style={[styles.accountCard, isMobile && styles.accountCardMobile, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={styles.accHeader}>
                <View style={[styles.accIconBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Feather name="credit-card" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.accName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {getLocalizedName(acc)}
                  </Text>
                  <Text style={[styles.accNumber, { color: colors.textMuted }]} numberOfLines={1}>
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

      {/* Recent Transactions List */}
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

                <View style={styles.txMainCol}>
                  {/* Top Row: Description & Amount */}
                  <View style={styles.txTopRow}>
                    <Text style={[styles.txDesc, { color: colors.textPrimary }]} numberOfLines={1}>
                      {tx.description || (isIn ? t('nav.cash_in') : t('nav.cash_out'))}
                    </Text>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: isIn ? colors.cashIn : colors.cashOut },
                      ]}
                    >
                      {isIn ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                  </View>

                  {/* Bottom Row: Category Badge, Account, Date, and Payment Method */}
                  <View style={styles.txBottomRow}>
                    <View style={styles.txMetaGroup}>
                      <Badge
                        label={getLocalizedName(tx.category) || t('common.all')}
                        variant={isIn ? 'cash_in' : 'cash_out'}
                        size="sm"
                      />
                      <Text style={[styles.txMetaText, { color: colors.textMuted }]} numberOfLines={1}>
                        {getLocalizedName(tx.account) || 'Kas'} • {formatDate(tx.date, { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={[styles.txMethod, { color: colors.textMuted }]} numberOfLines={1}>
                      {tx.payment_method === 'Transfer Bank' ? t('payment.transfer_bank') :
                       tx.payment_method === 'Tunai' ? t('payment.cash') :
                       tx.payment_method === 'QRIS' ? t('payment.qris') :
                       tx.payment_method === 'Kartu Debit' ? t('payment.debit') :
                       tx.payment_method === 'Giro' ? t('payment.giro') :
                       tx.payment_method === 'Lainnya' ? t('payment.other') : tx.payment_method}
                    </Text>
                  </View>
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
  containerMobile: {
    padding: 14,
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
  kpiContainerMobile: {
    marginBottom: 16,
    gap: 10,
  },
  kpiPairRowMobile: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  kpiCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: 20,
    ...theme.shadows.sm,
  },
  kpiCardHalfMobile: {
    flex: 1,
    minWidth: 0,
    padding: 12,
  },
  kpiCardFullMobile: {
    width: '100%',
    minWidth: '100%',
    padding: 14,
  },
  kpiCardMobile: {
    minWidth: '100%',
    padding: 16,
  },
  kpiLabelMobile: {
    fontSize: 11,
  },
  kpiIconBoxMobile: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  kpiValueMobile: {
    fontSize: 17,
    marginVertical: 2,
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
  accountCardMobile: {
    minWidth: '100%',
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
    marginRight: 12,
    flexShrink: 0,
  },
  txMainCol: {
    flex: 1,
    minWidth: 0,
  },
  txTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
    textAlign: 'right',
  },
  txBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 6,
  },
  txMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  txMetaText: {
    fontSize: 12,
    flex: 1,
    minWidth: 0,
  },
  txMethod: {
    fontSize: 11,
    flexShrink: 0,
  },
});
