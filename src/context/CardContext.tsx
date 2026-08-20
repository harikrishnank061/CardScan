import React, { createContext, useContext, useState, useEffect } from 'react';
import { VisitingCard, CardStatus } from '../types/card';
import { storageService, AppSettings, DEFAULT_SETTINGS } from '../services/storageService';
import { cardExtractionService } from '../services/cardExtractionService';

interface CardContextType {
  cards: VisitingCard[];
  loading: boolean;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;

  // Dashboard Stats
  totalScannedCount: number;
  processedCount: number;
  needsReviewCount: number;
  pendingCount: number;

  // Actions
  getNextCardNumber: () => number;
  addCapturedCard: (frontImageUri: string, backImageUri?: string) => Promise<VisitingCard>;
  updateCard: (card: VisitingCard) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  processCardById: (id: string) => Promise<VisitingCard | null>;

  // Queue Processing
  isProcessingQueue: boolean;
  queueProgress: { current: number; total: number; currentCardNumber: number | null };
  processAllPendingCards: () => Promise<void>;
  cancelQueueProcessing: () => void;

  // Database Management
  resetSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshCards: () => Promise<void>;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VisitingCard[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Queue processing state
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);
  const [queueProgress, setQueueProgress] = useState<{
    current: number;
    total: number;
    currentCardNumber: number | null;
  }>({ current: 0, total: 0, currentCardNumber: null });

  const [shouldCancelQueue, setShouldCancelQueue] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const loadedCards = await storageService.getCards();
    const loadedSettings = await storageService.getSettings();
    setCards(loadedCards);
    setSettings(loadedSettings);
    setLoading(false);
  };

  const refreshCards = async () => {
    const loadedCards = await storageService.getCards();
    setCards(loadedCards);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storageService.saveSettings(updated);
  };

  const getNextCardNumber = (): number => {
    if (cards.length === 0) return 1;
    const maxNum = Math.max(...cards.map((c) => c.cardNumber || 0));
    return maxNum + 1;
  };

  const addCapturedCard = async (
    frontImageUri: string,
    backImageUri?: string
  ): Promise<VisitingCard> => {
    const nextNumber = getNextCardNumber();
    const newCard: VisitingCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      cardNumber: nextNumber,
      frontImageUri,
      backImageUri,
      phoneNumbers: [],
      emailAddresses: [],
      websites: [],
      socialLinks: [],
      services: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newCard, ...cards];
    setCards(updatedList);
    await storageService.saveCard(newCard);

    // Auto-process if setting enabled
    if (settings.autoProcessAfterScanning) {
      setTimeout(() => {
        processCardById(newCard.id);
      }, 500);
    }

    return newCard;
  };

  const updateCard = async (updatedCard: VisitingCard) => {
    const updatedList = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(updatedList);
    await storageService.saveCard(updatedCard);
  };

  const deleteCard = async (id: string) => {
    const updatedList = cards.filter((c) => c.id !== id);
    setCards(updatedList);
    await storageService.deleteCard(id);
  };

  const processCardById = async (id: string): Promise<VisitingCard | null> => {
    const targetCard = cards.find((c) => c.id === id);
    if (!targetCard) return null;

    // Set processing status
    const processingCard: VisitingCard = { ...targetCard, status: 'processing' };
    await updateCard(processingCard);

    try {
      const extracted = await cardExtractionService.extractCardData(
        targetCard.frontImageUri,
        targetCard.backImageUri
      );

      // Determine status based on confidence
      let finalStatus: CardStatus = 'processed';
      if (
        extracted.confidence.fullName === 'low' ||
        extracted.confidence.companyName === 'low' ||
        extracted.confidence.address === 'low' ||
        !extracted.fullName
      ) {
        finalStatus = 'needs_review';
      }

      const completedCard: VisitingCard = {
        ...processingCard,
        ...extracted,
        status: finalStatus,
        updatedAt: new Date().toISOString(),
      };

      await updateCard(completedCard);
      return completedCard;
    } catch (err) {
      console.error(`Failed to process card ${id}:`, err);
      const failedCard: VisitingCard = {
        ...processingCard,
        status: 'needs_review',
        notes: (processingCard.notes || '') + ' (Extraction failed - Manual review needed)',
        updatedAt: new Date().toISOString(),
      };
      await updateCard(failedCard);
      return failedCard;
    }
  };

  const processAllPendingCards = async () => {
    const pendingList = cards.filter((c) => c.status === 'pending');
    if (pendingList.length === 0) return;

    setIsProcessingQueue(true);
    setShouldCancelQueue(false);
    setQueueProgress({ current: 0, total: pendingList.length, currentCardNumber: null });

    for (let i = 0; i < pendingList.length; i++) {
      if (shouldCancelQueue) break;

      const current = pendingList[i];
      setQueueProgress({
        current: i + 1,
        total: pendingList.length,
        currentCardNumber: current.cardNumber,
      });

      await processCardById(current.id);
    }

    setIsProcessingQueue(false);
    setQueueProgress({ current: 0, total: 0, currentCardNumber: null });
  };

  const cancelQueueProcessing = () => {
    setShouldCancelQueue(true);
    setIsProcessingQueue(false);
  };

  const resetSampleData = async () => {
    setLoading(true);
    const samples = await storageService.resetToSampleData();
    setCards(samples);
    setLoading(false);
  };

  const clearAllData = async () => {
    setLoading(true);
    await storageService.clearAllCards();
    setCards([]);
    setLoading(false);
  };

  // Stats calculation
  const totalScannedCount = cards.length;
  const processedCount = cards.filter((c) => c.status === 'processed').length;
  const needsReviewCount = cards.filter((c) => c.status === 'needs_review').length;
  const pendingCount = cards.filter((c) => c.status === 'pending' || c.status === 'processing').length;

  return (
    <CardContext.Provider
      value={{
        cards,
        loading,
        settings,
        updateSettings,
        totalScannedCount,
        processedCount,
        needsReviewCount,
        pendingCount,
        getNextCardNumber,
        addCapturedCard,
        updateCard,
        deleteCard,
        processCardById,
        isProcessingQueue,
        queueProgress,
        processAllPendingCards,
        cancelQueueProcessing,
        resetSampleData,
        clearAllData,
        refreshCards,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
};
