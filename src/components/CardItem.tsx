import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCard } from '../types/card';

interface CardItemProps {
  card: VisitingCard;
  onPress: () => void;
  onDelete?: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onPress, onDelete }) => {
  const getStatusBadge = () => {
    switch (card.status) {
      case 'processed':
        return { text: 'Processed', bg: '#E6F4EA', color: '#137333', icon: 'checkmark-circle' };
      case 'needs_review':
        return { text: 'Needs Review', bg: '#FEF7E0', color: '#B06000', icon: 'alert-circle' };
      case 'processing':
        return { text: 'Processing...', bg: '#E8F0FE', color: '#1A73E8', icon: 'sync-circle' };
      case 'pending':
      default:
        return { text: 'Pending', bg: '#F1F3F4', color: '#5F6368', icon: 'time-outline' };
    }
  };

  const statusInfo = getStatusBadge();
  const cardNumFormatted = `Card #${String(card.cardNumber).padStart(3, '0')}`;
  const phoneSummary = card.phoneNumbers?.[0] || 'No phone';
  const emailSummary = card.emailAddresses?.[0] || 'No email';

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.85}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.cardNumberText}>{cardNumFormatted}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon as any} size={13} color={statusInfo.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </View>

      {/* Content Row with Thumbnails & Details */}
      <View style={styles.contentRow}>
        <View style={styles.thumbnailsContainer}>
          {card.frontImageUri ? (
            <Image source={{ uri: card.frontImageUri }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumb]}>
              <Text style={styles.placeholderText}>Front</Text>
            </View>
          )}

          {card.backImageUri ? (
            <Image source={{ uri: card.backImageUri }} style={[styles.thumbnail, styles.backThumb]} />
          ) : (
            <View style={[styles.thumbnail, styles.backThumb, styles.placeholderThumb]}>
              <Text style={styles.placeholderText}>No Back</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {card.fullName || 'Unextracted Card'}
          </Text>

          {card.designation ? (
            <Text style={styles.designationText} numberOfLines={1}>
              {card.designation}
            </Text>
          ) : null}

          <Text style={styles.companyText} numberOfLines={1}>
            {card.companyName || 'Unknown Company'}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color="#5F6368" />
            <Text style={styles.metaText} numberOfLines={1}>
              {phoneSummary} {card.phoneNumbers?.length > 1 ? `(+${card.phoneNumbers.length - 1})` : ''}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={13} color="#5F6368" />
            <Text style={styles.metaText} numberOfLines={1}>
              {emailSummary} {card.emailAddresses?.length > 1 ? `(+${card.emailAddresses.length - 1})` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Footer Actions */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          Added: {new Date(card.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.actionsGroup}>
          {onDelete ? (
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={18} color="#D93025" />
            </TouchableOpacity>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color="#9AA0A6" style={{ marginLeft: 6 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  thumbnail: {
    width: 62,
    height: 78,
    borderRadius: 6,
    backgroundColor: '#F1F3F4',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  backThumb: {
    marginLeft: -20,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  placeholderThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9AA0A6',
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 2,
  },
  designationText: {
    fontSize: 12,
    color: '#5F6368',
    fontWeight: '500',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C4043',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#5F6368',
    marginLeft: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  dateText: {
    fontSize: 11,
    color: '#9AA0A6',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
  },
});
