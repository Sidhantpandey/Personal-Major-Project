import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LandingScreenProps = {
  onStart: () => void;
  onLogin: () => void;
};

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, onLogin }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 KrishiScan</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Scan</Text>
          <Text style={styles.navItem}>Pricing</Text>
          <Pressable style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.greenGlow} />
        <View style={styles.blueGlow} />

        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>Trusted by 10,000+ Indian Farmers</Text>
          </View>

          <Text style={styles.heroTitle}>
            <Text>Detect Plant Diseases{`\n`}with </Text>
            <Text style={styles.accent}>AI Power</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Upload a photo of your crop and get instant AI-powered disease detection in Hindi & English.
            Save your harvest with early diagnosis.
          </Text>

          <View style={styles.ctaRow}>
            <Pressable style={styles.primaryButton} onPress={onStart}>
              <Text style={styles.primaryButtonText}>Start Free Scan</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onStart}>
              <Text style={styles.secondaryButtonText}>View Plans</Text>
            </Pressable>
          </View>

          <View style={styles.noticeRow}>
            <View style={styles.noticeDot} />
            <Text style={styles.noticeText}>No login required for first scan • 100% secure & private</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: '#1ea65f' }]}>8,666+</Text>
              <Text style={styles.statLabel}>Farmers</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: '#1d9ae6' }]}>82%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>43,333+</Text>
              <Text style={styles.statLabel}>Scans Done</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featureLabel}>FEATURES</Text>
        <Text style={styles.featuresHeading}>Why Choose KrishiScan?</Text>
        <Text style={styles.featuresSummary}>Cutting-edge technology meets agricultural expertise</Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#eafaf1' }]}>
              <Ionicons name="scan" size={28} color="#1ea65f" />
            </View>
            <Text style={styles.featureTitle}>Instant Scan</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#ecf8ff' }]}>
              <Ionicons name="flash" size={28} color="#2c9ae6" />
            </View>
            <Text style={styles.featureTitle}>AI Diagnosis</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#fff8dc' }]}>
              <Ionicons name="leaf" size={28} color="#dca62a" />
            </View>
            <Text style={styles.featureTitle}>Smart Advice</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf6f0',
  },
  contentContainer: {
    paddingBottom: 40,
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
  heroWrap: {
    position: 'relative',
    paddingTop: 20,
    minHeight: 700,
    backgroundColor: '#edf6f0',
  },
  greenGlow: {
    position: 'absolute',
    left: -80,
    top: 80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#cfeee0',
  },
  blueGlow: {
    position: 'absolute',
    right: -80,
    top: 170,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#dfeafc',
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eafaf1',
    borderColor: '#cfe9d8',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1ea65f',
    marginRight: 10,
  },
  badgeText: {
    color: '#0b6c3d',
    fontWeight: '700',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 76,
    lineHeight: 78,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111827',
  },
  accent: {
    color: '#1ea65f',
  },
  heroSubtitle: {
    marginTop: 26,
    maxWidth: 820,
    textAlign: 'center',
    fontSize: 22,
    color: '#5b6674',
    lineHeight: 32,
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ea65f',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#a7d7bd',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  secondaryButtonText: {
    color: '#1ea65f',
    fontWeight: '700',
    fontSize: 18,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  noticeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1ea65f',
    marginRight: 8,
  },
  noticeText: {
    color: '#5b6674',
    fontSize: 16,
  },
  statsRow: {
    marginTop: 34,
    flexDirection: 'row',
    gap: 70,
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 38,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 18,
    color: '#475569',
    marginTop: 4,
  },
  featuresSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 60,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1ea65f',
    letterSpacing: 1.5,
  },
  featuresHeading: {
    fontSize: 52,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
  },
  featuresSummary: {
    fontSize: 20,
    color: '#5b6674',
    marginTop: 8,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 40,
  },
  featureCard: {
    width: 210,
    height: 180,
    backgroundColor: '#f9fbfa',
    borderWidth: 1,
    borderColor: '#dfeae3',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
