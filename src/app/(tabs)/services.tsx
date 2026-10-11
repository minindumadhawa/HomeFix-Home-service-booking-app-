import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getAllProviders } from '../../services/providerService';
import { ServiceProvider } from '../../types/provider';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'AC & Appliances'];

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category.toLowerCase()) {
    case 'plumbing':
      return 'build-outline';
    case 'electrical':
      return 'flash-outline';
    case 'cleaning':
      return 'sparkles-outline';
    case 'carpentry':
      return 'hammer-outline';
    case 'ac & appliances':
    case 'appliances':
    case 'hvac':
      return 'snow-outline';
    default:
      return 'construct-outline';
  }
}

function resolveProviderCategory(provider: ServiceProvider): string {
  if (provider.category) {
    const matched = CATEGORIES.find(
      (c) => c.toLowerCase() === provider.category?.toLowerCase()
    );
    if (matched) return matched;
  }

  const text = `${provider.title} ${provider.skills?.join(' ')} ${provider.about}`.toLowerCase();
  if (text.includes('plumb') || text.includes('pipe') || text.includes('drain')) return 'Plumbing';
  if (text.includes('electr') || text.includes('circuit') || text.includes('wiring')) return 'Electrical';
  if (text.includes('clean') || text.includes('hygiene') || text.includes('carpet')) return 'Cleaning';
  if (text.includes('carpent') || text.includes('wood') || text.includes('hinge') || text.includes('lock')) return 'Carpentry';
  if (text.includes('ac') || text.includes('appliance') || text.includes('refriger') || text.includes('hvac')) return 'AC & Appliances';
  return 'Plumbing';
}

