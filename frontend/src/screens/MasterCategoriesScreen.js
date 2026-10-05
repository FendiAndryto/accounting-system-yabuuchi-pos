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
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function MasterCategoriesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'cash_in' | 'cash_out'
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('cash_in');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = { all: true };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();

      const res = await accountingService.getCategories(params);
      setCategories(res.categories || []);
    } catch (e) {
      console.warn('Load categories error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [typeFilter, search]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormType('cash_in');
    setFormDesc('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormDesc(cat.description || '');
    setFormError('');
    setShowEditModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formName.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await accountingService.createCategory({
        name: formName.trim(),
        type: formType,
        description: formDesc.trim() || null,
      });

      setShowAddModal(false);
      await loadCategories();
    } catch (e) {
      setFormError(e.message || 'Gagal menambahkan kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!formName.trim() || !selectedCategory) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await accountingService.updateCategory(selectedCategory.id, {
        name: formName.trim(),
        type: formType,
        description: formDesc.trim() || null,
      });

      setShowEditModal(false);
      await loadCategories();
    } catch (e) {
      setFormError(e.message || 'Gagal memperbarui kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await accountingService.toggleCategoryStatus(cat.id);
      await loadCategories();
    } catch (e) {
      alert(e.message || 'Gagal mengubah status kategori.');
    }
  };

  const handleDelete = async (cat) => {
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)
      : true;

    if (!confirmed) return;

    try {
      await accountingService.deleteCategory(cat.id);
      await loadCategories();
    } catch (e) {
      alert(e.message || 'Gagal menghapus kategori.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Top Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterChipsRow}>
          {[
            { key: 'all', label: t('common.all') },
            { key: 'cash_in', label: t('nav.cash_in') },
            { key: 'cash_out', label: t('nav.cash_out') },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                typeFilter === item.key && { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight },
              ]}
              onPress={() => setTypeFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  typeFilter === item.key && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={t('master.add_category')}
          onPress={handleOpenAdd}
          icon={<Feather name="tag" size={14} color="#ffffff" />}
          size="md"
        />
      </View>

      {/* Categories Card */}
      <Card
        title={t('screen.master_categories.title')}
        subtitle={t('screen.master_categories.subtitle')}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('action.refreshing')}</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.all')}: 0 data</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>{t('master.category_name')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5 }]}>{t('master.category_type')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5 }]}>{t('nav.transactions')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>{t('common.status')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5, textAlign: 'center' }]}>{t('action.actions')}</Text>
            </View>

            {/* Rows */}
            {categories.map((cat) => {
              const isIn = cat.type === 'cash_in';
              return (
                <View key={cat.id} style={[styles.tableRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.td, { flex: 2 }]}>
                    <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.name}</Text>
                    {cat.description ? (
                      <Text style={[styles.catDesc, { color: colors.textMuted }]} numberOfLines={1}>
                        {cat.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Badge
                      label={isIn ? t('nav.cash_in') : t('nav.cash_out')}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Text style={[styles.txCountText, { color: colors.textSecondary }]}>
                      {cat.transactions_count} {t('nav.transactions').toLowerCase()}
                    </Text>
                  </View>

                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <Badge
                      label={cat.is_active ? t('common.active') : t('common.inactive')}
                      variant={cat.is_active ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  <View
                    style={[
                      styles.td,
                      { flex: 1.5, flexDirection: 'row', justifyContent: 'center', gap: 6 },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleOpenEdit(cat)}
                    >
                      <Feather name="edit-2" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>{t('action.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          borderColor: cat.is_active
                            ? colors.warningBorder
                            : colors.cashInBorder,
                        },
                      ]}
                      onPress={() => handleToggleStatus(cat)}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: cat.is_active ? colors.warning : colors.cashIn,
                          fontWeight: '600',
                        }}
                      >
                        {cat.is_active ? 'Off' : 'On'}
                      </Text>
                    </TouchableOpacity>

                    {cat.transactions_count === 0 && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: colors.cashOutBorder }]}
                        onPress={() => handleDelete(cat)}
                      >
                        <Feather name="trash-2" size={12} color={colors.cashOut} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('master.add_category')}
        subtitle={t('screen.master_categories.subtitle')}
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
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label={t('master.category_name')}
          placeholder="e.g. Pembayaran Klien, Sewa Kantor"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('master.category_type')} *</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formType === 'cash_in' && { backgroundColor: colors.cashInBg, borderColor: colors.cashInBorder },
              ]}
              onPress={() => setFormType('cash_in')}
            >
              <Feather name="arrow-down-left" size={14} color={colors.cashIn} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textSecondary },
                  formType === 'cash_in' && { color: colors.cashIn, fontWeight: '700' },
                ]}
              >
                {t('nav.cash_in')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formType === 'cash_out' && { backgroundColor: colors.cashOutBg, borderColor: colors.cashOutBorder },
              ]}
              onPress={() => setFormType('cash_out')}
            >
              <Feather name="arrow-up-right" size={14} color={colors.cashOut} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textSecondary },
                  formType === 'cash_out' && { color: colors.cashOut, fontWeight: '700' },
                ]}
              >
                {t('nav.cash_out')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FormInput
          label={t('common.notes')}
          placeholder="Keterangan singkat kategori ini..."
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
        title={t('master.edit_category')}
        subtitle={selectedCategory?.name}
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
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label={t('master.category_name')}
          value={formName}
          onChangeText={setFormName}
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('master.category_type')} *</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formType === 'cash_in' && { backgroundColor: colors.cashInBg, borderColor: colors.cashInBorder },
                selectedCategory?.transactions_count > 0 && { opacity: 0.6 },
              ]}
              disabled={selectedCategory?.transactions_count > 0}
              onPress={() => setFormType('cash_in')}
            >
              <Feather name="arrow-down-left" size={14} color={colors.cashIn} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textSecondary },
                  formType === 'cash_in' && { color: colors.cashIn, fontWeight: '700' },
                ]}
              >
                {t('nav.cash_in')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formType === 'cash_out' && { backgroundColor: colors.cashOutBg, borderColor: colors.cashOutBorder },
                selectedCategory?.transactions_count > 0 && { opacity: 0.6 },
              ]}
              disabled={selectedCategory?.transactions_count > 0}
              onPress={() => setFormType('cash_out')}
            >
              <Feather name="arrow-up-right" size={14} color={colors.cashOut} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textSecondary },
                  formType === 'cash_out' && { color: colors.cashOut, fontWeight: '700' },
                ]}
              >
                {t('nav.cash_out')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
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
    letterSpacing: 0.3,
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
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  txCountText: {
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
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionText: {
    fontSize: 13,
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
