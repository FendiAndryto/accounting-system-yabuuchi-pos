import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../context/ResponsiveContext';
import { theme } from '../../theme';

export function Card({ title, subtitle, headerRight, children, style, bodyStyle }) {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {(title || subtitle || headerRight) && (
        <View
          style={[
            styles.header,
            isMobile && styles.headerMobile,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            {title && <Text style={[styles.title, isMobile && styles.titleMobile, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text>}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.body, isMobile && styles.bodyMobile, bodyStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: 16,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMobile: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  titleMobile: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 12,
    flexShrink: 0,
  },
  body: {
    padding: 20,
  },
  bodyMobile: {
    padding: 14,
  },
});
