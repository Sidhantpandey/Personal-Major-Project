import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import { QuickActionItem } from '../data/mockData';

interface QuickActionProps {
  action: QuickActionItem;
  onPress?: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ action, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconButton, { backgroundColor: action.bgColor }]}>
        <Ionicons name={action.iconName as any} size={22} color={action.iconColor} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 68,
    marginHorizontal: 4,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
});
