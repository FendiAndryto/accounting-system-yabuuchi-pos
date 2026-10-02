import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Badge } from './common/Badge';

export function Sidebar({ activeScreen, onSelectScreen }) {
  const { user, isAdmin, logout } = useAuth();

  // Accordion state for Master Data and Transaksi
  const [masterOpen, setMasterOpen] = useState(
    activeScreen === 'master_accounts' || activeScreen === 'master_categories'
  );
  const [transaksiOpen, setTransaksiOpen] = useState(
    activeScreen === 'cash_in' || activeScreen === 'cash_out'
  );

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>AT</Text>
        </View>
        <View style={styles.brandTextContainer}>
          <Text style={styles.brandTitle}>AUBE TERRA</Text>
          <Text style={styles.brandSubtitle}>Accounting System</Text>
        </View>
      </View>

      {/* Nav List */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.navSection}>
          <Text style={styles.navSectionHeader}>MENU UTAMA</Text>

          {/* 1. Dashboard */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              activeScreen === 'dashboard' && styles.navItemActive,
            ]}
            onPress={() => onSelectScreen('dashboard')}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text
              style={[
                styles.navLabel,
                activeScreen === 'dashboard' && styles.navLabelActive,
              ]}
            >
              Dashboard
            </Text>
            {activeScreen === 'dashboard' && <View style={styles.activePill} />}
          </TouchableOpacity>

          {/* 2. Master Data (Dropdown / Accordion) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              (activeScreen === 'master_accounts' || activeScreen === 'master_categories') &&
                styles.navItemParentActive,
            ]}
            onPress={() => setMasterOpen((prev) => !prev)}
          >
            <Text style={styles.navIcon}>📁</Text>
            <Text
              style={[
                styles.navLabel,
                (activeScreen === 'master_accounts' || activeScreen === 'master_categories') &&
                  styles.navLabelActive,
              ]}
            >
              Master Data
            </Text>
            <Text style={styles.chevronIcon}>{masterOpen ? '▾' : '▸'}</Text>
          </TouchableOpacity>

          {/* Master Data Children */}
          {masterOpen && (
            <View style={styles.submenuContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  activeScreen === 'master_accounts' && styles.submenuItemActive,
                ]}
                onPress={() => onSelectScreen('master_accounts')}
              >
                <Text style={styles.submenuDot}>•</Text>
                <Text
                  style={[
                    styles.submenuLabel,
                    activeScreen === 'master_accounts' && styles.submenuLabelActive,
                  ]}
                >
                  Rekening Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  activeScreen === 'master_categories' && styles.submenuItemActive,
                ]}
                onPress={() => onSelectScreen('master_categories')}
              >
                <Text style={styles.submenuDot}>•</Text>
                <Text
                  style={[
                    styles.submenuLabel,
                    activeScreen === 'master_categories' && styles.submenuLabelActive,
                  ]}
                >
                  Kategori
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Transaksi (Dropdown / Accordion) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              (activeScreen === 'cash_in' || activeScreen === 'cash_out') &&
                styles.navItemParentActive,
            ]}
            onPress={() => setTransaksiOpen((prev) => !prev)}
          >
            <Text style={styles.navIcon}>💳</Text>
            <Text
              style={[
                styles.navLabel,
                (activeScreen === 'cash_in' || activeScreen === 'cash_out') &&
                  styles.navLabelActive,
              ]}
            >
              Transaksi
            </Text>
            <Text style={styles.chevronIcon}>{transaksiOpen ? '▾' : '▸'}</Text>
          </TouchableOpacity>

          {/* Transaksi Children */}
          {transaksiOpen && (
            <View style={styles.submenuContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  activeScreen === 'cash_in' && styles.submenuItemActive,
                ]}
                onPress={() => onSelectScreen('cash_in')}
              >
                <View style={[styles.typeIndicatorDot, { backgroundColor: colors.cashIn }]} />
                <Text
                  style={[
                    styles.submenuLabel,
                    activeScreen === 'cash_in' && styles.submenuLabelActive,
                  ]}
                >
                  Cash In (Pemasukan)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  activeScreen === 'cash_out' && styles.submenuItemActive,
                ]}
                onPress={() => onSelectScreen('cash_out')}
              >
                <View style={[styles.typeIndicatorDot, { backgroundColor: colors.cashOut }]} />
                <Text
                  style={[
                    styles.submenuLabel,
                    activeScreen === 'cash_out' && styles.submenuLabelActive,
                  ]}
                >
                  Cash Out (Pengeluaran)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 4. History (Buku Besar) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              activeScreen === 'history' && styles.navItemActive,
            ]}
            onPress={() => onSelectScreen('history')}
          >
            <Text style={styles.navIcon}>📜</Text>
            <Text
              style={[
                styles.navLabel,
                activeScreen === 'history' && styles.navLabelActive,
              ]}
            >
              History
            </Text>
            {activeScreen === 'history' && <View style={styles.activePill} />}
          </TouchableOpacity>

          {/* 5. Manage Team (Admin Only) */}
          {isAdmin && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.navSectionHeader}>ADMINISTRASI</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.navItem,
                  activeScreen === 'team' && styles.navItemActive,
                ]}
                onPress={() => onSelectScreen('team')}
              >
                <Text style={styles.navIcon}>👥</Text>
                <Text
                  style={[
                    styles.navLabel,
                    activeScreen === 'team' && styles.navLabelActive,
                  ]}
                >
                  Manage Team
                </Text>
                {activeScreen === 'team' && <View style={styles.activePill} />}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* User Footer Profile & Logout */}
      <View style={styles.userFooter}>
        <View style={styles.userInfoRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Pengguna'}
            </Text>
            <View style={{ marginTop: 2 }}>
              <Badge
                label={user?.role === 'admin' ? 'Administrator' : 'Staff'}
                variant={user?.role === 'admin' ? 'admin' : 'staff'}
                size="sm"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.logoutBtn}
          onPress={logout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: colors.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: colors.sidebarBorder,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  brandContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...theme.shadows.sm,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  navScroll: {
    flex: 1,
  },
  navSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  navSectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 4,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: colors.sidebarItemActiveBg,
  },
  navItemParentActive: {
    backgroundColor: colors.surfaceSecondary,
  },
  navIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.sidebarText,
    flex: 1,
  },
  navLabelActive: {
    color: colors.sidebarTextActive,
    fontWeight: '700',
  },
  chevronIcon: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  },
  activePill: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 8,
  },
  submenuContainer: {
    paddingLeft: 28,
    paddingRight: 8,
    marginBottom: 6,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.borderLight,
    marginLeft: 22,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 2,
  },
  submenuItemActive: {
    backgroundColor: colors.sidebarItemActiveBg,
  },
  submenuDot: {
    color: colors.textLight,
    fontSize: 14,
    marginRight: 8,
  },
  typeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  submenuLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  submenuLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  userFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
