export interface UpfrontRates {
  standard: {
    rate: string;
    unit: string;
    note: string;
  };
  diagnostic: {
    rate: string;
    note: string;
  };
  emergency: {
    rate: string;
    note: string;
  };
}

export interface VerifiedDocument {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  isValidated: boolean;
}

export interface RecentWorkItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface IdentityVerification {
  id: string;
  title: string;
  badge: string;
  details: string;
  iconName: string;
}

export interface ProfessionalLicense {
  id: string;
  title: string;
  badge?: string;
  issuer: string;
  licenseNumber?: string;
  expiry?: string;
  hasViewCert?: boolean;
  description?: string;
  certificateImageUrl?: string;
}

export interface InsuranceItem {
  id: string;
  title: string;
  badge: string;
  provider: string;
  description: string;
  iconName: string;
}

export type UserRole = 'customer' | 'provider' | 'admin';

export interface ExperienceHistoryItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface ExperienceSummary {
  years: string;
  tradeLabel: string;
  verifiedJobs: string;
  jobsLabel: string;
  history: ExperienceHistoryItem[];
}

export interface ReviewPhoto {
  url: string;
  tag: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  authorInitials: string;
  avatarBgColor?: string;
  timeAgo: string;
  serviceType: string;
  verifiedType: string;
  rating: number;
  content: string;
  photos?: ReviewPhoto[];
  workLocation: string;
  invoiceNumber?: string;
  helpfulCount: number;
}

export interface RatingBreakdown {
  overall: number;
  totalReviews: number;
  percentageByStar: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  punctuality: number;
  workQuality: number;
  fairPricing: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  title: string;
  category?: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  location: string;
  isBackgroundChecked: boolean;
  verificationBadgeText: string;
  
  // Overview Tab
  rates: UpfrontRates;
  about: string;
  skills: string[];
  verifiedDocuments: VerifiedDocument[];
  recentWork: RecentWorkItem[];

  // Credentials Tab
  identityVerifications: IdentityVerification[];
  licensesAndCertifications: ProfessionalLicense[];
  insuranceAndGuarantees: InsuranceItem[];
  experience: ExperienceSummary;

  // Reviews Tab
  ratingOverview: RatingBreakdown;
  reviews: CustomerReview[];
}
