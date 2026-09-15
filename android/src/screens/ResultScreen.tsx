import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getText } from '../utils/language';

type ResultScreenProps = {
  disease: string;
  confidence: number;
  recommendations?: string[];
  crop?: string;
  allProbabilities?: Record<string, number>;
  onBack: () => void;
};

const parseDiseaseLabel = (label: string = '') => {
  const clean = String(label).trim();
  if (
    clean.toLowerCase().includes('unrecognized') ||
    clean.toLowerCase().includes('non-crop') ||
    clean.toLowerCase().includes('not a plant')
  ) {
    return { crop: 'Verification', disease: 'Unrecognized / Non-Crop Image' };
  }
  const parts = clean.replace(/___/g, '|').split('|');
  const crop = (parts[0] || 'Crop').replace(/_/g, ' ');
  const disease = (parts[1] || '').replace(/_/g, ' ') || 'Healthy';
  return { crop, disease };
};

const getSeverityMeta = (label: string = '', confidence: number = 0) => {
  const lower = label.toLowerCase();
  if (
    lower.includes('unrecognized') ||
    lower.includes('non-crop') ||
    lower.includes('not a plant')
  ) {
    return { label: 'Non-Crop Image', color: '#f59e0b', bg: '#fffbeb', icon: 'warning' as const };
  }
  if (lower.includes('healthy')) {
    return { label: 'Healthy', color: '#16a34a', bg: '#ecfdf5', icon: 'checkmark-circle' as const };
  }
  if (confidence < 40) {
    return { label: 'Low Confidence', color: '#eab308', bg: '#fefce8', icon: 'help-circle' as const };
  }
  if (confidence >= 85) {
    return { label: 'High Risk', color: '#dc2626', bg: '#fef2f2', icon: 'alert-circle' as const };
  }
  if (confidence >= 60) {
    return { label: 'Moderate Risk', color: '#d97706', bg: '#fffbeb', icon: 'warning' as const };
  }
  return { label: 'Low Risk', color: '#2563eb', bg: '#eff6ff', icon: 'information-circle' as const };
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  disease,
  confidence,
  recommendations = [
    'Inspect surrounding plants for early infection spots.',
    'Isolate or prune heavily damaged foliage to prevent spread.',
    'Apply crop-specific organic or chemical treatment as recommended.',
  ],
  crop,
  allProbabilities = {},
  onBack,
}) => {
  const { isAuthenticated, user, language } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  const parsed = parseDiseaseLabel(disease);
  const displayCrop = crop || parsed.crop;
  const displayDisease = parsed.disease;
  const severity = getSeverityMeta(disease, confidence);

  // Top 4 probabilities sorted descending
  const topProbs = Object.entries(allProbabilities)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 4)
    .map(([cls, pct]) => ({
      name: cls.replace(/___/g, ' - ').replace(/_/g, ' '),
      pct: Number(pct),
    }));

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 OmniCrops</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>{getText(language, 'home')}</Text>
          <Text style={styles.navItem}>{getText(language, 'scan')}</Text>
          {isAuthenticated && user ? (
            <Text style={styles.userEmail}>{user.name ? `${user.name}` : user.phone}</Text>
          ) : (
            <Pressable style={styles.loginButton} onPress={onBack}>
              <Text style={styles.loginText}>{getText(language, 'login')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.resultCard}>
          <View style={[styles.badgeWrap, { backgroundColor: severity.bg, borderColor: severity.color }]}>
            <Ionicons name={severity.icon} size={18} color={severity.color} />
            <Text style={[styles.badgeText, { color: severity.color }]}>
              {severity.label.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.cropBadge}>{displayCrop.toUpperCase()}</Text>
          <Text style={styles.disease}>{displayDisease}</Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{getText(language, 'confidence')}</Text>
            <Text style={[styles.confidenceValue, { color: severity.color }]}>{confidence.toFixed(1)}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(5, confidence))}%`, backgroundColor: severity.color },
              ]}
            />
          </View>

          {/* Probability breakdown */}
          {topProbs.length > 0 && (
            <View style={styles.probSection}>
              <Text style={styles.sectionHeading}>Top Model Probabilities</Text>
              {topProbs.map((item, idx) => (
                <View key={idx} style={styles.probItem}>
                  <View style={styles.probHeader}>
                    <Text style={styles.probName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.probPct}>{item.pct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.miniTrack}>
                    <View style={[styles.miniFill, { width: `${Math.min(100, Math.max(2, item.pct))}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.tipsBox}>
            <Text style={styles.summaryTitle}>{getText(language, 'recommendedActions')}</Text>
            {recommendations.map((rec, idx) => (
              <Text key={idx} style={styles.tipText}>
                • {rec}
              </Text>
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={onBack}>
            <Text style={styles.primaryButtonText}>{getText(language, 'backDashboard')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf6f0',
  },
  topBar: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8fbf9',
    borderBottomWidth: 1,
    borderBottomColor: '#dfeae3',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f8f59',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  navItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#1ea65f',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  contentContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dfeae3',
    padding: 26,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cropBadge: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  disease: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
    marginBottom: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  confidenceLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '700',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  probSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  probItem: {
    marginBottom: 8,
  },
  probHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  probName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  probPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
    marginLeft: 8,
  },
  miniTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  tipsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '800',
    marginBottom: 10,
  },
  tipText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 4,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#1ea65f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
