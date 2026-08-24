import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ScanDashboardScreenProps = {
  onScan: () => void;
  onBack: () => void;
};

export const ScanDashboardScreen: React.FC<ScanDashboardScreenProps> = ({ onScan, onBack }) => {
  const [selectedCrop, setSelectedCrop] = useState<'Sugarcane' | 'Other Crops'>('Sugarcane');
  const [language, setLanguage] = useState<'English' | 'हिन्दी'>('English');
  const [uploadedFile, setUploadedFile] = useState('No file selected');

  const handleSelectFile = () => {
    setUploadedFile('sugarcane_leaf.jpg');
    Alert.alert('File selected', 'sugarcane_leaf.jpg');
  };

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
        <View style={styles.centerCard}>
          <View style={styles.cardHeaderWrap}>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
            <Text style={styles.sectionTag}>AI SCANNER</Text>
          </View>

          <Text style={styles.title}>Scan Your Crop</Text>
          <Text style={styles.subtitle}>Upload a clear photo of the affected leaf for instant AI-powered diagnosis</Text>

          <View style={styles.guestBox}>
            <Text style={styles.guestIcon}>◉</Text>
            <View>
              <Text style={styles.guestText}>Guest Scans</Text>
              <Text style={styles.guestMeta}>0/5 used</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.leftPanel}>
              <Text style={styles.label}>Select Crop Type</Text>
              <View style={styles.optionRow}>
                <Pressable
                  style={[
                    styles.cropCard,
                    selectedCrop === 'Sugarcane' && styles.cropCardActive,
                  ]}
                  onPress={() => setSelectedCrop('Sugarcane')}
                >
                  <Text style={styles.cropIcon}>🌾</Text>
                  <Text style={styles.cropText}>Sugarcane</Text>
                  <Text style={styles.cropMeta}>12 diseases</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.cropCard,
                    selectedCrop === 'Other Crops' && styles.cropCardActive,
                  ]}
                  onPress={() => setSelectedCrop('Other Crops')}
                >
                  <Text style={styles.cropIcon}>🌽</Text>
                  <Text style={styles.cropText}>Other Crops</Text>
                  <Text style={styles.cropMeta}>15 diseases</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Language</Text>
              <Pressable
                style={[
                  styles.languageCard,
                  language === 'English' && styles.languageCardActive,
                ]}
                onPress={() => setLanguage('English')}
              >
                <Text style={styles.flag}>🇬🇧</Text>
                <Text style={styles.languageText}>English</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.languageCard,
                  language === 'हिन्दी' && styles.languageCardActive,
                ]}
                onPress={() => setLanguage('हिन्दी')}
              >
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.languageText}>हिन्दी</Text>
              </Pressable>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Tips for Best Results</Text>
                <Text style={styles.tipItem}>✓ Take photo in good natural lighting</Text>
                <Text style={styles.tipItem}>✓ Focus clearly on the affected area</Text>
                <Text style={styles.tipItem}>✓ Avoid blurry or dark images</Text>
                <Text style={styles.tipItem}>✓ Scan one leaf at a time</Text>
              </View>
            </View>

            <View style={styles.rightPanel}>
              <View style={styles.uploadCard}>
                <View style={styles.uploadHeader}>
                  <Pressable style={styles.iconButton} onPress={handleSelectFile}>
                    <Ionicons name="camera-outline" size={20} color="#1ea65f" />
                  </Pressable>
                  <Pressable style={styles.iconButton} onPress={handleSelectFile}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#1ea65f" />
                  </Pressable>
                  <Pressable style={styles.iconButton} onPress={handleSelectFile}>
                    <Ionicons name="image-outline" size={20} color="#1ea65f" />
                  </Pressable>
                </View>

                <View style={styles.uploadBody}>
                  <Ionicons name="cloud-upload-outline" size={52} color="#a7b6bf" />
                  <Text style={styles.uploadText}>Click or drag to upload</Text>
                  <Text style={styles.uploadMeta}>PNG, JPG, JPEG up to 10MB</Text>
                  <Text style={styles.fileName}>{uploadedFile}</Text>
                </View>

                <Pressable style={styles.chooseButton} onPress={handleSelectFile}>
                  <Text style={styles.chooseButtonText}>Choose File</Text>
                </Pressable>
              </View>

              <Pressable style={styles.scanButton} onPress={onScan}>
                <Text style={styles.scanButtonText}>Scan Now</Text>
              </Pressable>
            </View>
          </View>
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
    paddingVertical: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  centerCard: {
    width: '100%',
    maxWidth: 980,
    alignItems: 'center',
  },
  cardHeaderWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1ea65f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectionTag: {
    color: '#1ea65f',
    letterSpacing: 1.4,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 54,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  guestBox: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f2d9',
    borderColor: '#e7d688',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  guestIcon: {
    fontSize: 18,
    color: '#f59e0b',
    marginRight: 10,
  },
  guestText: {
    fontWeight: '700',
    color: '#1f2937',
    fontSize: 14,
  },
  guestMeta: {
    color: '#64748B',
    fontSize: 13,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 28,
    gap: 26,
  },
  leftPanel: {
    flex: 1,
    maxWidth: 430,
  },
  rightPanel: {
    flex: 1,
    maxWidth: 430,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  cropCard: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#f5f7f6',
    borderWidth: 1,
    borderColor: '#dfeae3',
    alignItems: 'center',
  },
  cropCardActive: {
    backgroundColor: '#eefaf2',
    borderColor: '#6bc38d',
  },
  cropIcon: {
    fontSize: 30,
  },
  cropText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cropMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7f6',
    borderWidth: 1,
    borderColor: '#dfeae3',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  languageCardActive: {
    borderColor: '#64b77d',
    backgroundColor: '#eefaf2',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  tipBox: {
    backgroundColor: '#ebf4ff',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cfe0f5',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
  },
  uploadCard: {
    backgroundColor: '#f5f7f6',
    borderWidth: 1,
    borderColor: '#dfeae3',
    borderRadius: 18,
    padding: 16,
    minHeight: 420,
    justifyContent: 'space-between',
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfeae3',
    borderRadius: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  uploadText: {
    marginTop: 14,
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
  },
  uploadMeta: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  fileName: {
    marginTop: 12,
    fontSize: 12,
    color: '#1ea65f',
    fontWeight: '700',
  },
  chooseButton: {
    backgroundColor: '#1ea65f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#dfe7e2',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 18,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 20,
  },
});
