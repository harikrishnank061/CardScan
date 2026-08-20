import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';
import { exportService } from '../services/exportService';

interface ExportScreenProps {
  navigation: any;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ navigation }) => {
  const { cards } = useCardContext();
  const [exportingXlsx, setExportingXlsx] = useState<boolean>(false);
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);

  const handleExportExcel = async () => {
    if (cards.length === 0) {
      Alert.alert('Empty', 'No cards available to export.');
      return;
    }
    setExportingXlsx(true);
    try {
      await exportService.exportToExcel(cards);
      if (Platform.OS === 'web') {
        Alert.alert('Downloaded', 'visiting_cards.xlsx downloaded successfully!');
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to generate Excel file.');
    } finally {
      setExportingXlsx(false);
    }
  };

  const handleExportCSV = async () => {
    if (cards.length === 0) {
      Alert.alert('Empty', 'No cards available to export.');
      return;
    }
    setExportingCsv(true);
    try {
      await exportService.exportToCSV(cards);
      if (Platform.OS === 'web') {
        Alert.alert('Downloaded', 'visiting_cards.csv downloaded successfully!');
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to generate CSV file.');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Export Data</Text>
          <Text style={styles.subtitle}>Spreadsheet & CSV Data Export</Text>
        </View>

        {/* Export Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <Ionicons name="stats-chart" size={20} color="#1A73E8" />
            <Text style={styles.summaryTitle}>Export Readiness</Text>
          </View>
          <Text style={styles.summaryBigNumber}>{cards.length}</Text>
          <Text style={styles.summarySub}>Visiting Cards Ready for Export</Text>

          <View style={styles.divider} />

          <View style={styles.featuresList}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#137333" style={{ marginRight: 6 }} />
              <Text style={styles.featureText}>Preserves up to 5 Phone columns + Additional Phones</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#137333" style={{ marginRight: 6 }} />
              <Text style={styles.featureText}>Preserves up to 5 Email columns + Additional Emails</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#137333" style={{ marginRight: 6 }} />
              <Text style={styles.featureText}>Includes GSTIN, Pincode, Address & Social Links</Text>
            </View>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <TouchableOpacity
          style={[styles.exportBtn, styles.excelBtn]}
          onPress={handleExportExcel}
          disabled={exportingXlsx || exportingCsv}
          activeOpacity={0.88}
        >
          {exportingXlsx ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.excelBtnTitle}>Export to Excel (.xlsx)</Text>
                <Text style={styles.excelBtnSub}>Full formatted workbook (visiting_cards.xlsx)</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, styles.csvBtn]}
          onPress={handleExportCSV}
          disabled={exportingXlsx || exportingCsv}
          activeOpacity={0.85}
        >
          {exportingCsv ? (
            <ActivityIndicator size="small" color="#1A73E8" />
          ) : (
            <>
              <Ionicons name="document-outline" size={22} color="#1A73E8" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.csvBtnTitle}>Export to CSV (.csv)</Text>
                <Text style={styles.csvBtnSub}>Standard comma-separated text file</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#202124',
  },
  subtitle: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8',
    marginLeft: 6,
  },
  summaryBigNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#202124',
    marginTop: 4,
  },
  summarySub: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F4',
    marginVertical: 14,
  },
  featuresList: {},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#3C4043',
    fontWeight: '500',
  },
  exportBtn: {
    height: 64,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  excelBtn: {
    backgroundColor: '#137333',
  },
  excelBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  excelBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  csvBtn: {
    backgroundColor: '#E8F0FE',
  },
  csvBtnTitle: {
    color: '#1A73E8',
    fontSize: 15,
    fontWeight: '700',
  },
  csvBtnSub: {
    color: '#5F6368',
    fontSize: 12,
  },
});
