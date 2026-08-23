export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
  unreadNotifications: number;
}

export interface MetricItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  iconName: string;
  bgColor: string;
  iconColor: string;
}

export interface WeeklyChartItem {
  day: string;
  value: number; // 0 to 100 percentage
  amount: string;
  isPeak?: boolean;
}

export interface ActivityItemData {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: string;
  isIncome: boolean;
  status: 'Completed' | 'Pending' | 'Failed';
  iconName: string;
  iconBg: string;
  iconColor: string;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  client: string;
  progress: number; // 0-100
  dueDate: string;
  badgeColor: string;
  status: 'In Progress' | 'Review' | 'Done';
}

export const mockUser: UserProfile = {
  name: 'Alex Morgan',
  role: 'Product Manager',
  unreadNotifications: 3,
};

export const mockMetrics: MetricItem[] = [
  {
    id: '1',
    title: 'Total Balance',
    value: '$28,450.80',
    change: '+14.2%',
    isPositive: true,
    iconName: 'wallet-outline',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: '2',
    title: 'Monthly Revenue',
    value: '$12,820.00',
    change: '+8.4%',
    isPositive: true,
    iconName: 'trending-up-outline',
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: '3',
    title: 'Total Expenses',
    value: '$3,410.50',
    change: '-2.1%',
    isPositive: false,
    iconName: 'card-outline',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
  {
    id: '4',
    title: 'Active Projects',
    value: '24 Tasks',
    change: '+5 New',
    isPositive: true,
    iconName: 'briefcase-outline',
    iconBg: '#F5F3FF',
    iconColor: '#8B5CF6',
  },
];

export const mockQuickActions: QuickActionItem[] = [
  {
    id: '1',
    label: 'Send',
    iconName: 'paper-plane-outline',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: '2',
    label: 'Receive',
    iconName: 'arrow-down-circle-outline',
    bgColor: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: '3',
    label: 'Analytics',
    iconName: 'bar-chart-outline',
    bgColor: '#F5F3FF',
    iconColor: '#8B5CF6',
  },
  {
    id: '4',
    label: 'Invoices',
    iconName: 'receipt-outline',
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: '5',
    label: 'Top Up',
    iconName: 'add-circle-outline',
    bgColor: '#ECFEFF',
    iconColor: '#0891B2',
  },
  {
    id: '6',
    label: 'More',
    iconName: 'ellipsis-horizontal-circle-outline',
    bgColor: '#F1F5F9',
    iconColor: '#475569',
  },
];

export const mockWeeklyChartData: WeeklyChartItem[] = [
  { day: 'Mon', value: 45, amount: '$1.4k' },
  { day: 'Tue', value: 65, amount: '$2.1k' },
  { day: 'Wed', value: 35, amount: '$1.1k' },
  { day: 'Thu', value: 88, amount: '$3.2k', isPeak: true },
  { day: 'Fri', value: 72, amount: '$2.6k' },
  { day: 'Sat', value: 50, amount: '$1.7k' },
  { day: 'Sun', value: 60, amount: '$1.9k' },
];

export const mockActivities: ActivityItemData[] = [
  {
    id: 'tx-1',
    title: 'Design Subscription',
    category: 'Software & Tools',
    date: 'Today, 2:45 PM',
    amount: '-$48.00',
    isIncome: false,
    status: 'Completed',
    iconName: 'color-palette-outline',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 'tx-2',
    title: 'Client Payment - Acme Corp',
    category: 'Freelance Project',
    date: 'Today, 10:15 AM',
    amount: '+$2,450.00',
    isIncome: true,
    status: 'Completed',
    iconName: 'arrow-down-circle-outline',
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'tx-3',
    title: 'Cloud Server Infrastructure',
    category: 'Hosting & Dev',
    date: 'Yesterday, 6:30 PM',
    amount: '-$129.90',
    isIncome: false,
    status: 'Completed',
    iconName: 'cloud-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'tx-4',
    title: 'Mobile App Wireframes',
    category: 'Consulting',
    date: 'Aug 19, 3:20 PM',
    amount: '+$850.00',
    isIncome: true,
    status: 'Completed',
    iconName: 'phone-portrait-outline',
    iconBg: '#F5F3FF',
    iconColor: '#8B5CF6',
  },
  {
    id: 'tx-5',
    title: 'Office Coffee & Supplies',
    category: 'Operations',
    date: 'Aug 18, 11:05 AM',
    amount: '-$34.50',
    isIncome: false,
    status: 'Pending',
    iconName: 'cart-outline',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
];

export const mockProjects: ProjectTaskItem[] = [
  {
    id: 'p-1',
    title: 'Mobile Banking Redesign',
    client: 'FinTech Global',
    progress: 82,
    dueDate: '2 days left',
    badgeColor: '#4F46E5',
    status: 'In Progress',
  },
  {
    id: 'p-2',
    title: 'Analytics Dashboard Kit',
    client: 'SaaS Studio',
    progress: 95,
    dueDate: 'Tomorrow',
    badgeColor: '#10B981',
    status: 'Review',
  },
  {
    id: 'p-3',
    title: 'Customer Onboarding Flow',
    client: 'NexGen Apps',
    progress: 45,
    dueDate: 'Next week',
    badgeColor: '#F59E0B',
    status: 'In Progress',
  },
];