export default function ServicesScreen() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProviders = useCallback(async () => {
    try {
      const data = await getAllProviders();
      setProviders(data);
    } catch (error) {
      console.warn('Error fetching providers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProviders();
    }, [fetchProviders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProviders();
  };

  // Map providers with calculated category
  const providersWithCategory = useMemo(() => {
    return providers.map((p) => ({
      ...p,
      resolvedCategory: resolveProviderCategory(p),
    }));
  }, [providers]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: providers.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = providersWithCategory.filter((p) => p.resolvedCategory === cat).length;
      }
    });
    return counts;
  }, [providersWithCategory, providers.length]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providersWithCategory.filter((provider) => {
      const matchesCategory =
        activeCategory === 'All' || provider.resolvedCategory === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nameMatch = provider.name?.toLowerCase().includes(q);
      const titleMatch = provider.title?.toLowerCase().includes(q);
      const locationMatch = provider.location?.toLowerCase().includes(q);
      const categoryMatch = provider.resolvedCategory.toLowerCase().includes(q);
      const skillsMatch = provider.skills?.some((s) => s.toLowerCase().includes(q));

      return nameMatch || titleMatch || locationMatch || categoryMatch || skillsMatch;
    });
  }, [providersWithCategory, activeCategory, searchQuery]);

  // Urgent Emergency Provider strictly from database
  const emergencyProvider = useMemo(() => {
    if (filteredProviders.length === 0) return null;
    const withEmergency = filteredProviders.find((p) => p.rates?.emergency?.rate);
    return withEmergency || filteredProviders[0] || null;
  }, [filteredProviders]);

  // Rapid service packages dynamically generated only from database providers
  const servicePacks = useMemo(() => {
    return filteredProviders.map((p) => ({
      id: `pack-${p.id}`,
      title: `${p.title} - Inspection & Diagnostic`,
      desc: p.about ? p.about.slice(0, 85) + '...' : `Certified ${p.resolvedCategory} diagnostics and repairs.`,
      price: `${p.rates?.standard?.rate || '$30'}${p.rates?.standard?.unit || '/hr'}`,
      duration: p.rates?.standard?.note || '~1 - 2 hrs',
      category: p.resolvedCategory,
      providerName: p.name,
      providerId: p.id,
    }));
  }, [filteredProviders]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Services Directory</Text>
              <Text style={styles.headerSubtitle}>
                {providers.length} Verified Service Specialists
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search specialists, skills, repairs..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/filter')}>
            <Ionicons name="options-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsScroll}
          contentContainerStyle={styles.pillsContainer}
        >
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Ionicons
                  name={getCategoryIcon(cat)}
                  size={14}
                  color={isActive ? '#FFF' : '#4B5563'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {cat} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Urgent Help / SOS Dispatch Banner */}
        {emergencyProvider && (
          <View style={styles.urgentBanner}>
            <View style={styles.urgentBannerTop}>
              <View style={styles.urgentIconBox}>
                <Ionicons name="warning" size={24} color="#DC2626" />
                <View style={styles.urgentDot} />
              </View>
              <View style={styles.urgentTextContent}>
                <View style={styles.urgentTitleRow}>
                  <Text style={styles.urgentTitle}>Need Urgent Help?</Text>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityBadgeText}>24/7 SOS</Text>
                  </View>
                </View>
                <Text style={styles.urgentSubtitle}>
                  Instant technician dispatch • {emergencyProvider.name} is available on standby
                </Text>
              </View>
            </View>
            <View style={styles.urgentBannerBottom}>
              <View style={styles.standbyRow}>
                <Ionicons name="flash" size={14} color="#10B981" />
                <Text style={styles.standbyText}>
                  Emergency Rate:{' '}
                  <Text style={{ fontWeight: '700', color: '#111827' }}>
                    {emergencyProvider.rates?.emergency?.rate || '$50'}
                  </Text>{' '}
                  ({emergencyProvider.rates?.emergency?.note || 'Immediate arrival'})
                </Text>
              </View>
              <TouchableOpacity
                style={styles.instantReqBtn}
                onPress={() => router.push(`/provider/${emergencyProvider.id}` as any)}
              >
                <Text style={styles.instantReqText}>Instant Request</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section Header: Top Verified Specialists */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'All' ? 'Top Verified Specialists' : `${activeCategory} Specialists`}
            </Text>
            <Text style={styles.sectionSubtitle}>GOVT. CERTIFIED & BACKGROUND AUDITED</Text>
          </View>
          <View style={styles.verifiedCountBadge}>
            <Text style={styles.verifiedCountText}>
              {filteredProviders.length} Active {filteredProviders.length === 1 ? 'Pro' : 'Pros'}
            </Text>
          </View>
        </View>

        {/* Loading Spinner */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading specialists...</Text>
          </View>
        ) : filteredProviders.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {providers.length === 0 ? 'No Providers in Database' : 'No Specialists Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {providers.length === 0
                ? 'There are currently no service providers registered in the database. When providers sign up or add services, their profiles will appear here.'
                : searchQuery
                ? `No service providers matched "${searchQuery}".`
                : `No specialists currently found under ${activeCategory}.`}
            </Text>
            {(searchQuery || activeCategory !== 'All') && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Provider Cards */
          filteredProviders.map((provider) => {
            const standardRate = provider.rates?.standard?.rate || '$30';
            const standardUnit = provider.rates?.standard?.unit || '/hr';
            const diagnosticRate = provider.rates?.diagnostic?.rate || '$20';
            const guaranteeTitle =
              provider.insuranceAndGuarantees?.[0]?.title ||
              provider.insuranceAndGuarantees?.[0]?.badge ||
              'Workmanship Guarantee';

            return (
              <TouchableOpacity
                key={provider.id}
                style={styles.providerCardFeatured}
                onPress={() => router.push(`/provider/${provider.id}` as any)}
                activeOpacity={0.88}
              >
                {/* Header row with Category Tag & Starting Price */}
                <View style={styles.providerCardHeader}>
                  <View style={styles.categoryBadgeRow}>
                    <Ionicons
                      name={getCategoryIcon(provider.resolvedCategory)}
                      size={13}
                      color="#065F46"
                    />
                    <Text style={styles.categoryBadgeLabel}>{provider.resolvedCategory}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Starts at</Text>
                    <Text style={styles.priceValue}>
                      {standardRate}
                      <Text style={styles.priceUnit}>{standardUnit}</Text>
                    </Text>
                  </View>
                </View>

                {/* Main Pro Details Row */}
                <View style={styles.proFeaturedRow}>
                  {provider.avatarUrl ? (
                    <Image source={{ uri: provider.avatarUrl }} style={styles.proFeaturedAvatar} />
                  ) : (
                    <View style={[styles.proFeaturedAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarFallbackText}>
                        {provider.name?.substring(0, 2).toUpperCase() || 'SP'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.proFeaturedInfo}>
                    <View style={styles.proBadgeRow}>
                      <View style={styles.verifiedMiniBadge}>
                        <Ionicons
                          name="shield-checkmark"
                          size={11}
                          color="#10B981"
                          style={{ marginRight: 3 }}
                        />
                        <Text style={styles.verifiedMiniText}>
                          {provider.verificationBadgeText ? 'VERIFIED PRO' : 'GOVT. AUDITED'}
                        </Text>
                      </View>
                      <View style={styles.ratingBox}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.proRatingText}>
                          {' '}{provider.rating?.toFixed(1) || '4.9'} ({provider.reviewCount || 12})
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.proFeaturedName}>{provider.name}</Text>
                    <Text style={styles.proFeaturedTrade} numberOfLines={1}>
                      {provider.title}
                    </Text>
                    <Text style={styles.proFeaturedLocation} numberOfLines={1}>
                      <Ionicons name="location-outline" size={12} color="#6B7280" />{' '}
                      {provider.location || 'Colombo District'} • Diagnostic {diagnosticRate}
                    </Text>
                  </View>
                </View>

                {/* Dynamic Skills Tags from Provider Details */}
                {provider.skills && provider.skills.length > 0 && (
                  <View style={styles.skillsTagRow}>
                    {provider.skills.slice(0, 4).map((skill, idx) => (
                      <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                    {provider.skills.length > 4 && (
                      <View style={styles.skillChipMore}>
                        <Text style={styles.skillChipMoreText}>
                          +{provider.skills.length - 4} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Card Footer: Guarantee & Action Buttons */}
                <View style={styles.proCardFooter}>
                  <View style={styles.proCheckRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
                    <Text style={styles.proCheckText} numberOfLines={1}>
                      {guaranteeTitle}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <View style={styles.viewProfileBtn}>
                      <Text style={styles.viewProfileText}>View Profile</Text>
                      <Ionicons name="chevron-forward" size={13} color="#10B981" />
                    </View>
                    <TouchableOpacity
                      style={styles.bookDirectBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                          pathname: '/book-professional',
                          params: {
                            providerId: provider.id,
                            providerName: provider.name,
                            providerTitle: provider.title,
                            providerAvatar: provider.avatarUrl,
                            serviceTitle: provider.title,
                            category: provider.resolvedCategory,
                            totalAmount: provider.rates?.standard?.rate || '2,320.00',
                          },
                        });
                      }}
                    >
                      <Text style={styles.bookDirectText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Rapid Service Packs Section (Only if providers in database exist) */}
        {servicePacks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Rapid Service Packs</Text>
                <Text style={styles.sectionSubText}>Fixed pricing, priority booking with specialists</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            </View>

            {servicePacks.map((pack) => (
              <View key={pack.id} style={styles.packCard}>
                <View style={styles.packHeader}>
                  <View style={styles.packTags}>
                    <View style={styles.standardBadge}>
                      <Text style={styles.standardBadgeText}>{pack.category}</Text>
                    </View>
                    <Text style={styles.durationText}>Duration: {pack.duration}</Text>
                  </View>
                  <Text style={styles.packPrice}>{pack.price}</Text>
                </View>

                <Text style={styles.packTitle}>{pack.title}</Text>
                <Text style={styles.packDesc}>{pack.desc}</Text>

                <View style={styles.packFooter}>
                  <TouchableOpacity
                    style={styles.packProviderTag}
                    onPress={() => router.push(`/provider/${pack.providerId}` as any)}
                  >
                    <Ionicons name="person-circle-outline" size={16} color="#059669" />
                    <Text style={styles.packProviderName}>By {pack.providerName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bookServiceBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/book-professional',
                        params: {
                          providerId: pack.providerId,
                          providerName: pack.providerName,
                          serviceTitle: pack.title,
                          category: pack.category,
                          totalAmount: pack.price,
                        },
                      })
                    }
                  >
                    <Text style={styles.bookServiceText}>Book Service</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  clearSearchBtn: { padding: 4 },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsScroll: { paddingLeft: 16, marginBottom: 18 },
  pillsContainer: { paddingRight: 32 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  pillTextActive: { color: '#FFF' },
  urgentBanner: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  urgentBannerTop: { flexDirection: 'row', marginBottom: 14 },
  urgentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  urgentDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  urgentTextContent: { flex: 1 },
  urgentTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  urgentTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 8 },
  priorityBadge: { backgroundColor: '#DC2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  priorityBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  urgentSubtitle: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  urgentBannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  standbyRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  standbyText: { fontSize: 11, color: '#4B5563', marginLeft: 4, flexShrink: 1 },
  instantReqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  instantReqText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  sectionSubtitle: { fontSize: 10, fontWeight: '800', color: '#6B7280', marginTop: 2, letterSpacing: 0.5 },
  sectionSubText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  verifiedCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedCountText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#6B7280' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  resetBtn: {
    marginTop: 14,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  providerCardFeatured: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 4,
  },
  priceContainer: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 9, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' },
  priceValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  priceUnit: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  proFeaturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proFeaturedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
  },
  avatarFallbackText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  proFeaturedInfo: { flex: 1 },
  proBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  verifiedMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedMiniText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  proRatingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  proFeaturedName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  proFeaturedTrade: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  proFeaturedLocation: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  skillChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  skillChipMore: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillChipMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  proCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  proCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  proCheckText: {
    fontSize: 11,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '500',
    flexShrink: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  viewProfileText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 2,
  },
  bookDirectBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bookDirectText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  packCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packTags: { flexDirection: 'row', alignItems: 'center' },
  standardBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  standardBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  durationText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  packPrice: { fontSize: 16, fontWeight: '900', color: '#111827' },
  packTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4, lineHeight: 20 },
  packDesc: { fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 17 },
  packFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  packProviderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  packProviderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  bookServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  bookServiceText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
