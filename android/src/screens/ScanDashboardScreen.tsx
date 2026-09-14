import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { predictionAPI } from '../utils/api';
import { getText, LANGUAGE_OPTIONS } from '../utils/language';

export const CROP_OPTIONS = [
  { label: 'Tomato', icon: '🍅', sub: '10 classes' },
  { label: 'Potato', icon: '🥔', sub: '3 classes' },
  { label: 'Corn', icon: '🌽', sub: '4 classes' },
  { label: 'Apple', icon: '🍎', sub: '4 classes' },
  { label: 'Rice', icon: '🌾', sub: '10 classes' },
  { label: 'Grape', icon: '🍇', sub: '4 classes' },
  { label: 'BellPepper', icon: '🌶️', sub: '2 classes' },
  { label: 'Strawberry', icon: '🍓', sub: '2 classes' },
  { label: 'Peach', icon: '🍑', sub: '2 classes' },
  { label: 'Orange', icon: '🍊', sub: '1 class' },
  { label: 'Cherry', icon: '🍒', sub: '2 classes' },
  { label: 'Soybean', icon: '🫘', sub: '1 class' },
  { label: 'Squash', icon: '🎃', sub: '1 class' },
  { label: 'Blueberry', icon: '🫐', sub: '1 class' },
  { label: 'Raspberry', icon: '🫐', sub: '1 class' },
];

type ScanDashboardScreenProps = {
  onScan: (
    disease: string,
    confidence: number,
    recommendations?: string[],
    crop?: string,
    allProbabilities?: Record<string, number>
  ) => void;
  onBack: () => void;
};

