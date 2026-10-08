import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ServiceProvider } from '../types/provider';

// Default providers database
export const DEFAULT_PROVIDERS: Record<string, ServiceProvider> = {
  'gamage-wdk': {
    id: 'gamage-wdk',
    name: 'Gamage W.D.K.',
    title: 'Master Plumber & Pipe Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: 128,
    location: 'Colombo & Western Province',
    isBackgroundChecked: true,
    verificationBadgeText: 'VERIFIED BACKGROUND CHECKED',

    // Overview Tab
    rates: {
      standard: {
        rate: '$40',
        unit: '/hr',
        note: 'Min 1 hour',
      },
      diagnostic: {
        rate: '$25',
        note: 'Waived if hired',
      },
      emergency: {
        rate: '$55',
        note: '24/7 Priority',
      },
    },
    about:
      'Certified master plumber with 12+ years of residential and commercial experience. Specialized in rapid leak detection, pipe replacement, and high-pressure drainage systems.',
    skills: [
      'Plumbing',
      'Pipe Repair',
      'Drain Cleaning',
      'Water Heater',
      'Leak Detection',
    ],
    verifiedDocuments: [
      {
        id: 'doc-1',
        title: 'Police Clearance Certificate',
        subtitle: 'Issued Jan 2024',
        iconName: 'shield-checkmark-outline',
        isValidated: true,
      },
      {
        id: 'doc-2',
        title: 'National ID (NIC Verified)',
        subtitle: 'Identity Confirmed',
        iconName: 'card-outline',
        isValidated: true,
      },
      {
        id: 'doc-3',
        title: 'Vocational NVQ Level 4 License',
        subtitle: 'Sri Lanka TVEC Accredited',
        iconName: 'school-outline',
        isValidated: true,
      },
    ],
    recentWork: [
      {
        id: 'work-1',
        title: 'Leak Repair',
        imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'work-2',
        title: 'Valves & Drains',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'work-3',
        title: 'Pressure Lines',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'work-4',
        title: 'Water Heater Piping',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop',
      },
    ],

    // Credentials Tab
    identityVerifications: [
      {
        id: 'id-1',
        title: 'National Identity Card (NIC)',
        badge: 'ACTIVE',
        details: 'Issued by Dept. of Registration of Persons • National Registry Match',
        iconName: 'card-outline',
      },
      {
        id: 'id-2',
        title: 'Police Clearance Certificate',
        badge: 'CLEAR',
        details: 'Western Province Police Division • Validated Clean Record (Jan 2024)',
        iconName: 'shield-checkmark-outline',
      },
      {
        id: 'id-3',
        title: 'Proof of Address & Residence',
        badge: 'VERIFIED',
        details: 'Utility Billing Verification • Colombo District Resident',
        iconName: 'location-outline',
      },
    ],
    licensesAndCertifications: [
      {
        id: 'lic-1',
        title: 'Master Plumber NVQ Level 4',
        badge: 'ACCREDITED',
        issuer: 'TVEC (Tertiary and Vocational Education Commission) Sri Lanka',
        licenseNumber: 'NVQ-PLM-2018-842',
        expiry: '2027',
        hasViewCert: true,
        certificateImageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'lic-2',
        title: 'High-Pressure Pipe & Drainage Specialist',
        issuer: 'National Institute of Technical Training (NITT)',
        description: 'Certified in hydraulic load balancing and commercial grade PVC/copper conduits.',
      },
      {
        id: 'lic-3',
        title: 'Backflow Prevention & Safety Compliance',
        issuer: 'OSHA Standards & Local Municipal Building Codes',
        description: 'Certified cross-connection control and water system contamination prevention.',
      },
    ],
    insuranceAndGuarantees: [
      {
        id: 'ins-1',
        title: '$1,000,000 Liability Cover',
        badge: 'Active Policy',
        provider: 'Ceylinco General Insurance • Policy #CG-PL-88391-X',
        description: 'Protects against accidental water damage, pipeline burst, or structural impact during work.',
        iconName: 'shield-checkmark-outline',
      },
      {
        id: 'ins-2',
        title: '30-Day Workmanship Guarantee',
        badge: 'Standard',
        provider: 'HomeFix Protection Guarantee',
        description: 'Free re-service guarantee on all completed valve replacements & pipe connections.',
        iconName: 'construct-outline',
      },
    ],
    experience: {
      years: '12+ yrs',
      tradeLabel: 'TRADE EXPERIENCE',
      verifiedJobs: '500+',
      jobsLabel: 'VERIFIED JOBS',
      history: [
        {
          id: 'exp-1',
          company: 'Colombo Municipal Water Works',
          role: 'Senior Technician & Pipe Inspector',
          period: '2012 – 2017 (5 Years)',
          description: 'Managed main line diagnostics, high-pressure distribution maintenance, and pump station calibrations.',
        },
        {
          id: 'exp-2',
          company: 'Independent Master Plumber',
          role: 'Western Province Residential & Commercial',
          period: '2017 – Present',
          description: 'Specializing in concealed fixtures, pressure regulators, and precision water heating installations.',
        },
      ],
    },

    // Reviews Tab
    ratingOverview: {
      overall: 4.8,
      totalReviews: 128,
      percentageByStar: {
        5: 86,
        4: 12,
        3: 2,
        2: 1,
        1: 0,
      },
      punctuality: 4.9,
      workQuality: 4.8,
      fairPricing: 4.7,
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Kasun Perera',
        authorInitials: 'KP',
        avatarBgColor: '#10B981',
        timeAgo: '2 days ago',
        serviceType: 'EMERGENCY PIPE LEAK',
        verifiedType: 'Verified',
        rating: 5,
        content:
          'Gamage arrived within 35 minutes on a Sunday night when our main supply pipe cracked. Thoroughly diagnosed the issue, replaced the valve, and cleaned up cleanly. Completely honest pricing with no extra unexpected charges.',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
            tag: 'Repair photo',
          },
          {
            url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400&auto=format&fit=crop',
            tag: 'Completed joint',
          },
        ],
        workLocation: 'Work: Colombo 07 Resident',
        invoiceNumber: 'Invoice #LK-8842',
        helpfulCount: 14,
      },
      {
        id: 'rev-2',
        author: 'Amanda Silva',
        authorInitials: 'AS',
        avatarBgColor: '#E5E7EB',
        timeAgo: '1 week ago',
        serviceType: 'BATHROOM VALVE REPLACEMENT',
        verifiedType: 'Verified',
        rating: 5,
        content:
          'Top tier craftsmanship. He installed concealed brass fixtures and realigned our pressure release manifold without damaging any wall tiles. Highly recommended for complicated plumbing setups.',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400&auto=format&fit=crop',
            tag: 'Pressure lines',
          },
          {
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
            tag: 'Fittings',
          },
        ],
        workLocation: 'Work: Nugegoda Villa',
        invoiceNumber: 'Invoice #LK-8711',
        helpfulCount: 8,
      },
      {
        id: 'rev-3',
        author: 'Rohan De Alwis',
        authorInitials: 'RA',
        avatarBgColor: '#E5E7EB',
        timeAgo: '3 weeks ago',
        serviceType: 'WATER HEATER INSTALLATION',
        verifiedType: 'Verified',
        rating: 4,
        content:
          'Very punctual and methodical technician. He tested water temperature curves and checked for grounding safety before completing the job. Would hire again without hesitation.',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400&auto=format&fit=crop',
            tag: 'Heater unit',
          },
          {
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
            tag: 'Safety valve',
          },
        ],
        workLocation: 'Work: Dehiwala Apartment',
        invoiceNumber: 'Invoice #LK-8430',
        helpfulCount: 5,
      },
    ],
  },

  'nimal-silva': {
    id: 'nimal-silva',
    name: 'Nimal Silva',
    title: 'Licensed Master Electrician & Safety Inspector',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    rating: 4.8,
    reviewCount: 94,
    location: 'Colombo & Gampaha District',
    isBackgroundChecked: true,
    verificationBadgeText: 'VERIFIED BACKGROUND CHECKED',

    rates: {
      standard: {
        rate: '$35',
        unit: '/hr',
        note: 'Min 1 hour',
      },
      diagnostic: {
        rate: '$20',
        note: 'Waived if hired',
      },
      emergency: {
        rate: '$50',
        note: '24/7 Priority',
      },
    },
    about:
      'Certified electrical contractor with 10+ years specializing in residential fuse board replacements, short-circuit diagnostics, surge protection, and commercial 3-phase balancing.',
    skills: [
      'Short Circuit Repair',
      'Switchboard Wiring',
      'Surge Protection',
      'Breaker Panels',
      'Lighting & Fans',
    ],
    verifiedDocuments: [
      {
        id: 'doc-1',
        title: 'Police Clearance Certificate',
        subtitle: 'Issued Feb 2024',
        iconName: 'shield-checkmark-outline',
        isValidated: true,
      },
      {
        id: 'doc-2',
        title: 'National ID (NIC Verified)',
        subtitle: 'Identity Confirmed',
        iconName: 'card-outline',
        isValidated: true,
      },
      {
        id: 'doc-3',
        title: 'Chartered Electrical License (NVQ 4)',
        subtitle: 'CEB & TVEC Sri Lanka Registered',
        iconName: 'school-outline',
        isValidated: true,
      },
    ],
    recentWork: [
      {
        id: 'work-1',
        title: 'Distribution Board Upgrade',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'work-2',
        title: 'Smart Lighting Circuit',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
      },
    ],

    identityVerifications: [
      {
        id: 'id-1',
        title: 'National Identity Card (NIC)',
        badge: 'ACTIVE',
        details: 'Issued by Dept. of Registration of Persons',
        iconName: 'card-outline',
      },
      {
        id: 'id-2',
        title: 'Police Clearance Certificate',
        badge: 'CLEAR',
        details: 'Western Province Police Division • Validated Clean Record',
        iconName: 'shield-checkmark-outline',
      },
      {
        id: 'id-3',
        title: 'Proof of Address & Residence',
        badge: 'VERIFIED',
        details: 'Utility Billing Verification • Maharagama Resident',
        iconName: 'location-outline',
      },
    ],
    licensesAndCertifications: [
      {
        id: 'lic-1',
        title: 'Industrial Electrical Technician NVQ 4',
        badge: 'ACCREDITED',
        issuer: 'Ceylon Electricity Board & TVEC Sri Lanka',
        licenseNumber: 'NVQ-ELE-2019-104',
        expiry: '2028',
        hasViewCert: true,
      },
      {
        id: 'lic-2',
        title: 'High Voltage Surge & Earthing Specialist',
        issuer: 'National Apprentice and Industrial Training Authority (NAITA)',
        description: 'Certified in digital earth resistance testing and lightning diversion systems.',
      },
    ],
    insuranceAndGuarantees: [
      {
        id: 'ins-1',
        title: '$500,000 Electrical Fire Cover',
        badge: 'Active Policy',
        provider: 'Sri Lanka Insurance Corporation',
        description: 'Comprehensive policy covering accidental electrical faults during installation.',
        iconName: 'shield-checkmark-outline',
      },
      {
        id: 'ins-2',
        title: '60-Day Workmanship Guarantee',
        badge: 'Standard',
        provider: 'HomeFix Guarantee',
        description: 'Free callout and inspection if any installed breaker trips within 60 days.',
        iconName: 'construct-outline',
      },
    ],
    experience: {
      years: '10+ yrs',
      tradeLabel: 'TRADE EXPERIENCE',
      verifiedJobs: '380+',
      jobsLabel: 'VERIFIED JOBS',
      history: [
        {
          id: 'exp-1',
          company: 'Lanka Electricity Company (LECO)',
          role: 'Substation & Metering Technician',
          period: '2014 – 2019 (5 Years)',
          description: 'Specialized in load testing, industrial transformer maintenance, and safety cutoff units.',
        },
        {
          id: 'exp-2',
          company: 'Nimal Silva Electrical Works',
          role: 'Lead Contractor',
          period: '2019 – Present',
          description: 'Handling luxury residential smart automation and complete architectural rewire projects.',
        },
      ],
    },

    ratingOverview: {
      overall: 4.8,
      totalReviews: 94,
      percentageByStar: {
        5: 82,
        4: 15,
        3: 3,
        2: 0,
        1: 0,
      },
      punctuality: 4.8,
      workQuality: 4.9,
      fairPricing: 4.6,
    },
    reviews: [
      {
        id: 'rev-n1',
        author: 'Dinesh Jayasuriya',
        authorInitials: 'DJ',
        avatarBgColor: '#3B82F6',
        timeAgo: '4 days ago',
        serviceType: 'CIRCUIT BREAKER REPLACEMENT',
        verifiedType: 'Verified',
        rating: 5,
        content:
          'Nimal fixed our main trips instantly. Found a scorched wire behind the pantry wall that could have caused an electrical hazard. Extremely professional and courteous.',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
            tag: 'New Breakers',
          },
        ],
        workLocation: 'Work: Rajagiriya Apartment',
        invoiceNumber: 'Invoice #LK-9021',
        helpfulCount: 9,
      },
    ],
  },
};

