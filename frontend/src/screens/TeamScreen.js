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
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function TeamScreen() {
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'staff'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('staff');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await userService.getUsers(params);
      setUsers(res.users || []);
    } catch (e) {
      console.warn('Load users error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('staff');
    setFormPassword('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormError('');
    setShowEditModal(true);
  };

  const handleOpenReset = (u) => {
    setSelectedUser(u);
    setFormPassword('');
    setFormError('');
    setShowResetModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      setFormError('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await userService.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      });

      setShowAddModal(false);
      await loadUsers();
    } catch (e) {
      setFormError(e.message || 'Gagal menambahkan anggota tim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!formName.trim() || !formEmail.trim() || !selectedUser) {
      setFormError('Nama dan email wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await userService.updateUser(selectedUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
      });

      setShowEditModal(false);
      await loadUsers();
    } catch (e) {
      setFormError(e.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReset = async () => {
    if (!formPassword || formPassword.length < 6) {
      setFormError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    try {
      setSubmitting(true);
      await userService.resetPassword(selectedUser.id, formPassword);
      setShowResetModal(false);
      alert(`Kata sandi untuk ${selectedUser.name} berhasil di-reset.`);
    } catch (e) {
      setFormError(e.message || 'Gagal me-reset kata sandi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u) => {
    if (u.id === currentUser?.id) {
      alert('Anda tidak dapat menonaktifkan akun Anda sendiri.');
      return;
    }

    try {
      await userService.toggleStatus(u.id);
      await loadUsers();
    } catch (e) {
      alert(e.message || 'Gagal mengubah status aktif pengguna.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Filter and Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterSection}>
          <View style={styles.searchBox}>
            <FormInput
              placeholder="Cari nama atau email tim..."
              value={search}
              onChangeText={setSearch}
              style={{ marginBottom: 0 }}
            />
          </View>

          {/* Role Filter Chips */}
          <View style={styles.chipsRow}>
            {[
              { id: 'all', label: 'Semua Peran' },
              { id: 'admin', label: 'Administrator' },
              { id: 'staff', label: 'Staff Akuntansi' },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.filterChip,
                  roleFilter === c.id && styles.filterChipActive,
                ]}
                onPress={() => setRoleFilter(c.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    roleFilter === c.id && styles.filterChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="+ Tambah Anggota"
          onPress={handleOpenAdd}
          icon="👥"
          size="md"
        />
      </View>

      {/* Users Table Card */}
      <Card
        title="Daftar Pengguna & Staf"
        subtitle="Kelola akses dan akun staf akuntansi AUBE TERRA"
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat anggota tim...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada pengguna ditemukan.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Nama & Email</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Peran Akun</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Transaksi Dibuat</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Status</Text>
              <Text style={[styles.th, { flex: 1.8, textAlign: 'center' }]}>Aksi</Text>
            </View>

            {/* Rows */}
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <View key={u.id} style={styles.tableRow}>
                  <View style={[styles.td, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {u.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.userName}>{u.name}</Text>
                        {isSelf && (
                          <Text style={styles.selfTag}>(Anda)</Text>
                        )}
                      </View>
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Badge
                      label={u.role === 'admin' ? 'Administrator' : 'Staff'}
                      variant={u.role === 'admin' ? 'admin' : 'staff'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Text style={styles.txCountText}>{u.transactions_count || 0} entri</Text>
                  </View>

                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <Badge
                      label={u.is_active ? 'Aktif' : 'Nonaktif'}
                      variant={u.is_active ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  <View
                    style={[
                      styles.td,
                      { flex: 1.8, flexDirection: 'row', justifyContent: 'center', gap: 6 },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleOpenEdit(u)}
                    >
                      <Text style={styles.actionBtnText}>✏ Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleOpenReset(u)}
                    >
                      <Text style={styles.actionBtnText}>🔑 Reset</Text>
                    </TouchableOpacity>

                    {!isSelf && (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {
                            borderColor: u.is_active
                              ? colors.warningBorder
                              : colors.cashInBorder,
                          },
                        ]}
                        onPress={() => handleToggleStatus(u)}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: u.is_active ? colors.warning : colors.cashIn,
                            fontWeight: '600',
                          }}
                        >
                          {u.is_active ? 'Matikan' : 'Aktifkan'}
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
        title="Tambah Akun Tim Baru"
        subtitle="Berikan akses staf akuntansi atau administrator baru"
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowAddModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Buat Akun'}
              onPress={handleSaveAdd}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Lengkap"
          placeholder="Contoh: Rian Anggara"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Alamat Email"
          placeholder="rian@aubeterra.com"
          value={formEmail}
          onChangeText={setFormEmail}
          keyboardType="email-address"
          required
        />

        <FormInput
          label="Kata Sandi Awal"
          placeholder="Minimal 6 karakter"
          value={formPassword}
          onChangeText={setFormPassword}
          secureTextEntry
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Peran Akses (Role) *</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                formRole === 'staff' && styles.roleOptionActive,
              ]}
              onPress={() => setFormRole('staff')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  formRole === 'staff' && styles.roleOptionTitleActive,
                ]}
              >
                Staff Akuntansi
              </Text>
              <Text style={styles.roleOptionSub}>
                Dapat mencatat kas masuk & kas keluar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                formRole === 'admin' && styles.roleOptionActive,
              ]}
              onPress={() => setFormRole('admin')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  formRole === 'admin' && styles.roleOptionTitleActive,
                ]}
              >
                Administrator
              </Text>
              <Text style={styles.roleOptionSub}>
                Akses penuh termasuk Master Data & Tim
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Data Pengguna"
        subtitle={selectedUser?.name}
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowEditModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Perbarui Akun'}
              onPress={handleSaveEdit}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <FormInput
          label="Nama Lengkap"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Alamat Email"
          value={formEmail}
          onChangeText={setFormEmail}
          keyboardType="email-address"
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Peran Akses (Role) *</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                formRole === 'staff' && styles.roleOptionActive,
                selectedUser?.id === currentUser?.id && { opacity: 0.5 },
              ]}
              disabled={selectedUser?.id === currentUser?.id}
              onPress={() => setFormRole('staff')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  formRole === 'staff' && styles.roleOptionTitleActive,
                ]}
              >
                Staff Akuntansi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                formRole === 'admin' && styles.roleOptionActive,
              ]}
              onPress={() => setFormRole('admin')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  formRole === 'admin' && styles.roleOptionTitleActive,
                ]}
              >
                Administrator
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Kata Sandi"
        subtitle={`Atur ulang sandi untuk ${selectedUser?.name}`}
        footer={
          <>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => setShowResetModal(false)}
            />
            <Button
              title={submitting ? 'Menyimpan...' : 'Reset Sandi'}
              onPress={handleSaveReset}
              loading={submitting}
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <Text style={styles.resetWarning}>
          Perhatian: Me-reset kata sandi akan otomatis memutus seluruh sesi login aktif
          pengguna ini di perangkat lain.
        </Text>

        <FormInput
          label="Kata Sandi Baru"
          placeholder="Minimal 6 karakter"
          value={formPassword}
          onChangeText={setFormPassword}
          secureTextEntry
          required
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
    flexWrap: 'wrap',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  searchBox: {
    width: 260,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    fontSize: 12,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selfTag: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
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
    marginBottom: 8,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  roleOptionTitleActive: {
    color: colors.primary,
  },
  roleOptionSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  resetWarning: {
    fontSize: 12,
    color: colors.warning,
    backgroundColor: colors.warningBg,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
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
