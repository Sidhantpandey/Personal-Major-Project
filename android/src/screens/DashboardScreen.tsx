import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import {
  mockUser,
  mockMetrics,
  mockQuickActions,
  mockWeeklyChartData,
  mockActivities,
  mockProjects,
  ActivityItemData,
} from '../data/mockData';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { QuickAction } from '../components/QuickAction';
import { BarChart } from '../components/BarChart';
import { ActivityItem } from '../components/ActivityItem';

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<ActivityItemData[]>(mockActivities);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const handleActionPress = (label: string) => {
    Alert.alert(label, `Triggered action: ${label}`);
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', `You have ${mockUser.unreadNotifications} unread updates.`);
  };

  // Filter activities based on search query
  const filteredActivities = activities.filter((act) =>
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.helloWorldBanner}>
        <Text style={styles.helloWorldText}>👋 Hello World!</Text>
      </View>
      <Header
        user={mockUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationPress={handleNotificationPress}
        onFilterPress={() => Alert.alert('Filter', 'Filter options')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* KPI Metric Cards Grid */}
        <View style={styles.metricsContainer}>
          {mockMetrics.map((item) => (
            <MetricCard
              key={item.id}
              item={item}
              onPress={() => Alert.alert(item.title, `Current: ${item.value} (${item.change})`)}
            />
          ))}
        </View>

        {/* Quick Action Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity onPress={() => Alert.alert('Shortcuts', 'Manage shortcuts')}>
            <Text style={styles.sectionLink}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {mockQuickActions.map((action) => (
            <QuickAction
              key={action.id}
              action={action}
              onPress={() => handleActionPress(action.label)}
            />
          ))}
        </ScrollView>

        {/* Weekly Activity / Performance Chart */}
        <BarChart data={mockWeeklyChartData} />

        {/* Ongoing Projects / Tasks Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Projects</Text>
          <TouchableOpacity onPress={() => Alert.alert('Projects', 'View all projects')}>
            <Text style={styles.sectionLink}>View All ({mockProjects.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectsContainer}>
          {mockProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectTop}>
                <View>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectClient}>{project.client}</Text>
                </View>
                <View
                  style={[
                    styles.projectStatusBadge,
                    {
                      backgroundColor:
                        project.status === 'Review' ? colors.successLight : colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.projectStatusText,
                      {
                        color:
                          project.status === 'Review' ? colors.success : colors.primary,
                      },
                    ]}
                  >
                    {project.status}
                  </Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${project.progress}%`, backgroundColor: project.badgeColor },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>{project.progress}%</Text>
              </View>

              <View style={styles.projectBottom}>
                <View style={styles.dueDateContainer}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.dueDateText}>{project.dueDate}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity / Transaction Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => Alert.alert('Transactions', 'View full history')}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesContainer}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((item, index) => (
              <ActivityItem
                key={item.id}
                item={item}
                isLast={index === filteredActivities.length - 1}
                onPress={() =>
                  Alert.alert(item.title, `Category: ${item.category}\nAmount: ${item.amount}\nStatus: ${item.status}`)
                }
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>No transactions found for "{searchQuery}"</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  helloWorldBanner: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloWorldText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primary,
  },
  quickActionsScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  projectsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  projectCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  projectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  projectTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  projectClient: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  projectStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  projectStatusText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
  projectBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  activitiesContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
  },
});
