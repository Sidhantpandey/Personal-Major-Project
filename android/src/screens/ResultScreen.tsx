import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getText } from '../utils/language';

type ResultScreenProps = {
  disease: string;
  confidence: number;
  recommendations?: string[];
  onBack: () => void;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  disease,
  confidence,
  recommendations = [
    'Remove infected leaves and isolate affected plants',
    'Apply a suitable fungicide as per crop stage',
    'Maintain proper ventilation and avoid overwatering',
  ],
  onBack,
}) => {
  const { isAuthenticated, user, language } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 KrishiScan</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>{getText(language, 'home')}</Text>
          <Text style={styles.navItem}>{getText(language, 'scan')}</Text>
          <Text style={styles.navItem}>{getText(language, 'pricing')}</Text>
          {isAuthenticated && user ? (
            <Text style={styles.userEmail}>{user.email}</Text>
          ) : (
            <Pressable style={styles.loginButton} onPress={onBack}>
              <Text style={styles.loginText}>{getText(language, 'login')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.resultCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={40} color="#1ea65f" />
          </View>

          <Text style={styles.label}>{getText(language, 'diseasePrediction')}</Text>
          <Text style={styles.disease}>{disease}</Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{getText(language, 'confidence')}</Text>
            <Text style={styles.confidenceValue}>{confidence}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${confidence}%` }]} />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{getText(language, 'diagnosisSummary')}</Text>
            <Text style={styles.summaryText}>
              {language === 'hi'
                ? 'फसल में प्रारंभिक फंगल क्षति के संकेत दिखाई दे रहे हैं। आगे फैलने से रोकने के लिए तुरंत उपचार शुरू करना चाहिए।'
                : 'The crop shows signs of early fungal damage. Recommended treatment should begin immediately to prevent further spread.'}
            </Text>
          </View>

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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dfeae3',
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 14,
  },
  label: {
    textAlign: 'center',
    color: '#1ea65f',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  disease: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '700',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1ea65f',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1ea65f',
    borderRadius: 999,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '800',
    marginBottom: 10,
  },
  summaryText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  tipsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  tipText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 24,
  },
  primaryButton: {
    marginTop: 24,
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
