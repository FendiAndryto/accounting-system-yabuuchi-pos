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
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function MasterBankAccountsScreen() {
  const { colors } = useTheme();
  const { t, formatCurrency, getLocalizedName } = useLanguage();
  const { isMobile } = useResponsive();
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
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameJa, setFormNameJa] = useState('');
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
    setFormNameEn('');
    setFormNameJa('');
    setFormAccountNumber('');
    setFormInitialBalance('');
    setFormDesc('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (acc) => {
    setSelectedAccount(acc);
    setFormName(acc.name);
    setFormNameEn(acc.name_en || '');
    setFormNameJa(acc.name_ja || '');
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
        name_en: formNameEn.trim() || null,
        name_ja: formNameJa.trim() || null,
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
        name_en: formNameEn.trim() || null,
        name_ja: formNameJa.trim() || null,
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
    const confirmed = typeof window !== 'undefined' && window.confirm
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
    <ScrollView
      style={[
        styles.container,
        isMobile && styles.containerMobile,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.searchBox}>
          <FormInput
            placeholder={t('action.search')}
            value={search}
            onChangeText={setSearch}
            style={{ marginBottom: 0 }}
          />
        </View>

        <Button
          title={t('master.add_account')}
          onPress={handleOpenAdd}
          icon={<Feather name="plus" size={15} color="#ffffff" />}
          size="md"
        />
      </View>

      {/* Accounts List Card */}
      <Card
        title={t('screen.master_accounts.title')}
        subtitle={t('screen.master_accounts.subtitle')}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('action.refreshing')}</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.all')}: 0 data</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1, minWidth: '100%' }}
          >
            <View style={[styles.table, { minWidth: 840 }]}>
              {/* Table Header */}
              <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 2.2 }]}>{t('master.bank_name')}</Text>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5 }]}>{t('master.account_no')}</Text>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>{t('master.init_balance')}</Text>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>{t('dashboard.total_balance')}</Text>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>{t('common.status')}</Text>
                <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5, textAlign: 'center' }]}>{t('action.actions')}</Text>
              </View>

              {/* Table Rows */}
              {accounts.map((acc) => (
                <View key={acc.id} style={[styles.tableRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.td, { flex: 2.2 }]}>
                    <Text style={[styles.accName, { color: colors.textPrimary }]}>{getLocalizedName(acc)}</Text>
                    {(acc.name_en || acc.name_ja) && (
                      <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 2 }}>
                        {[acc.name_en && `EN: ${acc.name_en}`, acc.name_ja && `JA: ${acc.name_ja}`].filter(Boolean).join(' • ')}
                      </Text>
                    )}
                    {acc.description ? (
                      <Text style={[styles.accDesc, { color: colors.textMuted }]} numberOfLines={1}>
                        {acc.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Text style={[styles.accNumber, { color: colors.textSecondary }]}>{acc.account_number || '-'}</Text>
                    <Text style={[styles.txCount, { color: colors.textLight }]}>{acc.transactions_count} {t('nav.transactions').toLowerCase()}</Text>
                  </View>

                  <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                    <Text style={[styles.balanceText, { color: colors.textPrimary }]}>
                      {formatCurrency(acc.initial_balance || 0)}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1.5, alignItems: 'flex-end' }]}>
                    <Text style={[styles.balanceText, { fontWeight: '700', color: colors.primary }]}>
                      {formatCurrency(acc.current_balance || 0)}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <Badge
                      label={acc.is_active ? t('common.active') : t('common.inactive')}
                      variant={acc.is_active ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.5, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleOpenEdit(acc)}
                      title={t('action.edit')}
                    >
                      <Feather name="edit-2" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>{t('action.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: acc.is_active ? colors.warningBorder : colors.cashInBorder }]}
                      onPress={() => handleToggleStatus(acc)}
                    >
                      <Text style={{ fontSize: 11, color: acc.is_active ? colors.warning : colors.cashIn, fontWeight: '600' }}>
                        {acc.is_active ? 'Off' : 'On'}
                      </Text>
                    </TouchableOpacity>

                    {acc.transactions_count === 0 && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: colors.cashOutBorder }]}
                        onPress={() => handleDelete(acc)}
                      >
                        <Feather name="trash-2" size={12} color={colors.cashOut} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('master.add_account')}
        subtitle={t('screen.master_accounts.subtitle')}
        footer={
          <>
            <Button
              title={t('action.cancel')}
              variant="outline"
              onPress={() => setShowAddModal(false)}
            />
            <Button
              title={submitting ? t('action.refreshing') : t('action.save')}
              onPress={handleSaveAdd}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>{formError}</Text> : null}

        <FormInput
          label={t('master.bank_name')}
          required
          value={formName}
          onChangeText={setFormName}
          placeholder="e.g. BCA Operasional, Kas Kecil"
        />

        <FormInput
          label={t('master.name_en')}
          value={formNameEn}
          onChangeText={setFormNameEn}
          placeholder="e.g. BCA Operational, Petty Cash"
        />

        <FormInput
          label={t('master.name_ja')}
          value={formNameJa}
          onChangeText={setFormNameJa}
          placeholder="e.g. BCA運営口座, 小口現金"
        />

        <FormInput
          label={t('master.account_no')}
          value={formAccountNumber}
          onChangeText={setFormAccountNumber}
          placeholder="e.g. 1234567890"
        />

        <FormInput
          label={t('master.init_balance')}
          value={formInitialBalance}
          onChangeText={setFormInitialBalance}
          keyboardType="numeric"
          placeholder="0"
          helperText="IDR basis"
        />

        <FormInput
          label={t('common.notes')}
          value={formDesc}
          onChangeText={setFormDesc}
          multiline
          numberOfLines={2}
          placeholder="Catatan..."
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('master.edit_account')}
        subtitle={selectedAccount?.name}
        footer={
          <>
            <Button
              title={t('action.cancel')}
              variant="outline"
              onPress={() => setShowEditModal(false)}
            />
            <Button
              title={submitting ? t('action.refreshing') : t('action.save')}
              onPress={handleSaveEdit}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>{formError}</Text> : null}

        <FormInput
          label={t('master.bank_name')}
          required
          value={formName}
          onChangeText={setFormName}
        />

        <FormInput
          label={t('master.name_en')}
          value={formNameEn}
          onChangeText={setFormNameEn}
        />

        <FormInput
          label={t('master.name_ja')}
          value={formNameJa}
          onChangeText={setFormNameJa}
        />

        <FormInput
          label={t('master.account_no')}
          value={formAccountNumber}
          onChangeText={setFormAccountNumber}
        />

        <FormInput
          label={t('master.init_balance')}
          value={formInitialBalance}
          onChangeText={setFormInitialBalance}
          keyboardType="numeric"
        />

        <FormInput
          label={t('common.notes')}
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
  containerMobile: {
    padding: 14,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
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
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  td: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  accName: {
    fontSize: 14,
    fontWeight: '700',
  },
  accDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  accNumber: {
    fontSize: 13,
    fontWeight: '500',
  },
  txCount: {
    fontSize: 11,
    marginTop: 1,
  },
  balanceText: {
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalError: {
    fontSize: 12,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
  },
});
