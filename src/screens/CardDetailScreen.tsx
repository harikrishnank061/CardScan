import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';
import { VisitingCard, DuplicateMatch } from '../types/card';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { DynamicListInput } from '../components/DynamicListInput';
import { DuplicateModal } from '../components/DuplicateModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ToastNotification } from '../components/ToastNotification';
import { duplicateService } from '../services/duplicateService';

interface CardDetailScreenProps {
  route: any;
  navigation: any;
}

export const CardDetailScreen: React.FC<CardDetailScreenProps> = ({ route, navigation }) => {
  const { cardId } = route.params || {};
  const { cards, updateCard, processCardById, deleteCard } = useCardContext();

  const [card, setCard] = useState<VisitingCard | null>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatch | null>(null);
  const [showDupModal, setShowDupModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState<boolean>(false);

  useEffect(() => {
    const current = cards.find((c) => c.id === cardId);
    if (current) {
      setCard({ ...current });
      const matches = duplicateService.findDuplicates(current, cards);
      if (matches.length > 0) {
        setDuplicateMatch(matches[0]);
      } else {
        setDuplicateMatch(null);
      }
    }
  }, [cardId, cards]);

  if (!card) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Card not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleFieldChange = (key: keyof VisitingCard, value: any) => {
    setCard((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSave = async () => {
    if (!card) return;
    await updateCard(card);
    showToast(`Card #${String(card.cardNumber).padStart(3, '0')} updated!`, 'success');
  };

  const handleSaveAndNext = async () => {
    if (!card) return;
    await updateCard(card);

    const sorted = [...cards].sort((a, b) => a.cardNumber - b.cardNumber);
    const currentIndex = sorted.findIndex((c) => c.id === card.id);

    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      const nextCard = sorted[currentIndex + 1];
      navigation.replace('CardDetail', { cardId: nextCard.id });
    } else {
      showToast('You have reached the last card.', 'info');
    }
  };

  const handleReprocess = async () => {
    if (!card) return;
    setReprocessing(true);
    const updated = await processCardById(card.id);
    setReprocessing(false);
    if (updated) {
      setCard(updated);
      showToast('AI OCR details refreshed!', 'success');
    }
  };

  const confirmDeleteCard = async () => {
    if (!card) return;
    setShowDeleteModal(false);
    await deleteCard(card.id);
    navigation.goBack();
  };

  const handleMergeDuplicate = async () => {
    if (!card || !duplicateMatch) return;
    const merged = duplicateService.mergeCards(card, duplicateMatch.existingCard);
    await updateCard(merged);
    await deleteCard(card.id);
    setShowDupModal(false);
    navigation.replace('CardDetail', { cardId: merged.id });
  };

  const cardNumText = `Card #${String(card.cardNumber).padStart(3, '0')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ToastNotification
        visible={!!toastMessage}
        message={toastMessage || ''}
        type={toastType}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#202124" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cardNumText}</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.reprocessHeaderBtn} onPress={handleReprocess} disabled={reprocessing}>
            <Ionicons name="sync-outline" size={20} color="#1A73E8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteHeaderBtn} onPress={() => setShowDeleteModal(true)}>
            <Ionicons name="trash-outline" size={20} color="#D93025" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Potential Duplicate Banner */}
        {duplicateMatch ? (
          <TouchableOpacity style={styles.duplicateBanner} onPress={() => setShowDupModal(true)} activeOpacity={0.8}>
            <Ionicons name="alert-circle" size={20} color="#B06000" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.duplicateTitle}>Possible Duplicate Detected</Text>
              <Text style={styles.duplicateSub}>Matches Card #{duplicateMatch.existingCard.cardNumber}. Tap to resolve.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B06000" />
          </TouchableOpacity>
        ) : null}

        {/* Card Front & Back Images Preview */}
        <View style={styles.imagesSection}>
          <Text style={styles.sectionHeader}>CARD IMAGES</Text>
          <View style={styles.imageGrid}>
            <TouchableOpacity style={styles.imageBox} onPress={() => setImageModalUri(card.frontImageUri)}>
              <Image source={{ uri: card.frontImageUri }} style={styles.cardImage} />
              <View style={styles.imageTag}>
                <Text style={styles.imageTagText}>FRONT</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageBox}
              onPress={() => card.backImageUri && setImageModalUri(card.backImageUri)}
            >
              {card.backImageUri ? (
                <>
                  <Image source={{ uri: card.backImageUri }} style={styles.cardImage} />
                  <View style={styles.imageTag}>
                    <Text style={styles.imageTagText}>BACK</Text>
                  </View>
                </>
              ) : (
                <View style={[styles.cardImage, styles.noBackBox]}>
                  <Ionicons name="image-outline" size={28} color="#9AA0A6" />
                  <Text style={styles.noBackLabel}>No Back Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Confidence Indicators */}
        {card.confidence ? (
          <View style={styles.confidenceSection}>
            <Text style={styles.sectionHeader}>AI OCR CONFIDENCE</Text>
            <View style={styles.confidenceGrid}>
              <ConfidenceBadge label="Name:" level={card.confidence.fullName} />
              <ConfidenceBadge label="Company:" level={card.confidence.companyName} />
              <ConfidenceBadge label="Phones:" level={card.confidence.phoneNumbers} />
              <ConfidenceBadge label="Emails:" level={card.confidence.emailAddresses} />
              <ConfidenceBadge label="Address:" level={card.confidence.address} />
            </View>
          </View>
        ) : null}

        {/* PERSON SECTION */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>PERSON</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={card.fullName || ''}
            onChangeText={(t) => handleFieldChange('fullName', t)}
            placeholder="e.g. Raj Kumar"
            placeholderTextColor="#9AA0A6"
          />

          <Text style={styles.fieldLabel}>Designation / Job Title</Text>
          <TextInput
            style={styles.textInput}
            value={card.designation || ''}
            onChangeText={(t) => handleFieldChange('designation', t)}
            placeholder="e.g. Managing Director"
            placeholderTextColor="#9AA0A6"
          />

          <Text style={styles.fieldLabel}>Department</Text>
          <TextInput
            style={styles.textInput}
            value={card.department || ''}
            onChangeText={(t) => handleFieldChange('department', t)}
            placeholder="e.g. Technology / Sales"
            placeholderTextColor="#9AA0A6"
          />
        </View>

        {/* COMPANY SECTION */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>COMPANY</Text>

          <Text style={styles.fieldLabel}>Company Name</Text>
          <TextInput
            style={styles.textInput}
            value={card.companyName || ''}
            onChangeText={(t) => handleFieldChange('companyName', t)}
            placeholder="e.g. ABC Technologies"
            placeholderTextColor="#9AA0A6"
          />

          <Text style={styles.fieldLabel}>Company Type</Text>
          <TextInput
            style={styles.textInput}
            value={card.companyType || ''}
            onChangeText={(t) => handleFieldChange('companyType', t)}
            placeholder="e.g. Private Limited / Partnership"
            placeholderTextColor="#9AA0A6"
          />
        </View>

        {/* MULTIPLE PHONE NUMBERS */}
        <DynamicListInput
          title="PHONE NUMBERS"
          items={card.phoneNumbers || []}
          placeholder="+91 98765 XXXXX"
          keyboardType="phone-pad"
          addButtonText="+ Add Phone Number"
          onChangeItems={(items) => handleFieldChange('phoneNumbers', items)}
        />

        {/* MULTIPLE EMAIL ADDRESSES */}
        <DynamicListInput
          title="EMAIL ADDRESSES"
          items={card.emailAddresses || []}
          placeholder="name@company.com"
          keyboardType="email-address"
          addButtonText="+ Add Email Address"
          onChangeItems={(items) => handleFieldChange('emailAddresses', items)}
        />

        {/* MULTIPLE WEBSITES */}
        <DynamicListInput
          title="WEBSITES"
          items={card.websites || []}
          placeholder="https://www.company.com"
          keyboardType="url"
          addButtonText="+ Add Website URL"
          onChangeItems={(items) => handleFieldChange('websites', items)}
        />

        {/* ADDRESS & LOCATION SECTION */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>ADDRESS & TAX DETAILS</Text>

          <Text style={styles.fieldLabel}>Full Street Address</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={card.address || ''}
            onChangeText={(t) => handleFieldChange('address', t)}
            placeholder="Street address, building, landmark..."
            placeholderTextColor="#9AA0A6"
            multiline
            numberOfLines={2}
          />

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                value={card.city || ''}
                onChangeText={(t) => handleFieldChange('city', t)}
                placeholder="City"
                placeholderTextColor="#9AA0A6"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.textInput}
                value={card.state || ''}
                onChangeText={(t) => handleFieldChange('state', t)}
                placeholder="State"
                placeholderTextColor="#9AA0A6"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                value={card.pincode || ''}
                onChangeText={(t) => handleFieldChange('pincode', t)}
                placeholder="Pincode"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.fieldLabel}>GSTIN</Text>
              <TextInput
                style={styles.textInput}
                value={card.gstin || ''}
                onChangeText={(t) => handleFieldChange('gstin', t)}
                placeholder="GSTIN Number"
                placeholderTextColor="#9AA0A6"
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* SERVICES & NOTES */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>SERVICES & NOTES</Text>

          <Text style={styles.fieldLabel}>Services / Products (comma separated)</Text>
          <TextInput
            style={styles.textInput}
            value={(card.services || []).join(', ')}
            onChangeText={(t) =>
              handleFieldChange(
                'services',
                t.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="e.g. Cloud AI, Software, Hardware"
            placeholderTextColor="#9AA0A6"
          />

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={card.notes || ''}
            onChangeText={(t) => handleFieldChange('notes', t)}
            placeholder="Add notes about where you met..."
            placeholderTextColor="#9AA0A6"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Bottom CTA Actions */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionBtn, styles.saveBtnPrimary]} onPress={handleSave} activeOpacity={0.88}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save Card</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.saveNextBtn]} onPress={handleSaveAndNext} activeOpacity={0.85}>
            <Text style={styles.saveNextText}>Save & Next</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A73E8" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.reprocessBtn]} onPress={handleReprocess} activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#5F6368" style={{ marginRight: 6 }} />
            <Text style={styles.reprocessText}>Reprocess AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.deleteCardBtn]} onPress={() => setShowDeleteModal(true)} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color="#D93025" style={{ marginRight: 6 }} />
            <Text style={styles.deleteCardText}>Delete Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modern Custom Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Visiting Card?"
        message={`Are you sure you want to delete Card #${String(card.cardNumber).padStart(3, '0')} (${card.fullName || 'Unextracted Card'})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDeleteCard}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Duplicate Modal */}
      <DuplicateModal
        visible={showDupModal}
        match={duplicateMatch}
        onKeepBoth={() => setShowDupModal(false)}
        onMerge={handleMergeDuplicate}
        onIgnore={() => setShowDupModal(false)}
      />

      {/* Image Preview Modal */}
      <Modal visible={!!imageModalUri} transparent animationType="fade" onRequestClose={() => setImageModalUri(null)}>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setImageModalUri(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {imageModalUri ? (
            <Image source={{ uri: imageModalUri }} style={styles.fullImagePreview} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1A73E8',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reprocessHeaderBtn: {
    padding: 6,
    marginRight: 8,
  },
  deleteHeaderBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#5F6368',
    marginBottom: 12,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A73E8',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  duplicateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7E0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCE8E6',
  },
  duplicateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B06000',
  },
  duplicateSub: {
    fontSize: 12,
    color: '#B06000',
  },
  imagesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3C4043',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageBox: {
    width: '48%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F3F4',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noBackBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBackLabel: {
    fontSize: 11,
    color: '#80868B',
    marginTop: 4,
  },
  confidenceSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  confidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#202124',
  },
  multilineInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  rowTwoCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonsContainer: {
    marginTop: 10,
  },
  actionBtn: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  saveBtnPrimary: {
    backgroundColor: '#1A73E8',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveNextBtn: {
    backgroundColor: '#E8F0FE',
  },
  saveNextText: {
    color: '#1A73E8',
    fontSize: 15,
    fontWeight: '600',
  },
  reprocessBtn: {
    backgroundColor: '#F1F3F4',
  },
  reprocessText: {
    color: '#5F6368',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteCardBtn: {
    backgroundColor: '#FCE8E6',
    marginTop: 4,
  },
  deleteCardText: {
    color: '#D93025',
    fontSize: 15,
    fontWeight: '700',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImagePreview: {
    width: '94%',
    height: '80%',
  },
});
