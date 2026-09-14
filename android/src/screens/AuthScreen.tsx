import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getText, LANGUAGE_OPTIONS, AppLanguage } from '../utils/language';

type AuthMode = 'login' | 'register';

type AuthScreenProps = {
  onBack?: () => void;
  onContinue?: () => void;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onContinue }) => {
  const { login, register, sendOtp, isLoading, language, setLanguage } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (val: string) => {
    setPhone(val.replace(/\D/g, '').slice(0, 10));
  };

  const handleOtpChange = (val: string) => {
    setOtp(val.replace(/\D/g, '').slice(0, 6));
  };

  const handleSendOtp = async () => {
    try {
      setError('');
      if (phone.length !== 10) {
        setError(getText(language, 'enterValidPhone'));
        return;
      }

      await sendOtp(phone);
      setOtpStep(true);
      Alert.alert('OTP Sent', getText(language, 'otpSent'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      if (phone.length !== 10) {
        setError(getText(language, 'enterValidPhone'));
        return;
      }
      if (otp.length !== 6) {
        setError(getText(language, 'enterValidOtp'));
        return;
      }

      await login(phone, otp);
      if (onContinue) {
        onContinue();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      Alert.alert('Login Failed', message);
    }
  };

  const handleRegister = async () => {
    try {
      setError('');
      if (!fullName.trim()) {
        setError(getText(language, 'fullNameRequired'));
        return;
      }
      if (phone.length !== 10) {
        setError(getText(language, 'enterValidPhone'));
        return;
      }

      await register(phone, fullName.trim());
      await sendOtp(phone);
      setOtpStep(true);
      setMode('login');
      Alert.alert('Registration Successful', getText(language, 'otpSent'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      Alert.alert('Registration Failed', message);
    }
  };

  const isRegister = mode === 'register';

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 OmniCrops</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>{getText(language, 'home')}</Text>
          <Text style={styles.navItem}>{getText(language, 'scan')}</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => {
              setMode('login');
              setOtpStep(false);
              setError('');
            }}
          >
            <Text style={styles.loginText}>{getText(language, 'login')}</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="leaf" size={30} color="#ffffff" />
            </View>

            <Text style={styles.heading}>
              {isRegister ? getText(language, 'createAccount') : getText(language, 'welcomeBack')}
            </Text>
            <Text style={styles.subheading}>
              {isRegister ? getText(language, 'createAccountSubtitle') : getText(language, 'loginSubtitle')}
            </Text>

            <View style={styles.languageBox}>
              <Text style={styles.label}>{getText(language, 'selectLanguage')}</Text>
              <View style={styles.languageRow}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.code}
                    style={[styles.languageChip, language === option.code && styles.languageChipActive]}
                    onPress={() => setLanguage(option.code)}
                  >
                    <Text style={[styles.languageChipText, language === option.code && styles.languageChipTextActive]}>
                      {option.native}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.switcher}>
              <Pressable
                style={[styles.segmentButton, !isRegister && styles.segmentButtonActive]}
                onPress={() => {
                  setMode('login');
                  setOtpStep(false);
                  setError('');
                }}
              >
                <Text style={[styles.segmentText, !isRegister && styles.segmentTextActive]}>
                  {getText(language, 'login')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, isRegister && styles.segmentButtonActive]}
                onPress={() => {
                  setMode('register');
                  setOtpStep(false);
                  setError('');
                }}
              >
                <Text style={[styles.segmentText, isRegister && styles.segmentTextActive]}>
                  {getText(language, 'register')}
                </Text>
              </Pressable>
            </View>

            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{getText(language, 'fullName')}</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={getText(language, 'fullName')}
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{getText(language, 'phone')}</Text>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder={getText(language, 'enterPhone')}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.input}
                editable={!otpStep}
              />
            </View>

            {otpStep && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{getText(language, 'otp')}</Text>
                <TextInput
                  value={otp}
                  onChangeText={handleOtpChange}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
                <Text style={styles.demoHintText}>💡 {getText(language, 'demoOtpHint')}</Text>
              </View>
            )}

            {otpStep ? (
              <View style={{ gap: 10, marginTop: 8 }}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{getText(language, 'verifyLogin')}</Text>
                  )}
                </Pressable>
                <Pressable
                  style={styles.changePhoneButton}
                  onPress={() => {
                    setOtpStep(false);
                    setOtp('');
                  }}
                >
                  <Text style={styles.changePhoneText}>{getText(language, 'changePhone')}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.primaryButton}
                onPress={isRegister ? handleRegister : handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isRegister ? getText(language, 'registerWithOtp') : getText(language, 'sendOtp')}
                  </Text>
                )}
              </Pressable>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.footerText}>{getText(language, 'secureData')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#15a85d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loginText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  languageBox: {
    marginTop: 18,
    marginBottom: 8,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  languageChip: {
    backgroundColor: '#eefcf4',
    borderWidth: 1,
    borderColor: '#cfead9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageChipActive: {
    backgroundColor: '#1ea65f',
    borderColor: '#1ea65f',
  },
  languageChipText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
  },
  languageChipTextActive: {
    color: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#dfeae3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#15a85d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subheading: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 18,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#1f2937',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfe7ee',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfe7ee',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    color: '#111827',
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#15a85d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#dfeae3',
  },
  orText: {
    marginHorizontal: 12,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#166534',
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 18,
    fontSize: 12,
  },
  demoHintText: {
    fontSize: 12,
    color: '#15a85d',
    fontWeight: '600',
    marginTop: 6,
  },
  changePhoneButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  changePhoneText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
