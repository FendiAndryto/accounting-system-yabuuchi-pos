import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../context/ResponsiveContext';
import { Badge } from './common/Badge';

export function Sidebar({ activeScreen, onSelectScreen }) {
  const { user, isAdmin, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet, isDesktop, sidebarOpen, setSidebarOpen } = useResponsive();

  // Accordion state for Master Data and Transaksi
  const [masterOpen, setMasterOpen] = useState(
    activeScreen === 'master_accounts' || activeScreen === 'master_categories'
  );
  const [transaksiOpen, setTransaksiOpen] = useState(
    activeScreen === 'cash_in' || activeScreen === 'cash_out'
  );

  const handleNavigate = (screen) => {
    onSelectScreen(screen);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      )}
      <View
        style={[
          styles.sidebar,
          isTablet && styles.sidebarTablet,
          isMobile && styles.sidebarMobileDrawer,
          { backgroundColor: colors.sidebarBg, borderRightColor: colors.sidebarBorder },
        ]}
      >
        {/* Brand Header */}
        <View style={[styles.brandContainer, isTablet && styles.brandContainerTablet, { borderBottomColor: colors.borderLight }]}>
          <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {!isTablet && (
            <View style={styles.brandTextContainer}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>{t('app.title')}</Text>
              <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>{t('app.subtitle')}</Text>
            </View>
          )}
          {isMobile && (
            <TouchableOpacity
              style={[styles.closeDrawerBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setSidebarOpen(false)}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

      {/* Nav List */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.navSection}>
          {!isTablet && <Text style={[styles.navSectionHeader, { color: colors.textLight }]}>{t('nav.main_menu')}</Text>}

          {/* 1. Dashboard */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              isTablet && styles.navItemTablet,
              activeScreen === 'dashboard' && { backgroundColor: colors.sidebarItemActiveBg },
            ]}
            onPress={() => handleNavigate('dashboard')}
            title={isTablet ? t('nav.dashboard') : undefined}
          >
            <Feather
              name="bar-chart-2"
              size={17}
              color={activeScreen === 'dashboard' ? colors.primary : colors.sidebarText}
              style={[styles.navIcon, isTablet && styles.navIconTablet]}
            />
            {!isTablet && (
              <Text
                style={[
                  styles.navLabel,
                  { color: activeScreen === 'dashboard' ? colors.sidebarTextActive : colors.sidebarText },
                  activeScreen === 'dashboard' && styles.navLabelActive,
                ]}
              >
                {t('nav.dashboard')}
              </Text>
            )}
            {activeScreen === 'dashboard' && <View style={[styles.activePill, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          {/* 2. Master Data (Dropdown / Accordion) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              isTablet && styles.navItemTablet,
              (activeScreen === 'master_accounts' || activeScreen === 'master_categories') && {
                backgroundColor: colors.surfaceSecondary,
              },
            ]}
            onPress={() => setMasterOpen((prev) => !prev)}
            title={isTablet ? t('nav.master_data') : undefined}
          >
            <Feather
              name="folder"
              size={17}
              color={
                activeScreen === 'master_accounts' || activeScreen === 'master_categories'
                  ? colors.primary
                  : colors.sidebarText
              }
              style={[styles.navIcon, isTablet && styles.navIconTablet]}
            />
            {!isTablet && (
              <>
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color:
                        activeScreen === 'master_accounts' || activeScreen === 'master_categories'
                          ? colors.sidebarTextActive
                          : colors.sidebarText,
                    },
                    (activeScreen === 'master_accounts' || activeScreen === 'master_categories') &&
                      styles.navLabelActive,
                  ]}
                >
                  {t('nav.master_data')}
                </Text>
                <Feather
                  name={masterOpen ? 'chevron-down' : 'chevron-right'}
                  size={14}
                  color={colors.textMuted}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Master Data Children */}
          {masterOpen && (
            <View style={[styles.submenuContainer, isTablet && styles.submenuContainerTablet, { borderLeftColor: colors.borderLight }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  isTablet && styles.submenuItemTablet,
                  activeScreen === 'master_accounts' && { backgroundColor: colors.sidebarItemActiveBg },
                ]}
                onPress={() => handleNavigate('master_accounts')}
                title={isTablet ? t('nav.master_accounts') : undefined}
              >
                <Feather
                  name="credit-card"
                  size={12}
                  color={activeScreen === 'master_accounts' ? colors.primary : colors.textLight}
                  style={[styles.submenuIcon, isTablet && styles.submenuIconTablet]}
                />
                {!isTablet && (
                  <Text
                    style={[
                      styles.submenuLabel,
                      { color: activeScreen === 'master_accounts' ? colors.primary : colors.textSecondary },
                      activeScreen === 'master_accounts' && styles.submenuLabelActive,
                    ]}
                  >
                    {t('nav.master_accounts')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  isTablet && styles.submenuItemTablet,
                  activeScreen === 'master_categories' && { backgroundColor: colors.sidebarItemActiveBg },
                ]}
                onPress={() => handleNavigate('master_categories')}
                title={isTablet ? t('nav.master_categories') : undefined}
              >
                <Feather
                  name="tag"
                  size={12}
                  color={activeScreen === 'master_categories' ? colors.primary : colors.textLight}
                  style={[styles.submenuIcon, isTablet && styles.submenuIconTablet]}
                />
                {!isTablet && (
                  <Text
                    style={[
                      styles.submenuLabel,
                      { color: activeScreen === 'master_categories' ? colors.primary : colors.textSecondary },
                      activeScreen === 'master_categories' && styles.submenuLabelActive,
                    ]}
                  >
                    {t('nav.master_categories')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Transaksi (Dropdown / Accordion) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              isTablet && styles.navItemTablet,
              (activeScreen === 'cash_in' || activeScreen === 'cash_out') && {
                backgroundColor: colors.surfaceSecondary,
              },
            ]}
            onPress={() => setTransaksiOpen((prev) => !prev)}
            title={isTablet ? t('nav.transactions') : undefined}
          >
            <Feather
              name="repeat"
              size={17}
              color={
                activeScreen === 'cash_in' || activeScreen === 'cash_out'
                  ? colors.primary
                  : colors.sidebarText
              }
              style={[styles.navIcon, isTablet && styles.navIconTablet]}
            />
            {!isTablet && (
              <>
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color:
                        activeScreen === 'cash_in' || activeScreen === 'cash_out'
                          ? colors.sidebarTextActive
                          : colors.sidebarText,
                    },
                    (activeScreen === 'cash_in' || activeScreen === 'cash_out') &&
                      styles.navLabelActive,
                  ]}
                >
                  {t('nav.transactions')}
                </Text>
                <Feather
                  name={transaksiOpen ? 'chevron-down' : 'chevron-right'}
                  size={14}
                  color={colors.textMuted}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Transaksi Children */}
          {transaksiOpen && (
            <View style={[styles.submenuContainer, isTablet && styles.submenuContainerTablet, { borderLeftColor: colors.borderLight }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  isTablet && styles.submenuItemTablet,
                  activeScreen === 'cash_in' && { backgroundColor: colors.sidebarItemActiveBg },
                ]}
                onPress={() => handleNavigate('cash_in')}
                title={isTablet ? t('nav.cash_in') : undefined}
              >
                <View style={[styles.typeIndicatorDot, { backgroundColor: colors.cashIn, marginRight: isTablet ? 0 : 8 }]} />
                {!isTablet && (
                  <Text
                    style={[
                      styles.submenuLabel,
                      { color: activeScreen === 'cash_in' ? colors.cashIn : colors.textSecondary },
                      activeScreen === 'cash_in' && styles.submenuLabelActive,
                    ]}
                  >
                    {t('nav.cash_in')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.submenuItem,
                  isTablet && styles.submenuItemTablet,
                  activeScreen === 'cash_out' && { backgroundColor: colors.sidebarItemActiveBg },
                ]}
                onPress={() => handleNavigate('cash_out')}
                title={isTablet ? t('nav.cash_out') : undefined}
              >
                <View style={[styles.typeIndicatorDot, { backgroundColor: colors.cashOut, marginRight: isTablet ? 0 : 8 }]} />
                {!isTablet && (
                  <Text
                    style={[
                      styles.submenuLabel,
                      { color: activeScreen === 'cash_out' ? colors.cashOut : colors.textSecondary },
                      activeScreen === 'cash_out' && styles.submenuLabelActive,
                    ]}
                  >
                    {t('nav.cash_out')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 4. History (Buku Besar) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.navItem,
              isTablet && styles.navItemTablet,
              activeScreen === 'history' && { backgroundColor: colors.sidebarItemActiveBg },
            ]}
            onPress={() => handleNavigate('history')}
            title={isTablet ? t('nav.history') : undefined}
          >
            <Feather
              name="file-text"
              size={17}
              color={activeScreen === 'history' ? colors.primary : colors.sidebarText}
              style={[styles.navIcon, isTablet && styles.navIconTablet]}
            />
            {!isTablet && (
              <Text
                style={[
                  styles.navLabel,
                  { color: activeScreen === 'history' ? colors.sidebarTextActive : colors.sidebarText },
                  activeScreen === 'history' && styles.navLabelActive,
                ]}
              >
                {t('nav.history')}
              </Text>
            )}
            {activeScreen === 'history' && <View style={[styles.activePill, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          {/* 5. Manage Team (Admin Only) */}
          {isAdmin && (
            <>
              <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
              {!isTablet && <Text style={[styles.navSectionHeader, { color: colors.textLight }]}>{t('nav.administration')}</Text>}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.navItem,
                  isTablet && styles.navItemTablet,
                  activeScreen === 'team' && { backgroundColor: colors.sidebarItemActiveBg },
                ]}
                onPress={() => handleNavigate('team')}
                title={isTablet ? t('nav.team') : undefined}
              >
                <Feather
                  name="users"
                  size={17}
                  color={activeScreen === 'team' ? colors.primary : colors.sidebarText}
                  style={[styles.navIcon, isTablet && styles.navIconTablet]}
                />
                {!isTablet && (
                  <Text
                    style={[
                      styles.navLabel,
                      { color: activeScreen === 'team' ? colors.sidebarTextActive : colors.sidebarText },
                      activeScreen === 'team' && styles.navLabelActive,
                    ]}
                  >
                    {t('nav.team')}
                  </Text>
                )}
                {activeScreen === 'team' && <View style={[styles.activePill, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* User Footer Profile & Logout */}
      <View style={[styles.userFooter, isTablet && styles.userFooterTablet, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        {!isTablet ? (
          <>
            <View style={styles.userInfoRow}>
              <View style={[styles.userAvatar, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}>
                <Text style={[styles.userAvatarText, { color: colors.primary }]}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user?.name || t('common.user')}
                </Text>
                <View style={{ marginTop: 2 }}>
                  <Badge
                    label={user?.role === 'admin' ? t('common.admin') : t('common.staff')}
                    variant={user?.role === 'admin' ? 'admin' : 'staff'}
                    size="sm"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.logoutBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={logout}
            >
              <Feather name="log-out" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.logoutText, { color: colors.textSecondary }]}>{t('nav.logout')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.logoutBtnTablet, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={logout}
            title={t('nav.logout')}
          >
            <Feather name="log-out" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    borderRightWidth: 1,
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
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    padding: 3,
    ...theme.shadows.sm,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
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
  navIcon: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    fontWeight: '700',
  },
  activePill: {
    width: 4,
    height: 18,
    borderRadius: 2,
    position: 'absolute',
    right: 8,
  },
  submenuContainer: {
    paddingLeft: 22,
    paddingRight: 8,
    marginBottom: 6,
    borderLeftWidth: 1.5,
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
  submenuIcon: {
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
    fontWeight: '500',
  },
  submenuLabelActive: {
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  userFooter: {
    padding: 16,
    borderTopWidth: 1,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    fontWeight: '700',
    fontSize: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sidebarTablet: {
    width: 72,
    alignItems: 'center',
  },
  sidebarMobileDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  brandContainerTablet: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  closeDrawerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  navItemTablet: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  navIconTablet: {
    marginRight: 0,
  },
  submenuContainerTablet: {
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    borderLeftWidth: 0,
    alignItems: 'center',
  },
  submenuItemTablet: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 10,
    width: 44,
  },
  submenuIconTablet: {
    marginRight: 0,
  },
  userFooterTablet: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnTablet: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
