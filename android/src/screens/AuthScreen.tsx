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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AuthMode = 'login' | 'register';

type AuthScreenProps = {
  onBack?: () => void;
  onContinue?: () => void;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onContinue }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    const actionText = mode === 'login' ? 'Login' : 'Register';
    Alert.alert(
      actionText,
      mode === 'login'
        ? `Logged in as ${email || 'user'}`
        : `Registered as ${fullName || 'new user'}`
    );
    if (onContinue) {
      onContinue();
    }
  };

  const isRegister = mode === 'register';

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🌱 KrishiScan</Text>
        <View style={styles.navRow}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Scan</Text>
          <Text style={styles.navItem}>Pricing</Text>
          <Pressable style={styles.loginButton} onPress={() => setMode('login')}>
            <Text style={styles.loginText}>Login</Text>
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

            <Text style={styles.heading}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.subheading}>
              {isRegister
                ? 'Join KrishiScan to detect crop health faster.'
                : 'Login to access your dashboard'}
            </Text>

            <View style={styles.switcher}>
              <Pressable
                style={[styles.segmentButton, !isRegister && styles.segmentButtonActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.segmentText, !isRegister && styles.segmentTextActive]}>Login</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, isRegister && styles.segmentButtonActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.segmentText, isRegister && styles.segmentTextActive]}>Register</Text>
              </Pressable>
            </View>

            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.primaryButton} onPress={handleSubmit}>
              <Text style={styles.primaryButtonText}>{isRegister ? 'Register' : 'Login'}</Text>
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable style={styles.secondaryButton} onPress={() => Alert.alert('Guest', 'Continue as guest')}>
              <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
            </Pressable>

            <Text style={styles.footerText}>Your data is secure and encrypted</Text>
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
    backgroundColor: '#1ea65f',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subheading: {
    marginTop: 8,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginBottom: 18,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#16a34a',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e0df',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  passwordInputWrap: {
    borderWidth: 1,
    borderColor: '#d8e0df',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#1ea65f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfeae3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 15,
  },
  footerText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
  },
});
