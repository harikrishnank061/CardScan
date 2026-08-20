import AsyncStorage from '@react-native-async-storage/async-storage';
import { VisitingCard } from '../types/card';

const STORAGE_KEY = '@cardscan_visiting_cards_v1';
const SETTINGS_KEY = '@cardscan_settings_v1';

export interface AppSettings {
  autoProcessAfterScanning: boolean;
  reviewBeforeExport: boolean;
  defaultExportFormat: 'xlsx' | 'csv';
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoProcessAfterScanning: true,
  reviewBeforeExport: true,
  defaultExportFormat: 'xlsx',
};

// Realistic Indian Business Card Placeholders/Thumbnails for sample data
const PLACEHOLDER_FRONT_1 = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
const PLACEHOLDER_BACK_1 = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
const PLACEHOLDER_FRONT_2 = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
const PLACEHOLDER_BACK_2 = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80';
const PLACEHOLDER_FRONT_3 = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80';
const PLACEHOLDER_BACK_3 = 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=600&auto=format&fit=crop&q=80';

export const SAMPLE_CARDS: VisitingCard[] = [
  {
    id: 'sample-card-1',
    cardNumber: 1,
    frontImageUri: PLACEHOLDER_FRONT_1,
    backImageUri: PLACEHOLDER_BACK_1,
    fullName: 'Rajesh Kumar',
    designation: 'Senior Product Manager',
    department: 'Technology',
    companyName: 'Apex Innovations Pvt Ltd',
    companyType: 'Private Limited',
    phoneNumbers: ['+91 98765 43210'],
    emailAddresses: ['rajesh.k@apexinnovations.in'],
    websites: ['https://www.apexinnovations.in'],
    address: '12th Floor, Cyber Towers, HITECH City',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    pincode: '500081',
    gstin: '36AAAAA0000A1Z5',
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/rajeshkumar-apex' }
    ],
    services: ['Software Solutions', 'Enterprise AI', 'Cloud Architecture'],
    notes: 'Met at Tech Summit 2026. Interested in mobile OCR engine.',
    status: 'processed',
    confidence: {
      fullName: 'high',
      companyName: 'high',
      phoneNumbers: 'high',
      emailAddresses: 'high',
      address: 'high',
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sample-card-2',
    cardNumber: 2,
    frontImageUri: PLACEHOLDER_FRONT_2,
    backImageUri: PLACEHOLDER_BACK_2,
    fullName: 'Priya Sharma',
    designation: 'Director of Business Development',
    department: 'Sales & Marketing',
    companyName: 'Vanguard Global Solutions',
    companyType: 'Private Limited',
    phoneNumbers: ['+91 98111 22334', '+91 98222 33445', '044 28341100'],
    emailAddresses: ['priya@vanguardglobal.com', 'sales@vanguardglobal.com', 'support@vanguardglobal.com'],
    websites: ['https://www.vanguardglobal.com', 'https://store.vanguardglobal.com'],
    address: 'Suite 402, Prestige Meridian, M.G. Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560001',
    gstin: '29ABCDE1234F1Z9',
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/company/vanguard-global' },
      { platform: 'Instagram', url: 'https://instagram.com/vanguard_global' }
    ],
    services: ['B2B Logistics', 'Supply Chain Tech', 'Global Sourcing'],
    notes: 'Has 3 office locations across South India.',
    status: 'processed',
    confidence: {
      fullName: 'high',
      companyName: 'high',
      phoneNumbers: 'high',
      emailAddresses: 'high',
      address: 'high',
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'sample-card-3',
    cardNumber: 3,
    frontImageUri: PLACEHOLDER_FRONT_3,
    backImageUri: PLACEHOLDER_BACK_3,
    fullName: 'Suresh Venkat',
    designation: 'Managing Partner',
    department: 'Operations',
    companyName: 'Southern Star Enterprises',
    companyType: 'Partnership Firm',
    phoneNumbers: ['+91 94440 12345'],
    emailAddresses: ['suresh@southernstar.co.in'],
    websites: ['https://www.southernstar.co.in'],
    address: 'Old No. 45, Anna Salai, Guindy',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600032',
    gstin: '33AAAFS5678B1ZK',
    socialLinks: [],
    services: ['Industrial Equipment', 'Spare Parts Distribution'],
    notes: 'Front card had name/company, Back card had address & GSTIN details.',
    status: 'processed',
    confidence: {
      fullName: 'high',
      companyName: 'high',
      phoneNumbers: 'medium',
      emailAddresses: 'high',
      address: 'medium',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-card-4',
    cardNumber: 4,
    frontImageUri: PLACEHOLDER_FRONT_1,
    fullName: 'Amit Patel',
    designation: 'Founder & CEO',
    companyName: 'InnovateX Labs',
    phoneNumbers: ['+91 97234 56789'],
    emailAddresses: [],
    websites: ['https://innovatex.io'],
    address: 'SG Highway, Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    pincode: '380054',
    socialLinks: [],
    services: ['Startup Mentorship', 'Venture Studio'],
    notes: 'Email missing on visiting card. Needs follow-up.',
    status: 'needs_review',
    confidence: {
      fullName: 'high',
      companyName: 'medium',
      phoneNumbers: 'high',
      emailAddresses: 'low',
      address: 'medium',
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-card-5',
    cardNumber: 5,
    frontImageUri: PLACEHOLDER_FRONT_2,
    backImageUri: PLACEHOLDER_BACK_1,
    fullName: 'Vikramaditya S.',
    designation: 'Chief Technologist',
    companyName: 'Kaveri Dynamics',
    phoneNumbers: ['+91 99000 88776'],
    emailAddresses: ['vikram@kaveridynamics.com'],
    websites: [],
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    socialLinks: [],
    services: ['IoT Devices', 'Embedded Hardware'],
    notes: 'Low contrast scan. OCR confidence low for address.',
    status: 'needs_review',
    confidence: {
      fullName: 'medium',
      companyName: 'medium',
      phoneNumbers: 'high',
      emailAddresses: 'medium',
      address: 'low',
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const storageService = {
  async getCards(): Promise<VisitingCard[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading cards from storage:', error);
      return [];
    }
  },

  async saveCard(card: VisitingCard): Promise<void> {
    try {
      const cards = await this.getCards();
      const existingIndex = cards.findIndex((c) => c.id === card.id);
      if (existingIndex >= 0) {
        cards[existingIndex] = { ...card, updatedAt: new Date().toISOString() };
      } else {
        cards.unshift(card);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving card to storage:', error);
    }
  },

  async saveAllCards(cards: VisitingCard[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving all cards to storage:', error);
    }
  },

  async deleteCard(id: string): Promise<void> {
    try {
      const cards = await this.getCards();
      const filtered = cards.filter((c) => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting card from storage:', error);
    }
  },

  async resetToSampleData(): Promise<VisitingCard[]> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CARDS));
      return SAMPLE_CARDS;
    } catch (error) {
      console.error('Error resetting sample data:', error);
      return SAMPLE_CARDS;
    }
  },

  async clearAllCards(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing cards from storage:', error);
    }
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
};
