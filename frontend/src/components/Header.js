import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../theme';

export function Header({ title, subtitle, onRefresh, refreshing, rightElement }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t, formatDate } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentDate = formatDate(new Date(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const languages = [
    { code: 'id', label: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'ja', label: 'JA', name: '日本語', flag: '🇯🇵' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>

      <View style={styles.rightContainer}>
        {/* Date Badge with soft Feather calendar icon */}
        <View style={[styles.dateBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
          <Feather name="calendar" size={13} color={colors.textMuted} style={styles.iconSpaced} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{currentDate}</Text>
        </View>

        {/* Currency Benchmark info tag when non-ID is selected */}
        {language !== 'id' && (
          <View style={[styles.rateBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
            <Text style={[styles.rateText, { color: colors.textMuted }]}>
              {language === 'en' ? '1 USD ≈ Rp 16k' : '1 JPY ≈ Rp 105'}
            </Text>
          </View>
        )}

        {/* Language Selector Dropdown / Pill */}
        <View style={styles.langWrapper}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => setLangMenuOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={14} color={colors.primary} style={styles.iconSpaced} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>
              {currentLangObj.label}
            </Text>
            <Feather
              name={langMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={colors.textMuted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {langMenuOpen && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border, ...theme.shadows.md }]}>
              {languages.map((l) => {
                const isActive = l.code === language;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[
                      styles.dropdownItem,
                      isActive && { backgroundColor: colors.primarySubtle },
                    ]}
                    onPress={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langFlag}>{l.flag}</Text>
                    <View style={styles.langTextGroup}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: isActive ? colors.primary : colors.textPrimary },
                          isActive && { fontWeight: '700' },
                        ]}
                      >
                        {l.name}
                      </Text>
                      <Text style={[styles.langCodeBadge, { color: colors.textMuted }]}>({l.label})</Text>
                    </View>
                    {isActive && <Feather name="check" size={13} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Theme Mode Toggle Button */}
        <TouchableOpacity
          style={[styles.controlBtn, styles.themeToggleBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
          title={isDark ? t('theme.light') : t('theme.dark')}
        >
          <Feather
            name={isDark ? 'sun' : 'moon'}
            size={15}
            color={isDark ? '#fbbf24' : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Refresh Button */}
        {onRefresh && (
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}
            onPress={onRefresh}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            <Feather
              name="refresh-cw"
              size={13}
              color={colors.primary}
              style={[styles.iconSpaced, refreshing && { transform: [{ rotate: '45deg' }] }]}
            />
            <Text style={[styles.refreshText, { color: colors.primary }]}>
              {refreshing ? t('action.refreshing') : t('action.refresh')}
            </Text>
          </TouchableOpacity>
        )}

        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    borderBottomWidth: 1,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  iconSpaced: {
    marginRight: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rateBadge: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  langWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    height: 34,
  },
  themeToggleBtn: {
    width: 36,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 160,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 4,
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  langFlag: {
    fontSize: 14,
  },
  langTextGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  langCodeBadge: {
    fontSize: 11,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    height: 34,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
