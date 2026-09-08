import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LandingScreen } from './src/screens/LandingScreen';
import { ScanDashboardScreen } from './src/screens/ScanDashboardScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { AuthScreen } from './src/screens/AuthScreen';

export type AppScreen = 'landing' | 'auth' | 'dashboard' | 'result';

type TransitionScreenProps = {
  children: React.ReactNode;
  screenKey: string;
};

const TransitionScreen: React.FC<TransitionScreenProps> = ({ children, screenKey }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      opacity.setValue(0);
      translateY.setValue(18);
    };
  }, [screenKey, opacity, translateY]);

  return (
    <Animated.View
      key={screenKey}
      style={{
        flex: 1,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Main app content component with auth context
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [resultDisease, setResultDisease] = useState('Leaf Spot');
  const [resultConfidence, setResultConfidence] = useState(92);
  const [resultRecommendations, setResultRecommendations] = useState<string[]>([]);

  // Update screen when auth state changes
  useEffect(() => {
    if (!isAuthenticated && (screen === 'dashboard' || screen === 'result')) {
      setScreen('auth');
    }
  }, [isAuthenticated, screen]);

  const handleScan = (disease: string, confidence: number, recommendations?: string[]) => {
    setResultDisease(disease);
    setResultConfidence(confidence);
    setResultRecommendations(recommendations || []);
    setScreen('result');
  };

  const renderScreen = () => {
    // Protected routes - only show if authenticated
    if (!isAuthenticated && (screen === 'dashboard' || screen === 'result')) {
      return (
        <AuthScreen
          onBack={() => setScreen('landing')}
          onContinue={() => setScreen('dashboard')}
        />
      );
    }

    switch (screen) {
      case 'landing':
        return (
          <LandingScreen
            onStart={() => setScreen('dashboard')}
            onLogin={() => setScreen('auth')}
          />
        );
      case 'auth':
        return (
          <AuthScreen
            onBack={() => setScreen('landing')}
            onContinue={() => setScreen('dashboard')}
          />
        );
      case 'dashboard':
        return (
          <ScanDashboardScreen
            onBack={() => setScreen('landing')}
            onScan={handleScan}
          />
        );
      case 'result':
        return (
          <ResultScreen
            disease={resultDisease}
            confidence={resultConfidence}
            recommendations={resultRecommendations}
            onBack={() => setScreen('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1ea65f" />
        </View>
      ) : (
        <TransitionScreen screenKey={screen}>{renderScreen()}</TransitionScreen>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf6f0',
  },
});
