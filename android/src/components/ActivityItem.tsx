import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import { ActivityItemData } from '../data/mockData';

interface ActivityItemProps {
  item: ActivityItemData;
  onPress?: () => void;
  isLast?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ item, onPress, isLast }) => {
  const getStatusBadgeStyle = (status: ActivityItemData['status']) => {
    switch (status) {
      case 'Completed':
        return { bg: colors.successLight, text: colors.success };
      case 'Pending':
        return { bg: colors.warningLight, text: colors.warning };
      case 'Failed':
        return { bg: colors.dangerLight, text: colors.danger };
      default:
        return { bg: colors.surfaceAlt, text: colors.textSecondary };
    }
  };

  const statusStyle = getStatusBadgeStyle(item.status);

  return (
    <TouchableOpacity
      style={[styles.container, !isLast && styles.borderBottom]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.iconName as any} size={20} color={item.iconColor} />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle}>
          {item.category} • {item.date}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: item.isIncome ? colors.success : colors.textPrimary },
          ]}
        >
          {item.amount}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailsContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.semiBold,
  },
});
