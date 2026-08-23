import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';

export const AnalyticsScreen: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');

  const categories = [
    { name: 'Software & Dev Tools', percentage: 38, amount: '$4,870.00', color: colors.primary },
    { name: 'Marketing & Ads', percentage: 26, amount: '$3,320.00', color: colors.accent },
    { name: 'Office & Operations', percentage: 18, amount: '$2,300.00', color: colors.warning },
    { name: 'Consulting & Freelance', percentage: 18, amount: '$2,330.00', color: colors.success },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Analytics</Text>
        <Text style={styles.headerSubtitle}>Track and inspect your expense distribution</Text>
      </View>

      {/* Period Filter Tabs */}
      <View style={styles.periodTabs}>
        {(['Day', 'Week', 'Month', 'Year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodTab, activePeriod === period && styles.periodTabActive]}
            onPress={() => setActivePeriod(period)}
          >
            <Text
              style={[
                styles.periodTabText,
                activePeriod === period && styles.periodTabTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Revenue Generated</Text>
        <Text style={styles.statsValue}>$128,450.00</Text>
        <View style={styles.growthBadge}>
          <Ionicons name="trending-up" size={14} color={colors.success} />
          <Text style={styles.growthText}>+22.4% vs previous {activePeriod.toLowerCase()}</Text>
        </View>

        <View style={styles.statBreakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Net Profit</Text>
            <Text style={[styles.breakdownValue, { color: colors.success }]}>$94,200</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Avg / Day</Text>
            <Text style={styles.breakdownValue}>$4,280</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Tax Res.</Text>
            <Text style={[styles.breakdownValue, { color: colors.danger }]}>$18,400</Text>
          </View>
        </View>
      </View>

      {/* Category Spending Breakdown */}
      <Text style={styles.sectionTitle}>Spending by Category</Text>
      <View style={styles.categoriesCard}>
        {categories.map((cat, index) => (
          <View
            key={cat.name}
            style={[styles.categoryRow, index !== categories.length - 1 && styles.rowDivider]}
          >
            <View style={styles.catHeader}>
              <View style={styles.catTitleWrap}>
                <View style={[styles.catColorDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.name}</Text>
              </View>
              <Text style={styles.catAmount}>{cat.amount}</Text>
            </View>

            <View style={styles.catBarTrack}>
              <View
                style={[
                  styles.catBarFill,
                  { width: `${cat.percentage}%`, backgroundColor: cat.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Export Report CTA */}
      <TouchableOpacity
        style={styles.exportBtn}
        onPress={() => Alert.alert('Export', 'Report generated successfully (PDF/CSV)')}
        activeOpacity={0.8}
      >
        <Ionicons name="download-outline" size={18} color={colors.textInverse} />
        <Text style={styles.exportBtnText}>Download Monthly Financial Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodTabActive: {
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  periodTabText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.textMuted,
  },
  periodTabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  statsValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginVertical: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  growthText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success,
    fontWeight: typography.fontWeights.semiBold,
  },
  statBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.cardBorder,
    alignSelf: 'center',
  },
  breakdownLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  categoriesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryRow: {
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  catAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  catBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exportBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  exportBtnText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
});
