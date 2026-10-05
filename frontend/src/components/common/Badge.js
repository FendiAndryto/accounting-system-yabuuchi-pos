import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function Badge({ label, variant = 'default', size = 'md' }) {
  const { colors } = useTheme();

  const getStyles = () => {
    switch (variant) {
      case 'success':
      case 'cash_in':
        return {
          bg: colors.cashInBg,
          border: colors.cashInBorder,
          text: colors.cashIn,
        };
      case 'danger':
      case 'cash_out':
        return {
          bg: colors.cashOutBg,
          border: colors.cashOutBorder,
          text: colors.cashOut,
        };
      case 'primary':
      case 'admin':
        return {
          bg: colors.primarySubtle,
          border: colors.primaryLight,
          text: colors.primary,
        };
      case 'warning':
        return {
          bg: colors.warningBg,
          border: colors.warningBorder,
          text: colors.warning,
        };
      case 'neutral':
      case 'staff':
      default:
        return {
          bg: colors.surfaceSecondary,
          border: colors.border,
          text: colors.textSecondary,
        };
    }
  };

  const current = getStyles();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: current.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
