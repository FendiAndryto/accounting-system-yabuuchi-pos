import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, theme } from '../../theme';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surfaceSecondary,
          border: colors.border,
          text: colors.textPrimary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.textSecondary,
        };
      case 'danger':
        return {
          bg: colors.cashOut,
          border: colors.cashOut,
          text: '#ffffff',
        };
      case 'danger-outline':
        return {
          bg: 'transparent',
          border: colors.cashOutBorder,
          text: colors.cashOut,
        };
      case 'success':
        return {
          bg: colors.cashIn,
          border: colors.cashIn,
          text: '#ffffff',
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: '#ffffff',
        };
    }
  };

  const current = getVariantStyle();
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: disabled ? colors.surfaceSecondary : current.bg,
          borderColor: disabled ? colors.border : current.border,
          paddingVertical: isSm ? 6 : isLg ? 14 : 10,
          paddingHorizontal: isSm ? 12 : isLg ? 20 : 16,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={current.text === '#ffffff' ? '#ffffff' : colors.primary}
        />
      ) : (
        <>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? colors.textMuted : current.text,
                fontSize: isSm ? 13 : isLg ? 16 : 14,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
