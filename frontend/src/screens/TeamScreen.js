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
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';

export function TeamScreen() {
  const { user: currentUser } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

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
    try {
      await userService.toggleUserStatus(u.id);
      await loadUsers();
    } catch (e) {
      alert(e.message || 'Gagal mengubah status pengguna.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Action and Filter Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterSection}>
          <View style={styles.searchBox}>
            <FormInput
              placeholder={t('action.search')}
              value={search}
              onChangeText={setSearch}
              style={{ marginBottom: 0 }}
            />
          </View>

          {/* Role Filters */}
          <View style={styles.chipsRow}>
            {[
              { id: 'all', label: t('common.all') },
              { id: 'admin', label: t('common.admin') },
              { id: 'staff', label: t('common.staff') },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  roleFilter === c.id && { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight },
                ]}
                onPress={() => setRoleFilter(c.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    roleFilter === c.id && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={t('nav.team')}
          onPress={handleOpenAdd}
          icon={<Feather name="users" size={14} color="#ffffff" />}
          size="md"
        />
      </View>

      {/* Users Table Card */}
      <Card
        title={t('screen.team.title')}
        subtitle={t('screen.team.subtitle')}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('action.refreshing')}</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.all')}: 0 data</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>{t('common.user')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.2 }]}>{t('common.role')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.2 }]}>{t('nav.transactions')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>{t('common.status')}</Text>
              <Text style={[styles.th, { color: colors.textSecondary, flex: 1.8, textAlign: 'center' }]}>{t('action.actions')}</Text>
            </View>

            {/* Rows */}
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <View key={u.id} style={[styles.tableRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.td, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {u.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.userName, { color: colors.textPrimary }]}>{u.name}</Text>
                        {isSelf && (
                          <Text style={[styles.selfTag, { color: colors.primary }]}>({t('common.user')})</Text>
                        )}
                      </View>
                      <Text style={[styles.userEmail, { color: colors.textMuted }]}>{u.email}</Text>
                    </View>
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Badge
                      label={u.role === 'admin' ? t('common.admin') : t('common.staff')}
                      variant={u.role === 'admin' ? 'admin' : 'staff'}
                      size="sm"
                    />
                  </View>

                  <View style={[styles.td, { flex: 1.2 }]}>
                    <Text style={[styles.txCountText, { color: colors.textSecondary }]}>{u.transactions_count || 0} entri</Text>
                  </View>

                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <Badge
                      label={u.is_active ? t('common.active') : t('common.inactive')}
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
                      style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleOpenEdit(u)}
                    >
                      <Feather name="edit-2" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>{t('action.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleOpenReset(u)}
                    >
                      <Feather name="key" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Reset</Text>
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
                          {u.is_active ? 'Off' : 'On'}
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
        title={t('nav.team')}
        subtitle={t('screen.team.subtitle')}
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
          label={t('common.user')}
          placeholder="e.g. John Doe"
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Email"
          placeholder="user@aubeterra.id"
          value={formEmail}
          onChangeText={setFormEmail}
          keyboardType="email-address"
          required
        />

        <FormInput
          label="Password"
          placeholder="Minimal 6 karakter"
          value={formPassword}
          onChangeText={setFormPassword}
          secureTextEntry
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('common.role')} *</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formRole === 'staff' && { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
              ]}
              onPress={() => setFormRole('staff')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  { color: colors.textPrimary },
                  formRole === 'staff' && { color: colors.primary },
                ]}
              >
                {t('common.staff')}
              </Text>
              <Text style={[styles.roleOptionSub, { color: colors.textMuted }]}>
                Akses pencatatan kas masuk & keluar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formRole === 'admin' && { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
              ]}
              onPress={() => setFormRole('admin')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  { color: colors.textPrimary },
                  formRole === 'admin' && { color: colors.primary },
                ]}
              >
                {t('common.admin')}
              </Text>
              <Text style={[styles.roleOptionSub, { color: colors.textMuted }]}>
                Akses penuh sistem & kelola pengguna
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('action.edit')}
        subtitle={selectedUser?.name}
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
          label={t('common.user')}
          value={formName}
          onChangeText={setFormName}
          required
        />

        <FormInput
          label="Email"
          value={formEmail}
          onChangeText={setFormEmail}
          keyboardType="email-address"
          required
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>{t('common.role')} *</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formRole === 'staff' && { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
              ]}
              onPress={() => setFormRole('staff')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  { color: colors.textPrimary },
                  formRole === 'staff' && { color: colors.primary },
                ]}
              >
                {t('common.staff')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formRole === 'admin' && { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
              ]}
              onPress={() => setFormRole('admin')}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  { color: colors.textPrimary },
                  formRole === 'admin' && { color: colors.primary },
                ]}
              >
                {t('common.admin')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Password"
        subtitle={selectedUser?.name}
        footer={
          <>
            <Button
              title={t('action.cancel')}
              variant="outline"
              onPress={() => setShowResetModal(false)}
            />
            <Button
              title={submitting ? t('action.refreshing') : 'Reset Password'}
              onPress={handleSaveReset}
              loading={submitting}
              variant="danger"
            />
          </>
        }
      >
        {formError ? <Text style={styles.modalError}>⚠ {formError}</Text> : null}

        <Text style={[styles.resetWarning, { color: colors.warning, backgroundColor: colors.warningBg }]}>
          Kata sandi pengguna ini akan langsung diperbarui. Pastikan menginformasikan kata sandi baru kepada pengguna.
        </Text>

        <FormInput
          label="Password Baru"
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
  },
  filterChipText: {
    fontSize: 12,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 13,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  selfTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
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
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleOptionSub: {
    fontSize: 11,
  },
  resetWarning: {
    fontSize: 12,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
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
