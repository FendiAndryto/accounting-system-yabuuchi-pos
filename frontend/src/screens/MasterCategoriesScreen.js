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
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function MasterCategoriesScreen() {
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
    const confirmed = window.confirm
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Filter and Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterChipsRow}>
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'cash_in', label: '🟢 Cash In' },
            { id: 'cash_out', label: '🔴 Cash Out' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.filterChip,
                typeFilter === chip.id && styles.filterChipActive,
              ]}
              onPress={() => setTypeFilter(chip.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === chip.id && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="+ Tambah Kategori"
          onPress={handleOpenAdd}
          icon="🏷️"
          size="md"
        />
      </View>

      {/* Categories Card */}
      <Card
        title="Daftar Kategori Kas"
        subtitle="Klasifikasi pos arus kas masuk dan keluar"
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat kategori...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data kategori ditemukan.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Nama Kategori</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Tipe Kas</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Penggunaan Transaksi</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Status</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>Aksi</Text>
            </View>

            {/* Rows */}
            {categories.map((cat) => {
              const isIn = cat.type === 'cash_in';
              return (
                <View key={cat.id} style={styles.tableRow}>
                  <View style={[styles.td, { flex: 2 }]}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    {cat.description ? (
                      <Text style={styles.catDesc} numberOfLines={1}>
                        {cat.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Badge
                      label={isIn ? 'Cash In (Masuk)' : 'Cash Out (Keluar)'}
                      variant={isIn ? 'cash_in' : 'cash_out'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Text style={styles.txCountText}>{cat.transactions_count} transaksi</Text>
                  </View>

                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <Badge
                      label={cat.is_active ? 'Aktif' : 'Nonaktif'}
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
                      style={styles.actionBtn}
                      onPress={() => handleOpenEdit(cat)}
                    >
                      <Text style={styles.actionBtnText}>✏ Edit</Text>
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
                        {cat.is_active ? 'Matikan' : 'Aktifkan'}
                      </Text>
                    </TouchableOpacity>

                    {cat.transactions_count === 0 && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: colors.cashOutBorder }]}
                        onPress={() => handleDelete(cat)}
                      >
                        <Text style={{ fontSize: 11, color: colors.cashOut, fontWeight: '600' }}>
                          🗑
                        </Text>
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
        title="Tambah Kategori Baru"
        subtitle="Pos pencatatan arus kas"
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowAddModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Simpan Kategori'}
              onPress={handleSaveAdd}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Kategori"
          placeholder="Contoh: Pembayaran Klien, Sewa Kantor, Gaji Karyawan"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipe Arus Kas *</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                formType === 'cash_in' && styles.typeOptionActiveIn,
              ]}
              onPress={() => setFormType('cash_in')}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  formType === 'cash_in' && { color: colors.cashIn, fontWeight: '700' },
                ]}
              >
                🟢 Cash In (Pemasukan)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                formType === 'cash_out' && styles.typeOptionActiveOut,
              ]}
              onPress={() => setFormType('cash_out')}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  formType === 'cash_out' && { color: colors.cashOut, fontWeight: '700' },
                ]}
              >
                🔴 Cash Out (Pengeluaran)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FormInput
          label="Deskripsi / Catatan"
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
        title="Edit Kategori"
        subtitle={selectedCategory?.name}
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowEditModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Perbarui Kategori'}
              onPress={handleSaveEdit}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Kategori"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipe Arus Kas *</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                formType === 'cash_in' && styles.typeOptionActiveIn,
                selectedCategory?.transactions_count > 0 && { opacity: 0.6 },
              ]}
              disabled={selectedCategory?.transactions_count > 0}
              onPress={() => setFormType('cash_in')}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  formType === 'cash_in' && { color: colors.cashIn, fontWeight: '700' },
                ]}
              >
                🟢 Cash In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                formType === 'cash_out' && styles.typeOptionActiveOut,
                selectedCategory?.transactions_count > 0 && { opacity: 0.6 },
              ]}
              disabled={selectedCategory?.transactions_count > 0}
              onPress={() => setFormType('cash_out')}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  formType === 'cash_out' && { color: colors.cashOut, fontWeight: '700' },
                ]}
              >
                🔴 Cash Out
              </Text>
            </TouchableOpacity>
          </View>
          {selectedCategory?.transactions_count > 0 && (
            <Text style={styles.fieldHelper}>
              Tipe dikunci karena kategori ini sudah dipakai dalam transaksi tercatat.
            </Text>
          )}
        </View>

        <FormInput
          label="Deskripsi / Catatan"
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
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  txCountText: {
    fontSize: 13,
    color: colors.textSecondary,
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
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  fieldHelper: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  typeOptionActiveIn: {
    backgroundColor: colors.cashInBg,
    borderColor: colors.cashInBorder,
  },
  typeOptionActiveOut: {
    backgroundColor: colors.cashOutBg,
    borderColor: colors.cashOutBorder,
  },
  typeOptionText: {
    fontSize: 13,
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
