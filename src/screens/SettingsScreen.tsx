import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { settings, updateSettings, resetSampleData, clearAllData } = useCardContext();
  const [backendUrl, setBackendUrl] = useState<string>('https://card-scan-flame.vercel.app');
  const [testingConnection, setTestingConnection] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('@cardscan_backend_url').then((val) => {
      if (val && !val.includes('trycloudflare') && !val.includes('loca.lt')) {
        setBackendUrl(val.trim());
      } else {
        setBackendUrl('https://card-scan-flame.vercel.app');
        AsyncStorage.setItem('@cardscan_backend_url', 'https://card-scan-flame.vercel.app');
      }
    });
  }, []);

  const handleSaveBackendUrl = async (text: string) => {
    setBackendUrl(text);
    await AsyncStorage.setItem('@cardscan_backend_url', text.trim());
  };

  const handleTestBackendConnection = async () => {
    setTestingConnection(true);
    try {
      const cleanUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const res = await fetch(`${cleanUrl}/docs`, { method: 'GET' });
      setTestingConnection(false);
      if (res.ok || res.status === 200) {
        Alert.alert('Connection Success 🎉', `Successfully connected to Python FastAPI Backend at ${backendUrl}`);
      } else {
        Alert.alert('Connection Failed', `Received HTTP ${res.status} response from ${backendUrl}`);
      }
    } catch (err: any) {
      setTestingConnection(false);
      Alert.alert('Connection Failed', `Could not connect to ${backendUrl}. Ensure PC and Phone are on the same Wi-Fi network and python backend is running.`);
    }
  };

  const handleToggleAutoProcess = (value: boolean) => {
    updateSettings({ autoProcessAfterScanning: value });
  };

  const handleToggleReviewBeforeExport = (value: boolean) => {
    updateSettings({ reviewBeforeExport: value });
  };

  const handleResetSampleData = () => {
    if (Platform.OS === 'web') {
      if (confirm('Reset database to initial 5 sample business cards?')) {
        resetSampleData();
        Alert.alert('Reset', 'Sample data restored!');
      }
    } else {
      Alert.alert(
        'Reset Sample Data',
        'This will replace current stored cards with initial 5 realistic sample cards.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await resetSampleData();
              Alert.alert('Reset', 'Sample data restored!');
            },
          },
        ]
      );
    }
  };

  const handleDeleteAll = () => {
    if (Platform.OS === 'web') {
      if (confirm('WARNING: Are you sure you want to delete ALL visiting cards?')) {
        clearAllData();
        Alert.alert('Cleared', 'All stored cards deleted.');
      }
    } else {
      Alert.alert(
        'Delete All Cards',
        'WARNING: This will permanently delete ALL stored cards from your device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              await clearAllData();
              Alert.alert('Cleared', 'All stored cards deleted.');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#202124" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* BACKEND SERVER SETTINGS */}
        <Text style={styles.sectionHeader}>PYTHON AI BACKEND SERVER</Text>
        <View style={styles.settingsGroup}>
          <Text style={styles.settingTitle}>Backend Server URL (PC Wi-Fi IP)</Text>
          <Text style={styles.settingSub}>
            Set your computer's local Wi-Fi IP so your mobile phone can connect to PaddleOCR.
          </Text>

          <TextInput
            style={styles.urlInput}
            value={backendUrl}
            onChangeText={handleSaveBackendUrl}
            placeholder="http://192.168.68.56:8000"
            placeholderTextColor="#9AA0A6"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestBackendConnection}
            disabled={testingConnection}
            activeOpacity={0.8}
          >
            <Ionicons name="wifi-outline" size={16} color="#1A73E8" style={{ marginRight: 6 }} />
            <Text style={styles.testBtnText}>
              {testingConnection ? 'Testing Connection...' : 'Test Backend Connection'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES SECTION */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingTitle}>Auto Process After Scanning</Text>
              <Text style={styles.settingSub}>Automatically run AI extraction after capturing card.</Text>
            </View>
            <Switch
              value={settings.autoProcessAfterScanning}
              onValueChange={handleToggleAutoProcess}
              trackColor={{ false: '#DADCE0', true: '#AECBFA' }}
              thumbColor={settings.autoProcessAfterScanning ? '#1A73E8' : '#F1F3F4'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingTitle}>Review Before Export</Text>
              <Text style={styles.settingSub}>Prompt to review unverified fields before Excel generation.</Text>
            </View>
            <Switch
              value={settings.reviewBeforeExport}
              onValueChange={handleToggleReviewBeforeExport}
              trackColor={{ false: '#DADCE0', true: '#AECBFA' }}
              thumbColor={settings.reviewBeforeExport ? '#1A73E8' : '#F1F3F4'}
            />
          </View>
        </View>

        {/* DATABASE & DATA MANAGEMENT */}
        <Text style={styles.sectionHeader}>DATA MANAGEMENT</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.actionRow} onPress={handleResetSampleData} activeOpacity={0.7}>
            <Ionicons name="refresh-circle-outline" size={22} color="#1A73E8" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actionRowTitle}>Restore 5 Sample Cards</Text>
              <Text style={styles.actionRowSub}>Reset database to realistic Indian sample cards.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9AA0A6" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAll} activeOpacity={0.7}>
            <Ionicons name="trash-bin-outline" size={20} color="#D93025" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionRowTitle, { color: '#D93025' }]}>Delete All Stored Cards</Text>
              <Text style={styles.actionRowSub}>Permanently wipe local database storage.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9AA0A6" />
          </TouchableOpacity>
        </View>

        {/* ABOUT APP SECTION */}
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0 (Expo SDK 57)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Architecture</Text>
            <Text style={styles.aboutValue}>Offline-First Local Storage</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>OCR Vision Layer</Text>
            <Text style={styles.aboutValue}>PaddleOCR Engine</Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>CardScan • Mobile Visiting Card Scanner</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    backgroundColor: '#FFFFFF',
  },
  headerBackBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#202124',
  },
  container: {
    padding: 20,
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5F6368',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  settingSub: {
    fontSize: 12,
    color: '#5F6368',
    marginBottom: 8,
  },
  urlInput: {
    height: 46,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#202124',
    marginBottom: 10,
  },
  testBtn: {
    height: 40,
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A73E8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F4',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
  },
  actionRowSub: {
    fontSize: 12,
    color: '#80868B',
    marginTop: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 13,
    color: '#5F6368',
    fontWeight: '600',
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 10,
    marginBottom: 20,
  },
});
