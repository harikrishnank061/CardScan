import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCardContext } from '../context/CardContext';
import { CardItem } from '../components/CardItem';
import { CardStatus, VisitingCard } from '../types/card';

interface CardsScreenProps {
  navigation: any;
}

type FilterTab = 'all' | 'pending' | 'processed' | 'needs_review';

export const CardsScreen: React.FC<CardsScreenProps> = ({ navigation }) => {
  const { cards, deleteCard, refreshCards } = useCardContext();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Tab status filter
      if (activeTab === 'pending' && card.status !== 'pending' && card.status !== 'processing') return false;
      if (activeTab === 'processed' && card.status !== 'processed') return false;
      if (activeTab === 'needs_review' && card.status !== 'needs_review') return false;

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = card.fullName?.toLowerCase().includes(query);
        const companyMatch = card.companyName?.toLowerCase().includes(query);
        const phoneMatch = card.phoneNumbers?.some((p) => p.includes(query));
        const emailMatch = card.emailAddresses?.some((e) => e.toLowerCase().includes(query));
        const cardNumMatch = `card #${card.cardNumber}`.toLowerCase().includes(query);

        return nameMatch || companyMatch || phoneMatch || emailMatch || cardNumMatch;
      }

      return true;
    });
  }, [cards, activeTab, searchQuery]);

  const handleDeleteCard = (card: VisitingCard) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete Card #${card.cardNumber} (${card.fullName || 'Unextracted'})?`)) {
        deleteCard(card.id);
      }
    } else {
      Alert.alert(
        'Delete Visiting Card',
        `Are you sure you want to delete Card #${card.cardNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteCard(card.id) },
        ]
      );
    }
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: cards.length },
    { key: 'pending', label: 'Pending', count: cards.filter((c) => c.status === 'pending' || c.status === 'processing').length },
    { key: 'processed', label: 'Processed', count: cards.filter((c) => c.status === 'processed').length },
    { key: 'needs_review', label: 'Needs Review', count: cards.filter((c) => c.status === 'needs_review').length },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Scanned Cards</Text>
              <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scan')} activeOpacity={0.8}>
                <Ionicons name="camera" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.scanBtnText}>Scan</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#80868B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Name, Company, Phone, Email..."
                placeholderTextColor="#9AA0A6"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color="#80868B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsRow}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabChip, isActive && styles.tabChipActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                    <View style={[styles.badgeCount, isActive && styles.badgeCountActive]}>
                      <Text style={[styles.badgeCountText, isActive && styles.badgeCountTextActive]}>
                        {tab.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#DADCE0" />
            <Text style={styles.emptyTitle}>No Cards Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery.length > 0
                ? `No cards match "${searchQuery}"`
                : 'No visiting cards stored in this category.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate('Scan')}
            >
              <Text style={styles.emptyActionText}>Scan First Card</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <CardItem
            card={item}
            onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
            onDelete={() => handleDeleteCard(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#202124',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A73E8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#202124',
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  tabChipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6368',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  badgeCount: {
    backgroundColor: '#F1F3F4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5F6368',
  },
  badgeCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 60,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C4043',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#80868B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  emptyActionBtn: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
  },
});
