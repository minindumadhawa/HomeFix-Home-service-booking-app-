import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>HOME<Text style={styles.logoTextBold}>FIX</Text></Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>JD</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search plumbers, electricians, cleaners..." 
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/filter')}>
            <Ionicons name="options-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Active Request Banner */}
        <View style={styles.activeRequestCard}>
          <View style={styles.activeRequestHeader}>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>1 ACTIVE REQUEST</Text>
            </View>
            <Text style={styles.etaText}>
              <Ionicons name="time-outline" size={14} color="#FBBF24" /> ETA: 8 mins
            </Text>
          </View>
          <View style={styles.activeRequestBody}>
            <View style={styles.activeRequestInfo}>
              <Text style={styles.activeRequestTitle}>Plumbing Emergency Dispatch</Text>
              <Text style={styles.activeRequestSubtitle}>Technician: Sunimal Bandara is on his way</Text>
            </View>
            <TouchableOpacity style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track</Text>
              <Ionicons name="chevron-forward" size={16} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Dispatch Banner */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.urgentBadge}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentBadgeText}>URGENT DISPATCH</Text>
            </View>
            <Text style={styles.responseText}>
              <Ionicons name="flash" size={14} color="#DC2626" /> 15 Min Response
            </Text>
          </View>
          <Text style={styles.emergencyTitle}>Instant Emergency Technician Dispatch</Text>
          <Text style={styles.emergencySubtitle}>Get a certified worker at your doorstep in under 15 minutes.</Text>
          <TouchableOpacity style={styles.requestNowBtn} onPress={() => router.push('/provider/gamage-wdk' as any)}>
            <Text style={styles.requestNowText}>REQUEST NOW</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>

        {/* Service Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SERVICE CATEGORIES</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {[
            { id: 1, name: 'Plumbing\nServices', icon: 'build-outline', route: '/provider/gamage-wdk' },
            { id: 2, name: 'Electrical\nRepairs', icon: 'flash-outline', route: '/provider/nimal-silva' },
            { id: 3, name: 'Home\nCleaning', icon: 'sparkles-outline', route: '/(tabs)/services' },
            { id: 4, name: 'Painting &\nCarpentry', icon: 'color-palette-outline', route: '/(tabs)/services' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push(cat.route as any)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name={cat.icon as any} size={24} color="#10B981" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Deals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SPECIAL DEALS & PACKAGES</Text>
          <TouchableOpacity>
            <Text style={styles.saveUpToText}>Save up to 25%</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dealsRow}>
          {/* Deal 1 */}
          <View style={styles.dealCard}>
            <View style={[styles.dealBadge, {backgroundColor: '#D1FAE5'}]}>
              <Text style={[styles.dealBadgeText, {color: '#059669'}]}>20% OFF</Text>
            </View>
            <Text style={styles.dealTitle}>Whole-House Deep Clean</Text>
            <Text style={styles.dealSubtitle}>Full sanitize & kitchen detail</Text>
            <View style={styles.dealFooter}>
              <Text style={styles.dealPrice}>Rs. 8,500</Text>
              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Deal 2 */}
          <View style={styles.dealCard}>
            <View style={[styles.dealBadge, {backgroundColor: '#DBEAFE'}]}>
              <Text style={[styles.dealBadgeText, {color: '#2563EB'}]}>COMBO PACK</Text>
            </View>
            <Text style={styles.dealTitle}>AC Servicing & Gas Refill</Text>
            <Text style={styles.dealSubtitle}>Dual inverter & filter tune</Text>
            <View style={styles.dealFooter}>
              <Text style={styles.dealPrice}>Rs. 4,200</Text>
              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Top Verified Professionals */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {flex: 1}]}>TOP VERIFIED PROFESSIONALS NEARBY</Text>
          <View style={styles.nearbyBadge}>
            <Text style={styles.nearbyBadgeText}>Nearby (2.5 km)</Text>
          </View>
        </View>
        
        {/* Pro Card 1: Gamage W.D.K. */}
        <TouchableOpacity
          style={styles.proCard}
          onPress={() => router.push('/provider/gamage-wdk' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.proCardHeader}>
            <View style={[styles.proAvatarContainer, { overflow: 'hidden' }]}>
              <Ionicons name="construct" size={28} color="#10B981" />
              <Text style={[styles.proPhotoText, { color: '#10B981' }]}>MASTER</Text>
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proBadgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                  <Text style={styles.verifiedText}>VERIFIED PRO</Text>
                </View>
                <Text style={styles.proRating}>
                  <Ionicons name="star" size={12} color="#F59E0B" /> 4.9 <Text style={styles.proReviews}>(128 reviews)</Text>
                </Text>
              </View>
              <Text style={styles.proName}>Gamage W.D.K. - Pipe Specialist</Text>
              <Text style={styles.proRate}>Starting: $40/hr <Text style={styles.proDot}>•</Text> NVQ Level 4</Text>
              <Text style={styles.proDistance}>
                <Ionicons name="location" size={12} color="#9CA3AF" /> Colombo & Western Province
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookNowProBtn}
            onPress={() => router.push('/provider/gamage-wdk' as any)}
          >
            <Text style={styles.bookNowProText}>VIEW CREDENTIALS & BOOK</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Pro Card 2: Nimal Silva */}
        <TouchableOpacity
          style={styles.proCard}
          onPress={() => router.push('/provider/nimal-silva' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.proCardHeader}>
            <View style={styles.proAvatarContainer}>
              <Ionicons name="flash" size={28} color="#9CA3AF" />
              <Text style={styles.proPhotoText}>ELECTRIC</Text>
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proBadgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
                <Text style={styles.proRating}>
                  <Ionicons name="star" size={12} color="#F59E0B" /> 4.8 <Text style={styles.proReviews}>(94 reviews)</Text>
                </Text>
              </View>
              <Text style={styles.proName}>Nimal Silva Electrical Works</Text>
              <Text style={styles.proRate}>Fixed Rate: Rs. 1,800/hr <Text style={styles.proDot}>•</Text></Text>
              <Text style={styles.proDistance}>
                <Ionicons name="location" size={12} color="#9CA3AF" /> 3.1 km away
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookNowProBtn}
            onPress={() => router.push('/provider/nimal-silva' as any)}
          >
            <Text style={styles.bookNowProText}>BOOK NOW</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    color: '#111827',
    letterSpacing: -0.5,
  },
  logoTextBold: {
    fontWeight: '900',
  },
  proBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterBtn: {
    padding: 4,
  },
  activeRequestCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  activeRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  etaText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  activeRequestBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRequestInfo: {
    flex: 1,
    paddingRight: 12,
  },
  activeRequestTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeRequestSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  trackBtn: {
    backgroundColor: '#D1FAE5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackBtnText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  emergencyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 4,
  },
  urgentBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  responseText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  requestNowBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestNowText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveUpToText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    width: '23%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryIconContainer: {
    backgroundColor: '#ECFDF5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  dealsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dealCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dealBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dealTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    height: 36,
  },
  dealSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 12,
    height: 30,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nearbyBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  nearbyBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
  },
  proCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  proCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  proAvatarContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proPhotoText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  proInfo: {
    flex: 1,
  },
  proBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  proRating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
  },
  proReviews: {
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  proName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  proRate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  proDot: {
    color: '#9CA3AF',
  },
  proDistance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bookNowProBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookNowProText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
