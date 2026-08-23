import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';

export type TabKey = 'dashboard' | 'analytics' | 'wallet' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onTabSelect: (tab: TabKey) => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  iconActive: string;
  iconInactive: string;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Home',
    iconActive: 'grid',
    iconInactive: 'grid-outline',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    iconActive: 'stats-chart',
    iconInactive: 'stats-chart-outline',
  },
  {
    key: 'wallet',
    label: 'Wallet',
    iconActive: 'wallet',
    iconInactive: 'wallet-outline',
  },
  {
    key: 'profile',
    label: 'Profile',
    iconActive: 'person',
    iconInactive: 'person-outline',
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabSelect }) => {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabButton}
            onPress={() => onTabSelect(item.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={(isActive ? item.iconActive : item.iconInactive) as any}
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  iconWrapperActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: typography.fontWeights.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
});
