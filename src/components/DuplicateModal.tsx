import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DuplicateMatch } from '../types/card';

interface DuplicateModalProps {
  visible: boolean;
  match: DuplicateMatch | null;
  onKeepBoth: () => void;
  onMerge: () => void;
  onIgnore: () => void;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  visible,
  match,
  onKeepBoth,
  onMerge,
  onIgnore,
}) => {
  if (!match) return null;

  const existingCardNum = `Card #${String(match.existingCard.cardNumber).padStart(3, '0')}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onIgnore}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="copy-outline" size={28} color="#E37400" />
          </View>

          <Text style={styles.title}>Possible Duplicate Detected</Text>

          <Text style={styles.description}>
            This business card matches an existing record (<Text style={styles.bold}>{existingCardNum}</Text> - {match.existingCard.fullName || 'No Name'}) based on:
          </Text>

          <View style={styles.tagsContainer}>
            {match.matchedFields.map((field, idx) => (
              <View key={`match_${idx}`} style={styles.tag}>
                <Ionicons name="checkmark-circle" size={14} color="#E37400" style={{ marginRight: 4 }} />
                <Text style={styles.tagText}>{field}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subtext}>
            What would you like to do with this record?
          </Text>

          <View style={styles.buttonStack}>
            <TouchableOpacity style={[styles.btn, styles.mergeBtn]} onPress={onMerge} activeOpacity={0.85}>
              <Ionicons name="git-merge-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.mergeBtnText}>Merge Details Into Existing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.keepBothBtn]} onPress={onKeepBoth} activeOpacity={0.85}>
              <Text style={styles.keepBothBtnText}>Keep Both Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.ignoreBtn]} onPress={onIgnore} activeOpacity={0.85}>
              <Text style={styles.ignoreBtnText}>Ignore & Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF7E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: '#202124',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B06000',
  },
  subtext: {
    fontSize: 13,
    color: '#80868B',
    marginBottom: 16,
  },
  buttonStack: {
    width: '100%',
  },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  mergeBtn: {
    backgroundColor: '#1A73E8',
  },
  mergeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  keepBothBtn: {
    backgroundColor: '#F1F3F4',
  },
  keepBothBtnText: {
    color: '#3C4043',
    fontSize: 14,
    fontWeight: '600',
  },
  ignoreBtn: {
    backgroundColor: 'transparent',
    marginBottom: 0,
  },
  ignoreBtnText: {
    color: '#80868B',
    fontSize: 14,
    fontWeight: '500',
  },
});