/**
 * Fetch a single provider by ID from Firestore, with fallback to pre-defined dataset
 */
export async function getProviderById(id: string): Promise<ServiceProvider | null> {
  const fallback = DEFAULT_PROVIDERS[id] || DEFAULT_PROVIDERS['gamage-wdk'];

  try {
    const docRef = doc(db, 'providers', id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as ServiceProvider;
      return {
        ...fallback,
        ...data,
      };
    }
  } catch (error) {
    console.warn(`Firestore read for provider "${id}" failed, falling back to local dataset:`, error);
  }

  return fallback;
}

/**
 * Fetch all available providers
 */
export async function getAllProviders(): Promise<ServiceProvider[]> {
  try {
    const providersCol = collection(db, 'providers');
    const snap = await getDocs(providersCol);

    if (!snap.empty) {
      const list: ServiceProvider[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as ServiceProvider);
      });
      if (list.length > 0) return list;
    }
  } catch (error) {
    console.warn('Firestore read for providers list failed, using local dataset:', error);
  }

  return Object.values(DEFAULT_PROVIDERS);
}

/**
 * Seed or update a provider in Firestore
 */
export async function saveProviderToDb(provider: ServiceProvider): Promise<void> {
  try {
    const docRef = doc(db, 'providers', provider.id);
    await setDoc(docRef, provider, { merge: true });
  } catch (error) {
    console.warn(`Could not save provider "${provider.id}" to Firestore:`, error);
  }
}
