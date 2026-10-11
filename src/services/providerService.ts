import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ServiceProvider } from '../types/provider';

// Kept empty: only providers present in Firestore database are used
export const DEFAULT_PROVIDERS: Record<string, ServiceProvider> = {};

/**
 * Normalizes Firestore document data into a valid ServiceProvider object
 */
export function normalizeDbProvider(id: string, data: any): ServiceProvider {
  return {
    id: data.id || id,
    name: data.name || data.displayName || 'Service Specialist',
    title: data.title || data.jobRole || 'Service Specialist',
    category: data.category || data.jobRole || undefined,
    avatarUrl:
      data.avatarUrl ||
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop',
    rating: typeof data.rating === 'number' ? data.rating : 5.0,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    location: data.location || data.city || data.address || 'Sri Lanka',
    isBackgroundChecked: data.isBackgroundChecked ?? true,
    verificationBadgeText: data.verificationBadgeText || 'VERIFIED PRO',
    rates: data.rates || {
      standard: {
        rate: data.standardRate || '$30',
        unit: data.standardUnit || '/hr',
        note: data.standardNote || 'Standard Rate',
      },
      diagnostic: {
        rate: data.diagnosticRate || '$20',
        note: data.diagnosticNote || 'Diagnostic inspection',
      },
      emergency: {
        rate: data.emergencyRate || '$45',
        note: data.emergencyNote || '24/7 Priority',
      },
    },
    about: data.about || '',
    skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
    verifiedDocuments: Array.isArray(data.verifiedDocuments) ? data.verifiedDocuments : [],
    recentWork: Array.isArray(data.recentWork) ? data.recentWork : [],
    identityVerifications: Array.isArray(data.identityVerifications) ? data.identityVerifications : [],
    licensesAndCertifications: Array.isArray(data.licensesAndCertifications)
      ? data.licensesAndCertifications
      : [],
    insuranceAndGuarantees: Array.isArray(data.insuranceAndGuarantees)
      ? data.insuranceAndGuarantees
      : [],
    experience: data.experience || {
      years: data.years || '3+ yrs',
      tradeLabel: 'EXPERIENCE',
      verifiedJobs: data.verifiedJobs || '15+',
      jobsLabel: 'VERIFIED JOBS',
      history: [],
    },
    ratingOverview: data.ratingOverview || {
      overall: typeof data.rating === 'number' ? data.rating : 5.0,
      totalReviews: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
      percentageByStar: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
      punctuality: 5.0,
      workQuality: 5.0,
      fairPricing: 5.0,
    },
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
}

/**
 * Fetch a single provider strictly from the database (Firestore), returning null if not found
 */
export async function getProviderById(id: string): Promise<ServiceProvider | null> {
  if (!id) return null;

  try {
    // 1. Check 'providers' collection
    const docRef = doc(db, 'providers', id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return normalizeDbProvider(id, snap.data());
    }

    // 2. Check 'users' collection where role is 'provider'
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const u = userSnap.data();
      if (u.role === 'provider') {
        return normalizeDbProvider(id, u);
      }
    }
  } catch (error) {
    console.warn(`Firestore read for provider "${id}" failed:`, error);
  }

  return null;
}

/**
 * Fetch all available service providers strictly from Firestore database
 */
export async function getAllProviders(): Promise<ServiceProvider[]> {
  const providersMap: Record<string, ServiceProvider> = {};

  try {
    // 1. Fetch from Firestore 'providers' collection
    const providersCol = collection(db, 'providers');
    const snap = await getDocs(providersCol);

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      providersMap[id] = normalizeDbProvider(id, data);
    });

    // 2. Fetch from Firestore 'users' collection where role === 'provider'
    try {
      const usersCol = collection(db, 'users');
      const userSnap = await getDocs(usersCol);
      userSnap.forEach((docSnap) => {
        const u = docSnap.data();
        if (u.role === 'provider') {
          const id = u.uid || docSnap.id;
          if (providersMap[id]) {
            providersMap[id] = {
              ...providersMap[id],
              name: providersMap[id].name || u.name,
              location: providersMap[id].location || u.city || u.address || 'Sri Lanka',
            };
          } else {
            providersMap[id] = normalizeDbProvider(id, u);
          }
        }
      });
    } catch (userErr) {
      console.warn('Firestore read for users collection failed:', userErr);
    }
  } catch (error) {
    console.warn('Firestore read for providers collection failed:', error);
  }

  // Returns ONLY service providers actually present in Firestore
  return Object.values(providersMap);
}

/**
 * Seed or update a provider in Firestore database
 */
export async function saveProviderToDb(provider: ServiceProvider): Promise<void> {
  try {
    const docRef = doc(db, 'providers', provider.id);
    await setDoc(docRef, provider, { merge: true });
  } catch (error) {
    console.warn(`Could not save provider "${provider.id}" to Firestore:`, error);
  }
}
