import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, theme } from '../theme';
import { accountingService } from '../services/accountingService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function MasterBankAccountsScreen() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formInitialBalance, setFormInitialBalance] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountingService.getAccounts({ all: true, search });
      setAccounts(res.accounts || []);
    } catch (e) {
      console.warn('Load accounts error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [search]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormAccountNumber('');
    setFormInitialBalance('');
    setFormDesc('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (acc) => {
    setSelectedAccount(acc);
    setFormName(acc.name);
    setFormAccountNumber(acc.account_number || '');
    setFormInitialBalance(String(acc.initial_balance || 0));
    setFormDesc(acc.description || '');
    setFormError('');
    setShowEditModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formName.trim()) {
      setFormError('Nama rekening/kas wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await accountingService.createAccount({
        name: formName.trim(),
        account_number: formAccountNumber.trim() || null,
        initial_balance: parseFloat(formInitialBalance) || 0,
        description: formDesc.trim() || null,
      });

      setShowAddModal(false);
      await loadAccounts();
    } catch (e) {
      setFormError(e.message || 'Gagal menambahkan rekening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!formName.trim() || !selectedAccount) {
      setFormError('Nama rekening wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await accountingService.updateAccount(selectedAccount.id, {
        name: formName.trim(),
        account_number: formAccountNumber.trim() || null,
        initial_balance: parseFloat(formInitialBalance) || 0,
        description: formDesc.trim() || null,
      });

      setShowEditModal(false);
      await loadAccounts();
    } catch (e) {
      setFormError(e.message || 'Gagal memperbarui rekening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (acc) => {
    try {
      await accountingService.toggleAccountStatus(acc.id);
      await loadAccounts();
    } catch (e) {
      alert(e.message || 'Gagal mengubah status rekening.');
    }
  };

  const handleDelete = async (acc) => {
    const confirmed = window.confirm
      ? window.confirm(`Apakah Anda yakin ingin menghapus rekening "${acc.name}"?`)
      : true;

    if (!confirmed) return;

    try {
      await accountingService.deleteAccount(acc.id);
      await loadAccounts();
    } catch (e) {
      alert(e.message || 'Gagal menghapus rekening.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.searchBox}>
          <FormInput
            placeholder="Cari rekening atau no. akun..."
            value={search}
            onChangeText={setSearch}
            style={{ marginBottom: 0 }}
          />
        </View>

        <Button
          title="+ Tambah Rekening"
          onPress={handleOpenAdd}
          icon="🏦"
          size="md"
        />
      </View>

      {/* Accounts List Card */}
      <Card
        title="Daftar Rekening Bank & Kas"
        subtitle="Kelola rekening dan kas operasional AUBE TERRA"
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat rekening...</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data rekening ditemukan.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Nama Rekening</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Nomor Akun</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Saldo Awal</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Saldo Berjalan</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Status</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>Aksi</Text>
            </View>

            {/* Table Rows */}
            {accounts.map((acc) => (
              <View key={acc.id} style={styles.tableRow}>
                <View style={[styles.td, { flex: 2 }]}>
                  <Text style={styles.accName}>{acc.name}</Text>
                  {acc.description ? (
                    <Text style={styles.accDesc} numberOfLines={1}>
                      {acc.description}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.td, { flex: 1.5 }]}>
                  <Text style={styles.accNumber}>{acc.account_number || '-'}</Text>
                  <Text style={styles.txCount}>{acc.transactions_count} transaksi</Text>
                </View>

                <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                  <Text style={styles.balanceText}>
                    Rp {Number(acc.initial_balance || 0).toLocaleString('id-ID')}
                  </Text>
                </View>

                <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                  <Text style={[styles.balanceText, { fontWeight: '700', color: colors.primary }]}>
                    Rp {Number(acc.current_balance || 0).toLocaleString('id-ID')}
                  </Text>
                </View>

                <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                  <Badge
                    label={acc.is_active ? 'Aktif' : 'Nonaktif'}
                    variant={acc.is_active ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>

                <View style={[styles.td, { flex: 1.5, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleOpenEdit(acc)}
                    title="Edit"
                  >
                    <Text style={styles.actionBtnText}>✏ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: acc.is_active ? colors.warningBorder : colors.cashInBorder }]}
                    onPress={() => handleToggleStatus(acc)}
                  >
                    <Text style={{ fontSize: 11, color: acc.is_active ? colors.warning : colors.cashIn, fontWeight: '600' }}>
                      {acc.is_active ? 'Matikan' : 'Aktifkan'}
                    </Text>
                  </TouchableOpacity>

                  {acc.transactions_count === 0 && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: colors.cashOutBorder }]}
                      onPress={() => handleDelete(acc)}
                    >
                      <Text style={{ fontSize: 11, color: colors.cashOut, fontWeight: '600' }}>
                        🗑
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Rekening Kas / Bank"
        subtitle="Daftarkan akun rekening atau kas fisik baru"
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowAddModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Simpan Rekening'}
              onPress={handleSaveAdd}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Rekening / Kas"
          placeholder="Contoh: BCA Operasional, Kas Kecil Kantor"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Nomor Rekening"
          placeholder="Contoh: 8271928312 (Kosongkan bila Kas Tunai)"
          value={formAccountNumber}
          onChangeText={setFormAccountNumber}
        />

        <FormInput
          label="Saldo Awal (Rp)"
          placeholder="0"
          value={formInitialBalance}
          onChangeText={setFormInitialBalance}
          keyboardType="numeric"
          helperText="Saldo awal saat pertama kali dicatat ke sistem"
        />

        <FormInput
          label="Keterangan Tambahan"
          placeholder="Keterangan fungsi rekening..."
          value={formDesc}
          onChangeText={setFormDesc}
          multiline
          numberOfLines={2}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Rekening Kas / Bank"
        subtitle={selectedAccount?.name}
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowEditModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Perbarui Rekening'}
              onPress={handleSaveEdit}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Rekening / Kas"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Nomor Rekening"
          value={formAccountNumber}
          onChangeText={setFormAccountNumber}
        />

        <FormInput
          label="Saldo Awal (Rp)"
          value={formInitialBalance}
          onChangeText={setFormInitialBalance}
          keyboardType="numeric"
          helperText={
            selectedAccount?.transactions_count > 0
              ? 'Terkunci: Rekening sudah memiliki transaksi tercatat.'
              : 'Dapat diubah selama belum memiliki transaksi.'
          }
        />

        <FormInput
          label="Keterangan"
          value={formDesc}
          onChangeText={setFormDesc}
          multiline
          numberOfLines={2}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  searchBox: {
    width: 320,
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
    letterSpacing: 0.3,
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
  accName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  accNumber: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  txCount: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
  },
  balanceText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalError: {
    fontSize: 12,
    color: colors.cashOut,
    backgroundColor: colors.cashOutBg,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
  },
});
