import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ResultScreenProps = {
  disease: string;
  confidence: number;
  onBack: () => void;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ disease, confidence, onBack }) => {
  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 KrishiScan</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Scan</Text>
          <Text style={styles.navItem}>Pricing</Text>
          <Pressable style={styles.loginButton} onPress={onBack}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.resultCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={40} color="#1ea65f" />
          </View>

          <Text style={styles.label}>Disease Prediction</Text>
          <Text style={styles.disease}>{disease}</Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>{confidence}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${confidence}%` }]} />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Diagnosis Summary</Text>
            <Text style={styles.summaryText}>
              The crop shows signs of early fungal damage. Recommended treatment should begin immediately to
              prevent further spread.
            </Text>
          </View>

          <View style={styles.tipsBox}>
            <Text style={styles.summaryTitle}>Recommended Actions</Text>
            <Text style={styles.tipText}>• Remove infected leaves and isolate affected plants</Text>
            <Text style={styles.tipText}>• Apply a suitable fungicide as per crop stage</Text>
            <Text style={styles.tipText}>• Maintain proper ventilation and avoid overwatering</Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={onBack}>
            <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
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
    marginTop: 26,
    backgroundColor: '#f0f9f2',
    borderWidth: 1,
    borderColor: '#d3eedb',
    borderRadius: 16,
    padding: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  tipsBox: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfeae3',
    borderRadius: 16,
    padding: 18,
  },
  tipText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#1ea65f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
