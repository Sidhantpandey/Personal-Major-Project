import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import { WeeklyChartItem } from '../data/mockData';

interface BarChartProps {
  data: WeeklyChartItem[];
  title?: string;
  totalAmount?: string;
  trendText?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Weekly Activity',
  totalAmount = '$14,020.00',
  trendText = '+18.4% vs last week',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(3); // default Thursday selected

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.totalAmount}>{totalAmount}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={14} color={colors.success} />
            <Text style={styles.trendText}>{trendText}</Text>
          </View>
        </View>
      </View>

      {/* Chart Bars Area */}
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={item.day}
              style={styles.barColumn}
              activeOpacity={0.7}
              onPress={() => setSelectedIndex(index)}
            >
              {/* Tooltip on top of selected bar */}
              <View style={styles.tooltipContainer}>
                {isSelected && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{item.amount}</Text>
                  </View>
                )}
              </View>

              {/* Bar Track & Fill */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${item.value}%`,
                      backgroundColor: isSelected
                        ? colors.primary
                        : item.isPeak
                        ? colors.accent
                        : colors.chartInactive,
                    },
                  ]}
                />
              </View>

              {/* Day Label */}
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelActive,
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.success,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 24,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  tooltipContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltip: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tooltipText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
  },
  barTrack: {
    width: 22,
    height: 95,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  dayLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.xs,
  },
  dayLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
});
