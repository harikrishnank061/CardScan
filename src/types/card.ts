export type CardStatus = 'pending' | 'processing' | 'processed' | 'needs_review' | 'failed';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface VisitingCardConfidence {
  fullName?: ConfidenceLevel;
  companyName?: ConfidenceLevel;
  phoneNumbers?: ConfidenceLevel;
  emailAddresses?: ConfidenceLevel;
  address?: ConfidenceLevel;
}

export interface VisitingCard {
  id: string;
  cardNumber: number;

  frontImageUri: string;
  backImageUri?: string;

  fullName?: string;
  designation?: string;
  department?: string;

  companyName?: string;
  companyType?: string;

  phoneNumbers: string[];

  emailAddresses: string[];

  websites: string[];

  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  gstin?: string;

  socialLinks: SocialLink[];

  services: string[];

  notes?: string;

  status: CardStatus;

  confidence?: VisitingCardConfidence;

  createdAt: string;
  updatedAt: string;
}

export interface DuplicateMatch {
  existingCard: VisitingCard;
  matchedFields: string[];
}
