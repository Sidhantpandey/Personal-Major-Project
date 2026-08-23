import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';

export const WalletScreen: React.FC = () => {
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);

  const cards = [
    { id: 'c1', bank: 'Chase Platinum Visa', last4: '4892', type: 'Primary Card' },
    { id: 'c2', bank: 'Apple Master Card', last4: '9012', type: 'Secondary Card' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet & Cards</Text>
        <Text style={styles.headerSubtitle}>Manage payment methods and virtual cards</Text>
      </View>

      {/* Sleek Virtual Debit Card */}
      <View style={styles.virtualCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardBank}>CORPORATE PLATINUM</Text>
          <Ionicons name="card" size={24} color={colors.textInverse} />
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip} />
          <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.7)" />
        </View>

        <Text style={styles.cardNumber}>••••  ••••  ••••  4892</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>CARD HOLDER</Text>
            <Text style={styles.cardValue}>ALEX MORGAN</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>08/29</Text>
          </View>
        </View>
      </View>

      {/* Quick Balance Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Add Money', 'Add funds to wallet')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="add-circle" size={22} color={colors.primary} />
          </View>
          <Text style={styles.actionBtnLabel}>Add Money</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Transfer', 'Send funds to bank or contact')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.successLight }]}>
            <Ionicons name="paper-plane" size={22} color={colors.success} />
          </View>
          <Text style={styles.actionBtnLabel}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Statements', 'Download statement')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="document-text" size={22} color={colors.accent} />
          </View>
          <Text style={styles.actionBtnLabel}>Statement</Text>
        </TouchableOpacity>
      </View>

      {/* Card Settings / Security */}
      <Text style={styles.sectionTitle}>Card Controls</Text>
      <View style={styles.controlsCard}>
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} />
            <View style={styles.controlTexts}>
              <Text style={styles.controlTitle}>Freeze Card</Text>
              <Text style={styles.controlSubtitle}>Temporarily block transactions</Text>
            </View>
          </View>
          <Switch
            value={isCardFrozen}
            onValueChange={setIsCardFrozen}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
          />
        </View>

        <View style={[styles.controlRow, styles.controlDivider]}>
          <View style={styles.controlInfo}>
            <Ionicons name="globe-outline" size={20} color={colors.textPrimary} />
            <View style={styles.controlTexts}>
              <Text style={styles.controlTitle}>Online Payments</Text>
              <Text style={styles.controlSubtitle}>Enable e-commerce transactions</Text>
            </View>
          </View>
          <Switch
            value={onlinePayments}
            onValueChange={setOnlinePayments}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
          />
        </View>
      </View>

      {/* Linked Accounts */}
      <Text style={styles.sectionTitle}>Linked Accounts</Text>
      <View style={styles.linkedCards}>
        {cards.map((c, i) => (
          <View key={c.id} style={[styles.linkedItem, i !== cards.length - 1 && styles.itemDivider]}>
            <View style={styles.linkedInfo}>
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.bankName}>{c.bank}</Text>
                <Text style={styles.accountType}>{c.type} •••• {c.last4}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        ))}
      </View>
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
    marginBottom: spacing.lg,
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
  virtualCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: spacing.lg,
    height: 200,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBank: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    width: 34,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  cardNumber: {
    color: colors.textInverse,
    fontSize: 18,
    letterSpacing: 3,
    fontWeight: typography.fontWeights.semiBold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  cardValue: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionBtnLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  controlsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  controlDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlTexts: {
    gap: 2,
  },
  controlTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textPrimary,
  },
  controlSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  linkedCards: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  linkedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  linkedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textPrimary,
  },
  accountType: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
