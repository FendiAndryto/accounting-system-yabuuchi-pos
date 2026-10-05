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
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { FormInput } from '../components/common/FormInput';

export function HistoryScreen() {
  const { isAdmin } = useAuth();
  const { colors } = useTheme();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'cash_in' | 'cash_out'
  const [search, setSearch] = useState('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (search.trim()) params.search = search.trim();

      const res = await accountingService.getTransactions(params);
      const txList = Array.isArray(res?.transactions)
        ? res.transactions
        : Array.isArray(res?.transactions?.data)
        ? res.transactions.data
        : [];
      setTransactions(txList);
      setSummary(res.summary || null);
    } catch (e) {
      console.warn('Load history transactions error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filterType, search]);

  const handleDelete = async (tx) => {
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm(`${t('history.delete_confirm')}\n"${tx.description || 'Transaksi'}" - ${formatCurrency(tx.amount)}`)
      : true;

    if (!confirmed) return;

    try {
      await accountingService.deleteTransaction(tx.id);
      await loadTransactions();
    } catch (e) {
      alert(e.message || 'Gagal menghapus transaksi.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Top Ledger Summary */}
      {summary && (
        <View style={[styles.summaryRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('common.all')}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{summary.count || transactions.length}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('dashboard.total_cash_in')}</Text>
            <Text style={[styles.summaryValue, { color: colors.cashIn }]}>
              {formatCurrency(summary.total_cash_in || 0)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('dashboard.total_cash_out')}</Text>
            <Text style={[styles.summaryValue, { color: colors.cashOut }]}>
              {formatCurrency(summary.total_cash_out || 0)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('dashboard.net_flow')}</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCurrency(summary.net_flow || 0)}
            </Text>
          </View>
        </View>
      )}

      {/* Filter and Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <FormInput
            placeholder={t('history.search_placeholder')}
            value={search}
            onChangeText={setSearch}
            style={{ marginBottom: 0 }}
          />
        </View>

        <View style={styles.chipsRow}>
          {[
            { id: 'all', label: t('history.filter_all') },
            { id: 'cash_in', label: t('history.filter_in'), icon: 'arrow-down-left', color: colors.cashIn },
            { id: 'cash_out', label: t('history.filter_out'), icon: 'arrow-up-right', color: colors.cashOut },
          ].map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                filterType === c.id && { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight },
              ]}
              onPress={() => setFilterType(c.id)}
            >
              {c.icon && (
                <Feather
                  name={c.icon}
                  size={12}
                  color={filterType === c.id ? colors.primary : c.color}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  filterType === c.id && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transactions Ledger Card */}
      <Card
        title={t('screen.history.title')}
        subtitle={t('screen.history.subtitle')}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('action.refreshing')}</Text>
          </View>
        ) : !Array.isArray(transactions) || transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('dashboard.no_transactions')}</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>{t('common.date')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>{t('common.notes')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.2 }]}>{t('common.category')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.2 }]}>{t('common.account')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>{t('common.amount')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>Metode</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>Staff</Text>
              {isAdmin && <Text style={[styles.th, { color: colors.textSecondary, flex: 0.8, textAlign: 'center' }]}>{t('action.actions')}</Text>}
            </View>

            {/* Rows */}
            {transactions.map((tx) => {
              const isIn = tx.type === 'cash_in';
              return (
                <View key={tx.id} style={[styles.tableRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={[styles.tdDate, { color: colors.textSecondary }]}>
                      {formatDate(tx.date, { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 2 }]}>
                    <Text style={[styles.tdDesc, { color: colors.textPrimary }]} numberOfLines={2}>
                      {tx.description || (isIn ? t('nav.cash_in') : t('nav.cash_out'))}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Badge
                      label={tx.category?.name || t('common.all')}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Text style={[styles.tdAccount, { color: colors.textSecondary }]}>{tx.account?.name || '-'}</Text>
                  </View>

                  <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                    <Text
                      style={[
                        styles.tdAmount,
                        { color: isIn ? colors.cashIn : colors.cashOut },
                      ]}
                    >
                      {isIn ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={[styles.tdMethod, { color: colors.textMuted }]}>{tx.payment_method}</Text>
                  </View>

                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={[styles.tdCreator, { color: colors.textLight }]}>{tx.creator?.name || 'Sistem'}</Text>
                  </View>

                  {isAdmin && (
                    <View style={[styles.td, { flex: 0.8, alignItems: 'center' }]}>
                      <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: colors.cashOutBg, borderColor: colors.cashOutBorder }]}
                        onPress={() => handleDelete(tx)}
                        title={t('action.delete')}
                      >
                        <Feather name="trash-2" size={12} color={colors.cashOut} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
  summaryRow: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  td: {
    justifyContent: 'center',
  },
  tdDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  tdDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  tdAccount: {
    fontSize: 12,
  },
  tdAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  tdMethod: {
    fontSize: 12,
  },
  tdCreator: {
    fontSize: 12,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
