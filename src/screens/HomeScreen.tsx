import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { totalScannedCount, processedCount, needsReviewCount, pendingCount } = useCardContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>CardScan</Text>
            <Text style={styles.appSubtitle}>Scan. Extract. Organize.</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="#3C4043" />
          </TouchableOpacity>
        </View>

        {/* Primary CTA: Scan New Card */}
        <TouchableOpacity
          style={styles.primaryCta}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.88}
        >
          <View style={styles.primaryCtaIconContainer}>
            <Ionicons name="camera" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.primaryCtaTextGroup}>
            <Text style={styles.primaryCtaTitle}>Scan New Card</Text>
            <Text style={styles.primaryCtaSub}>Capture Front & Back • Auto-Pair</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cards')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E8F0FE' }]}>
              <Ionicons name="documents-outline" size={22} color="#1A73E8" />
            </View>
            <Text style={styles.actionTitle}>Scanned Cards</Text>
            <Text style={styles.actionSub}>{totalScannedCount} Total</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Process')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEF7E0' }]}>
              <Ionicons name="hardware-chip-outline" size={22} color="#B06000" />
            </View>
            <Text style={styles.actionTitle}>Process Cards</Text>
            <Text style={styles.actionSub}>{pendingCount} Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Export')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E6F4EA' }]}>
              <Ionicons name="download-outline" size={22} color="#137333" />
            </View>
            <Text style={styles.actionTitle}>Export</Text>
            <Text style={styles.actionSub}>Excel & CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Dashboard Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalScannedCount}</Text>
              <Text style={styles.statLabel}>Cards Scanned</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#137333' }]}>{processedCount}</Text>
              <Text style={styles.statLabel}>Processed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#B06000' }]}>{needsReviewCount}</Text>
              <Text style={styles.statLabel}>Needs Review</Text>
            </View>
          </View>
        </View>

        {/* Quick Tips / Workflow Info */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={22} color="#1A73E8" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Automatic Front + Back Pairing</Text>
            <Text style={styles.infoBody}>
              CardScan pairs your card photos automatically and merges all details into one unified contact.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 20,
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
    marginTop: 2,
  },
  settingsIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A73E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCtaIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  primaryCtaTextGroup: {
    flex: 1,
  },
  primaryCtaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryCtaSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8EAED',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 11,
    color: '#5F6368',
    marginTop: 2,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C4043',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#202124',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5F6368',
    fontWeight: '500',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A73E8',
    marginBottom: 2,
  },
  infoBody: {
    fontSize: 12,
    color: '#3C4043',
    lineHeight: 16,
  },
});