export const ScanDashboardScreen: React.FC<ScanDashboardScreenProps> = ({ onScan, onBack }) => {
  const { user, isAuthenticated, logout, language, setLanguage } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  const handleSelectFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'photo.jpg';
        setImageUri(asset.uri);
        setUploadedFile(fileName);
        setError('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to select image';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const handleScan = async () => {
    try {
      if (!imageUri) {
        setError(getText(language, 'selectImage'));
        Alert.alert('Error', getText(language, 'selectImage'));
        return;
      }

      if (!isAuthenticated) {
        Alert.alert('Error', 'Please login to scan crops');
        onBack();
        return;
      }

      setIsLoading(true);
      setError('');

      let latitude = 19.076;
      let longitude = 72.8777;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        }
      } catch (locErr) {
        console.warn('Could not fetch GPS location, using fallback:', locErr);
      }

      const response = await predictionAPI.uploadPhoto(
        imageUri,
        selectedCrop,
        language,
        latitude,
        longitude
      );

      const payload = response?.data ?? response;
      const diseaseLabel = payload?.diseaseLabel || payload?.predicted_class || payload?.disease || 'Unknown';
      const confidence = Number(payload?.confidence ?? 0);
      const recommendations = Array.isArray(payload?.recommendations)
        ? payload.recommendations
        : [];
      const allProbabilities = payload?.all_probabilities || payload?.rawModelResponse?.all_probabilities || {};

      onScan(diseaseLabel, confidence, recommendations, selectedCrop, allProbabilities);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process scan';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onBack();
    } catch (err) {
      Alert.alert('Logout Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 OmniCrops</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>{getText(language, 'home')}</Text>
          <Text style={styles.navItem}>{getText(language, 'scan')}</Text>
          {isAuthenticated && user ? (
            <>
              <Text style={styles.userText}>{user.name ? `${user.name}` : user.phone}</Text>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>{getText(language, 'logout')}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.loginButton} onPress={onBack}>
              <Text style={styles.loginText}>{getText(language, 'login')}</Text>
            </Pressable>
          )}
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

          <Text style={styles.title}>{getText(language, 'dashboardTitle')}</Text>
          <Text style={styles.subtitle}>{getText(language, 'dashboardSubtitle')}</Text>

          <View style={styles.guestBox}>
            <Text style={styles.guestIcon}>◉</Text>
            <View>
              <Text style={styles.guestText}>
                {user?.name ? `${user.name} (${user.phone})` : user?.phone || getText(language, 'guestBox')}
              </Text>
              <Text style={styles.guestMeta}>{getText(language, 'authUser')}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.leftPanel}>
              <Text style={styles.label}>{getText(language, 'cropType')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
                style={{ marginBottom: 18 }}
              >
                {CROP_OPTIONS.map((c) => {
                  const isSelected = selectedCrop === c.label;
                  return (
                    <Pressable
                      key={c.label}
                      style={[styles.cropCard, isSelected && styles.cropCardActive]}
                      onPress={() => setSelectedCrop(c.label)}
                    >
                      <Text style={styles.cropIcon}>{c.icon}</Text>
                      <Text style={[styles.cropText, isSelected && { color: '#1ea65f' }]}>{c.label}</Text>
                      <Text style={styles.cropMeta}>{c.sub}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>{getText(language, 'language')}</Text>
              <View style={styles.languageRow}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.code}
                    style={[styles.languageCard, language === option.code && styles.languageCardActive]}
                    onPress={() => setLanguage(option.code)}
                  >
                    <Text style={styles.flag}>{option.code === 'en' ? '🇬🇧' : '🇮🇳'}</Text>
                    <Text style={styles.languageText}>{option.native}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>{getText(language, 'tips')}</Text>
                <Text style={styles.tipItem}>✓ {getText(language, 'tip1')}</Text>
                <Text style={styles.tipItem}>✓ {getText(language, 'tip2')}</Text>
                <Text style={styles.tipItem}>✓ {getText(language, 'tip3')}</Text>
                <Text style={styles.tipItem}>✓ {getText(language, 'tip4')}</Text>
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
                  <Text style={styles.uploadText}>{getText(language, 'uploadText')}</Text>
                  <Text style={styles.uploadMeta}>{getText(language, 'uploadMeta')}</Text>
                  <Text style={styles.fileName}>
                    {uploadedFile ? `✓ ${uploadedFile}` : getText(language, 'noFile')}
                  </Text>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <Pressable style={styles.chooseButton} onPress={handleSelectFile}>
                  <Text style={styles.chooseButtonText}>{getText(language, 'chooseFile')}</Text>
                </Pressable>
              </View>

              <Pressable style={styles.scanButton} onPress={handleScan} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.scanButtonText}>{getText(language, 'scanNow')}</Text>
                )}
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
  userText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#15a85d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  contentContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  centerCard: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dfeae3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cameraBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1ea65f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTag: {
    color: '#1ea65f',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 18,
  },
  guestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  guestIcon: {
    color: '#1ea65f',
    marginRight: 8,
    fontSize: 18,
  },
  guestText: {
    color: '#111827',
    fontWeight: '700',
  },
  guestMeta: {
    color: '#64748B',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
  },
  leftPanel: {
    flex: 1,
    minWidth: 280,
  },
  rightPanel: {
    flex: 1,
    minWidth: 280,
  },
  label: {
    color: '#1f2937',
    fontWeight: '700',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  cropCard: {
    minWidth: 95,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfeae3',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cropCardActive: {
    borderColor: '#1ea65f',
    backgroundColor: '#ecfdf5',
  },
  cropIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  cropText: {
    fontWeight: '700',
    color: '#111827',
  },
  cropMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  languageRow: {
    gap: 10,
    marginBottom: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfeae3',
    padding: 12,
  },
  languageCardActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#1ea65f',
  },
  flag: {
    fontSize: 18,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tipBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dfeae3',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  tipItem: {
    color: '#334155',
    marginBottom: 6,
    fontSize: 13,
  },
  uploadCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfeae3',
    padding: 16,
    marginBottom: 20,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 18,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e6faf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBody: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  uploadText: {
    marginTop: 12,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  uploadMeta: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  fileName: {
    marginTop: 12,
    color: '#1ea65f',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  chooseButton: {
    marginTop: 16,
    backgroundColor: '#1ea65f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  scanButton: {
    backgroundColor: '#15a85d',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ScanDashboardScreen;
