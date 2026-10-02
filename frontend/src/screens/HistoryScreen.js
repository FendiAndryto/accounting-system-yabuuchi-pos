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
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { FormInput } from '../components/common/FormInput';

export function HistoryScreen() {
  const { isAdmin } = useAuth();

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
    const confirmed = window.confirm
      ? window.confirm(`Apakah Anda yakin ingin menghapus transaksi "${tx.description || 'ini'}" sebesar Rp ${Number(tx.amount).toLocaleString('id-ID')}?`)
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Ledger Summary */}
      {summary && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Data</Text>
            <Text style={styles.summaryValue}>{summary.count || transactions.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Kas Masuk</Text>
            <Text style={[styles.summaryValue, { color: colors.cashIn }]}>
              {summary.total_cash_in_formatted || 'Rp 0'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Kas Keluar</Text>
            <Text style={[styles.summaryValue, { color: colors.cashOut }]}>
              {summary.total_cash_out_formatted || 'Rp 0'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Arus Kas Bersih (Net)</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {summary.net_flow_formatted || 'Rp 0'}
            </Text>
          </View>
        </View>
      )}

      {/* Filter and Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <FormInput
            placeholder="Cari deskripsi, memo transaksi..."
            value={search}
            onChangeText={setSearch}
            style={{ marginBottom: 0 }}
          />
        </View>

        <View style={styles.chipsRow}>
          {[
            { id: 'all', label: 'Semua Transaksi' },
            { id: 'cash_in', label: '🟢 Cash In' },
            { id: 'cash_out', label: '🔴 Cash Out' },
          ].map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.filterChip,
                filterType === c.id && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(c.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === c.id && styles.filterChipTextActive,
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
        title="Buku Besar Riwayat Transaksi"
        subtitle="Daftar menyeluruh transaksi keuangan yang tercatat"
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat buku besar...</Text>
          </View>
        ) : !Array.isArray(transactions) || transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada riwayat transaksi yang cocok.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>Tanggal</Text>
              <Text style={[styles.th, { flex: 2 }]}>Keterangan / Memo</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Kategori</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Rekening</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Nominal (Rp)</Text>
              <Text style={[styles.th, { flex: 1 }]}>Metode</Text>
              <Text style={[styles.th, { flex: 1 }]}>Pencatat</Text>
              {isAdmin && <Text style={[styles.th, { flex: 0.8, textAlign: 'center' }]}>Aksi</Text>}
            </View>

            {/* Rows */}
            {transactions.map((tx) => {
              const isIn = tx.type === 'cash_in';
              return (
                <View key={tx.id} style={styles.tableRow}>
                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={styles.tdDate}>{tx.date}</Text>
                  </View>

                  <View style={[styles.td, { flex: 2 }]}>
                    <Text style={styles.tdDesc} numberOfLines={2}>
                      {tx.description || (isIn ? 'Kas Masuk' : 'Kas Keluar')}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Badge
                      label={tx.category?.name || 'Umum'}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Text style={styles.tdAccount}>{tx.account?.name || '-'}</Text>
                  </View>

                  <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                    <Text
                      style={[
                        styles.tdAmount,
                        { color: isIn ? colors.cashIn : colors.cashOut },
                      ]}
                    >
                      {isIn ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={styles.tdMethod}>{tx.payment_method}</Text>
                  </View>

                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={styles.tdCreator}>{tx.creator?.name || 'Sistem'}</Text>
                  </View>

                  {isAdmin && (
                    <View style={[styles.td, { flex: 0.8, alignItems: 'center' }]}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(tx)}
                        title="Hapus Transaksi"
                      >
                        <Text style={styles.deleteBtnText}>🗑</Text>
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
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  td: {
    justifyContent: 'center',
  },
  tdDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tdDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tdAccount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tdAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  tdMethod: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tdCreator: {
    fontSize: 12,
    color: colors.textLight,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cashOutBorder,
    backgroundColor: colors.cashOutBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 11,
    color: colors.cashOut,
  },
});
