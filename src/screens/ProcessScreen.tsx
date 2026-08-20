import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';

interface ProcessScreenProps {
  navigation: any;
}

export const ProcessScreen: React.FC<ProcessScreenProps> = ({ navigation }) => {
  const {
    cards,
    isProcessingQueue,
    queueProgress,
    processAllPendingCards,
    cancelQueueProcessing,
    processCardById,
    updateCard,
  } = useCardContext();

  const pendingCards = cards.filter((c) => c.status === 'pending' || c.status === 'processing');
  const unextractedCards = cards.filter((c) => c.status === 'needs_review' || !c.fullName);

  const totalToProcess = queueProgress.total > 0 ? queueProgress.total : pendingCards.length;
  const currentStep = queueProgress.current;
  const progressPercent = totalToProcess > 0 ? (currentStep / totalToProcess) * 100 : 0;

  const handleProcessAll = async () => {
    if (pendingCards.length > 0) {
      await processAllPendingCards();
    } else if (unextractedCards.length > 0) {
      for (const card of unextractedCards) {
        await updateCard({ ...card, status: 'pending' });
      }
      await processAllPendingCards();
    } else if (cards.length > 0) {
      for (const card of cards) {
        await updateCard({ ...card, status: 'pending' });
      }
      await processAllPendingCards();
    }
  };

  const handleSingleCardExtract = async (cardId: string, cardNum: number) => {
    Alert.alert('Processing AI OCR', `Extracting text for Card #${String(cardNum).padStart(3, '0')}...`);
    try {
      const updated = await processCardById(cardId);
      if (updated) {
        if (
          updated.fullName ||
          updated.companyName ||
          (updated.phoneNumbers && updated.phoneNumbers.length > 0) ||
          (updated.emailAddresses && updated.emailAddresses.length > 0) ||
          updated.rawText
        ) {
          Alert.alert('Extraction Success 🎉', `Extracted: ${updated.fullName || updated.companyName || 'Visiting Card'}`);
        } else {
          Alert.alert(
            'Card Processed',
            'Card processed successfully. If card text is faint, tap on the card to edit details manually.'
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err.message || 'Could not connect to Python FastAPI backend.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Process Cards</Text>
          <Text style={styles.subtitle}>AI OCR Vision Data Extraction</Text>
        </View>

        {/* Progress Dashboard Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>
              {isProcessingQueue ? 'Processing Cards...' : 'Queue Overview'}
            </Text>
            <Text style={styles.counterText}>
              {isProcessingQueue
                ? `${currentStep} / ${totalToProcess}`
                : pendingCards.length > 0
                ? `${pendingCards.length} Pending`
                : `${unextractedCards.length} Needs Extraction`}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${isProcessingQueue ? progressPercent : 0}%` }]} />
          </View>

          {/* Active Status Indicator */}
          {isProcessingQueue ? (
            <View style={styles.activeStatusRow}>
              <ActivityIndicator size="small" color="#1A73E8" style={{ marginRight: 8 }} />
              <Text style={styles.activeStatusText}>
                Extracting Card #{String(queueProgress.currentCardNumber || 0).padStart(3, '0')}
              </Text>
            </View>
          ) : (
            <Text style={styles.idleStatusText}>
              {pendingCards.length > 0
                ? `${pendingCards.length} card(s) waiting for AI extraction.`
                : unextractedCards.length > 0
                ? `${unextractedCards.length} unextracted card(s) ready for AI re-processing.`
                : 'All scanned cards processed!'}
            </Text>
          )}

          {/* Action Trigger Buttons */}
          <View style={styles.buttonRow}>
            {isProcessingQueue ? (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={cancelQueueProcessing}
                activeOpacity={0.8}
              >
                <Ionicons name="stop-circle" size={18} color="#D93025" style={{ marginRight: 6 }} />
                <Text style={styles.cancelBtnText}>Stop Queue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.startBtn, cards.length === 0 && styles.disabledBtn]}
                onPress={handleProcessAll}
                disabled={cards.length === 0}
                activeOpacity={0.88}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.startBtnText}>
                  {pendingCards.length > 0
                    ? `Process Pending (${pendingCards.length})`
                    : unextractedCards.length > 0
                    ? `Extract All (${unextractedCards.length})`
                    : cards.length > 0
                    ? 'Reprocess All Cards'
                    : 'Queue Empty'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Processing Queue List Section */}
        <Text style={styles.sectionHeader}>Queue Status</Text>

        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const cardNum = `Card #${String(item.cardNumber).padStart(3, '0')}`;
            let iconName = 'ellipse-outline';
            let iconColor = '#80868B';
            let statusText = 'Pending';

            if (item.status === 'processing') {
              iconName = 'hourglass-outline';
              iconColor = '#1A73E8';
              statusText = 'Extracting...';
            } else if (item.status === 'processed') {
              iconName = 'checkmark-circle';
              iconColor = '#137333';
              statusText = 'Complete';
            } else if (item.status === 'needs_review') {
              iconName = 'alert-circle';
              iconColor = '#B06000';
              statusText = 'Needs Extraction';
            }

            return (
              <View style={styles.queueItem}>
                <Ionicons name={iconName as any} size={20} color={iconColor} style={{ marginRight: 12 }} />
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.queueCardNum}>{cardNum}</Text>
                  <Text style={styles.queueCardName} numberOfLines={1}>
                    {item.fullName || (item.status === 'pending' ? 'Waiting for extraction...' : 'Unextracted')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reextractPillBtn}
                  onPress={() => handleSingleCardExtract(item.id, item.cardNumber)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={14} color="#1A73E8" style={{ marginRight: 4 }} />
                  <Text style={styles.reextractPillText}>Extract</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 8 : 16,
  },
  header: {
    marginBottom: 16,
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
  },
  counterText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A73E8',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E8F0FE',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1A73E8',
    borderRadius: 5,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
  },
  idleStatusText: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 16,
  },
  buttonRow: {
    marginTop: 4,
  },
  btn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startBtn: {
    backgroundColor: '#1A73E8',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#FCE8E6',
  },
  cancelBtnText: {
    color: '#D93025',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: '#DADCE0',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C4043',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: Platform.OS === 'web' ? 100 : 90,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  queueCardNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#202124',
  },
  queueCardName: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 1,
  },
  reextractPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reextractPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A73E8',
  },
});
