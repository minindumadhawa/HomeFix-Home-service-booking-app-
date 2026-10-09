import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Categories Directory</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.searchIconBtn}>
              <Ionicons name="search" size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileAvatar}>
              <Ionicons name="person" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput 
              placeholder="Search all services, repairs, installations..." 
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/filter')}>
            <Ionicons name="options-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContainer}>
          <TouchableOpacity style={[styles.pill, styles.pillActive]}>
            <Text style={[styles.pillText, styles.pillTextActive]}>All (24)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>Plumbing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>Electrical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>Cleaning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>AC & Appliances</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Urgent Help Banner */}
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
                  <Text style={styles.priorityBadgeText}>PRIORITY</Text>
                </View>
              </View>
              <Text style={styles.urgentSubtitle}>Emergency technician dispatch...</Text>
            </View>
          </View>
          <View style={styles.urgentBannerBottom}>
            <View style={styles.standbyRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.standbyText}>Dedicated SOS Unit on standby</Text>
            </View>
            <TouchableOpacity style={styles.instantReqBtn}>
              <Text style={styles.instantReqText}>Instant Request</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFF" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Core Categories Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Categories</Text>
          <Text style={styles.sectionSubtitle}>6 SPECIALIZATIONS</Text>
        </View>

        {/* Category Card 1 */}
        <View style={styles.categoryCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleRow}>
              <View style={styles.blackIconBox}>
                <Ionicons name="flash-outline" size={20} color="#FFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Electrical Repairs</Text>
                <View style={styles.prosAvailableRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.prosAvailableText}>24 Pros Available</Text>
                </View>
              </View>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.startsAt}>Starts at</Text>
              <Text style={styles.priceText}>Rs. 1,500</Text>
            </View>
          </View>
          
          <View style={styles.cardMidRow}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop'}} style={styles.cardImage} />
            <View style={styles.tagsContainer}>
              <View style={styles.tag}><Text style={styles.tagText}>Short Circuit</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Switchboard</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Fan & Light</Text></View>
              <View style={styles.tagGrey}><Text style={styles.tagTextGrey}>+3 more</Text></View>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
              <Text style={styles.featureText}>Safety-tested diagnostic protocol</Text>
            </View>
            <TouchableOpacity style={styles.viewSolutionsRow}>
              <Text style={styles.viewSolutionsText}>View 5 Solutions</Text>
              <Ionicons name="chevron-down" size={14} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Card 2 */}
        <View style={styles.categoryCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleRow}>
              <View style={styles.blackIconBox}>
                <Ionicons name="sparkles-outline" size={20} color="#FFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Home Deep Cleaning</Text>
                <View style={styles.specialOfferBadge}>
                  <Text style={styles.specialOfferText}>Special Offer 20% OFF</Text>
                </View>
              </View>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.startsAt}>Starts at</Text>
              <Text style={styles.priceText}>Rs. 2,500</Text>
            </View>
          </View>
          
          <View style={styles.cardMidRow}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop'}} style={styles.cardImage} />
            <View style={styles.tagsContainer}>
              <View style={styles.tag}><Text style={styles.tagText}>Whole-House</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Sofa & Carpet</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Kitchen Degrease</Text></View>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.featureRow}>
              <Ionicons name="leaf-outline" size={14} color="#10B981" />
              <Text style={styles.featureText}>Eco-friendly non-toxic agents</Text>
            </View>
            <TouchableOpacity style={styles.viewSolutionsRow}>
              <Text style={styles.viewSolutionsText}>View 4 Solutions</Text>
              <Ionicons name="chevron-down" size={14} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Card 3 */}
        <View style={styles.categoryCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleRow}>
              <View style={styles.blackIconBox}>
                <Ionicons name="hammer-outline" size={20} color="#FFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Carpentry & Assembly</Text>
                <Text style={styles.cardSubtitleText}>Woodcraft & Hardware</Text>
              </View>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.startsAt}>Starts at</Text>
              <Text style={styles.priceText}>Rs. 1,400</Text>
            </View>
          </View>
          
          <View style={styles.cardMidRow}>
            <View style={styles.tagsContainer}>
              <View style={styles.tag}><Text style={styles.tagText}>Door Lock Fitting</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Hinge Alignment</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Custom Shelves</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Wood Polish</Text></View>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.featureRow}>
              <Ionicons name="scan-outline" size={14} color="#10B981" />
              <Text style={styles.featureText}>Laser-aligned precision fit</Text>
            </View>
            <TouchableOpacity style={styles.browseBtn}>
              <Text style={styles.browseBtnText}>Browse</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rapid Service Packs Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Rapid Service Packs</Text>
            <Text style={styles.sectionSubText}>Fixed pricing, immediate confirmation</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>

        {/* Rapid Service Pack Card */}
        <View style={styles.packCard}>
          <View style={styles.packHeader}>
            <View style={styles.packTags}>
              <View style={styles.standardBadge}><Text style={styles.standardBadgeText}>Standard</Text></View>
              <Text style={styles.durationText}>Duration: ~1.5 hrs</Text>
            </View>
            <Text style={styles.priceText}>Rs. 2,200</Text>
          </View>
          
          <Text style={styles.packTitle}>Seasonal Home Electrical Safety Audit</Text>
          <Text style={styles.packDesc}>Earth-leakage resistance test, terminal torque checks, insulation</Text>
          
          <View style={styles.packFooter}>
            <View style={styles.featureRow}>
              <Ionicons name="document-text-outline" size={14} color="#10B981" />
              <Text style={styles.featureText}>Digital compliance report</Text>
            </View>
            <TouchableOpacity style={styles.bookServiceBtn}>
              <Text style={styles.bookServiceText}>Book Service</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFF" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 100 }, // extra padding for bottom tab
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#F9FAFB' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  searchIconBtn: { marginRight: 16 },
  profileAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  filterBtn: { width: 46, height: 46, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  pillsScroll: { paddingLeft: 16, marginBottom: 20 },
  pillsContainer: { paddingRight: 32 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  pillActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  pillTextActive: { color: '#FFF' },
  urgentBanner: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  urgentBannerTop: { flexDirection: 'row', marginBottom: 16 },
  urgentIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' },
  urgentDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#DC2626', borderWidth: 2, borderColor: '#FFF' },
  urgentTextContent: { flex: 1 },
  urgentTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  urgentTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 8 },
  priorityBadge: { backgroundColor: '#DC2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  priorityBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  urgentSubtitle: { fontSize: 13, color: '#6B7280' },
  urgentBannerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  standbyRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  standbyText: { fontSize: 11, color: '#4B5563', marginLeft: 4, flexShrink: 1 },
  instantReqBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  instantReqText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  sectionSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', marginBottom: 2 },
  sectionSubText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  categoryCard: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  blackIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  prosAvailableRow: { flexDirection: 'row', alignItems: 'center' },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  prosAvailableText: { fontSize: 10, fontWeight: 'bold', color: '#10B981' },
  specialOfferBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start' },
  specialOfferText: { fontSize: 10, fontWeight: 'bold', color: '#059669' },
  cardSubtitleText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  priceCol: { alignItems: 'flex-end' },
  startsAt: { fontSize: 10, color: '#6B7280', fontWeight: 'bold', marginBottom: 2 },
  priceText: { fontSize: 18, fontWeight: '900', color: '#111827' },
  cardMidRow: { flexDirection: 'row', marginBottom: 16 },
  cardImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  tagsContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  tagGrey: { backgroundColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagTextGrey: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  featureText: { fontSize: 11, fontWeight: '600', color: '#4B5563', marginLeft: 4, flexShrink: 1 },
  viewSolutionsRow: { flexDirection: 'row', alignItems: 'center' },
  viewSolutionsText: { fontSize: 11, fontWeight: 'bold', color: '#10B981', marginRight: 2 },
  browseBtn: { backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  browseBtnText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  packCard: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  packHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  packTags: { flexDirection: 'row', alignItems: 'center' },
  standardBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  standardBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  durationText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  packTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6, lineHeight: 22 },
  packDesc: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 18 },
  packFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  bookServiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bookServiceText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' }
});
