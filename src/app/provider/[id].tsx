import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Share,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { getProviderById, DEFAULT_PROVIDERS } from '../../services/providerService';
import { ServiceProvider, ProfessionalLicense } from '../../types/provider';
import CertificateModal from '../../components/provider/CertificateModal';
import InstantBookModal from '../../components/provider/InstantBookModal';
import MessageModal from '../../components/provider/MessageModal';

type TabType = 'OVERVIEW' | 'CREDENTIALS' | 'REVIEWS';
type ReviewFilter = 'all' | 'verified' | 'photos';

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWide = width >= 1024;

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [isSaved, setIsSaved] = useState(false);
  
  // Modals state
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<ProfessionalLicense | null>(null);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  // Helpful counts state mapped by review ID
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; voted: boolean }>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const targetId = id ? String(id) : 'gamage-wdk';
      const data = await getProviderById(targetId);
      if (isMounted) {
        const finalProvider = data || DEFAULT_PROVIDERS['gamage-wdk'];
        setProvider(finalProvider);

        // Initialize helpful votes
        const initialVotes: Record<string, { count: number; voted: boolean }> = {};
        finalProvider.reviews.forEach((r) => {
          initialVotes[r.id] = { count: r.helpfulCount, voted: false };
        });
        setHelpfulVotes(initialVotes);

        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!provider) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${provider.name} - ${provider.title} on HomeFix: https://homefix.app/provider/${provider.id}`
        );
        alert('Provider profile link copied to clipboard!');
      } else {
        await Share.share({
          message: `Check out ${provider.name} (${provider.title}) on HomeFix PRO!`,
          title: provider.name,
        });
      }
    } catch {
      // ignore cancel or unsupported
    }
  };

  const toggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] || { count: 0, voted: false };
      const newVoted = !current.voted;
      const newCount = newVoted ? current.count + 1 : Math.max(0, current.count - 1);
      return {
        ...prev,
        [reviewId]: { count: newCount, voted: newVoted },
      };
    });
  };

  const handleViewCert = (license: ProfessionalLicense) => {
    setSelectedLicense(license);
    setCertModalVisible(true);
  };

  if (loading || !provider) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading verified credentials...</Text>
      </SafeAreaView>
    );
  }

  // Filter reviews
  const filteredReviews = provider.reviews.filter((r) => {
    if (reviewFilter === 'photos') return (r.photos && r.photos.length > 0);
    if (reviewFilter === 'verified') return (r.verifiedType && r.verifiedType.includes('Verified'));
    return true;
  });

  // Recent work items to display (2 on mobile matching mockup, 4 on desktop)
  const displayedRecentWork = isDesktop ? provider.recentWork : provider.recentWork.slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        {/* Top Navigation Bar */}
        <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>

            {isDesktop && (
              <View style={styles.desktopBreadcrumbs}>
                <Text style={styles.breadcrumbMuted}>Services</Text>
                <Ionicons name="chevron-forward" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                <Text style={styles.breadcrumbActive}>{provider.name}</Text>
                <View style={styles.desktopVerifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.desktopVerifiedBadgeText}>Verified Specialist</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => setIsSaved(!isSaved)}
              accessibilityLabel="Bookmark provider"
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? '#10B981' : '#111827'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleBtn, { marginLeft: 10 }]}
              onPress={handleShare}
              accessibilityLabel="Share provider"
            >
              <Ionicons name="share-social-outline" size={20} color="#111827" />
            </TouchableOpacity>

            {isDesktop && (
              <View style={styles.desktopHeaderCTAs}>
                <TouchableOpacity
                  style={styles.desktopHeaderMsgBtn}
                  onPress={() => setMessageModalVisible(true)}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#111827" style={{ marginRight: 6 }} />
                  <Text style={styles.desktopHeaderMsgText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.desktopHeaderBookBtn}
                  onPress={() => setBookModalVisible(true)}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.desktopHeaderBookText}>Instant Book</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Profile Card */}
          <View style={[styles.profileCard, isDesktop && styles.profileCardDesktop]}>
            <View style={[styles.profileTopRow, isDesktop && styles.profileTopRowDesktop]}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: provider.avatarUrl }}
                  style={[styles.avatarImage, isDesktop && styles.avatarImageDesktop]}
                  resizeMode="cover"
                />
                <View style={[styles.avatarVerifiedBadge, isDesktop && styles.avatarVerifiedBadgeDesktop]}>
                  <Ionicons name="checkmark" size={isDesktop ? 14 : 11} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.providerName, isDesktop && styles.providerNameDesktop]} numberOfLines={1}>
                    {provider.name}
                  </Text>
                  {isDesktop && (
                    <View style={styles.onlineBadge}>
                      <View style={styles.greenPulseDot} />
                      <Text style={styles.onlineText}>Online Now</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.providerTitle, isDesktop && styles.providerTitleDesktop]} numberOfLines={1}>
                  {provider.title}
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#111827" style={{ marginRight: 4, flexShrink: 0 }} />
                  <Text style={styles.ratingNumber}>{provider.rating}</Text>
                  <Text style={styles.reviewCountText}> ({provider.reviewCount} reviews)</Text>
                </View>

                {/* Location and badge on desktop inline */}
                {isDesktop && (
                  <View style={styles.desktopInlineMeta}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={15} color="#4B5563" style={{ marginRight: 4, flexShrink: 0 }} />
                      <Text style={styles.locationText}>{provider.location}</Text>
                    </View>
                    <View style={styles.backgroundBadgeRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 6, flexShrink: 0 }} />
                      <Text style={styles.backgroundBadgeText}>{provider.verificationBadgeText}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Mobile: Location and Verified Background Badge span full width below avatar row */}
            {!isDesktop && (
              <View style={styles.profileMobileBottom}>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={15} color="#4B5563" style={{ marginRight: 5, flexShrink: 0 }} />
                  <Text style={styles.locationText}>{provider.location}</Text>
                </View>

                <View style={styles.backgroundBadgeRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 6, flexShrink: 0 }} />
                  <Text style={styles.backgroundBadgeText}>{provider.verificationBadgeText}</Text>
                </View>
              </View>
            )}

            {/* Desktop: Right Quick Booking Card */}
            {isDesktop && (
              <View style={styles.profileRightColDesktop}>
                <View style={styles.desktopRateSummaryCard}>
                  <View style={styles.desktopRateSummaryTop}>
                    <Text style={styles.desktopRateSummaryLabel}>Standard Rate</Text>
                    <Text style={styles.desktopRateSummaryPrice}>
                      {provider.rates.standard.rate}
                      <Text style={styles.desktopRateSummaryUnit}>{provider.rates.standard.unit}</Text>
                    </Text>
                  </View>
                  <View style={styles.desktopResponsePill}>
                    <Ionicons name="flash" size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.desktopResponseText}>15-Min Rapid Dispatch Available</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.desktopInstantBookAction}
                    onPress={() => setBookModalVisible(true)}
                  >
                    <Ionicons name="calendar" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.desktopInstantBookActionText}>Book Service Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Segmented Control Tabs */}
          <View style={[styles.tabsContainer, isDesktop && styles.tabsContainerDesktop]}>
            {(['OVERVIEW', 'CREDENTIALS', 'REVIEWS'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, isActive && styles.tabButtonActive, isDesktop && styles.tabButtonDesktop]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive, isDesktop && styles.tabButtonTextDesktop]}>
                    {tab === 'OVERVIEW'
                      ? (isDesktop ? 'OVERVIEW & RATES' : 'OVERVIEW')
                      : tab === 'CREDENTIALS'
                      ? (isDesktop ? 'CREDENTIALS & LICENSES' : 'CREDENTIALS')
                      : (isDesktop ? 'REVIEWS & RATINGS' : 'REVIEWS')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'OVERVIEW' && (
            <View style={styles.tabContent}>
              {/* UPFRONT RATES */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="card-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      UPFRONT RATES
                    </Text>
                  </View>
                  <View style={styles.headerRightInfo}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#6B7280"
                      style={{ marginRight: isDesktop ? 4 : 0, flexShrink: 0 }}
                    />
                    {isDesktop && <Text style={styles.transparentLabel}>No Hidden Charges</Text>}
                  </View>
                </View>

                {/* 3 Rate Columns */}
                <View style={[styles.ratesGrid, isDesktop && styles.ratesGridDesktop]}>
                  <View style={[styles.rateCol, isDesktop && styles.rateColDesktop]}>
                    <Text style={[styles.rateColLabel, isDesktop && styles.rateColLabelDesktop]}>STANDARD</Text>
                    <Text style={[styles.rateColPrice, isDesktop && styles.rateColPriceDesktop]}>
                      {provider.rates.standard.rate}
                      <Text style={styles.rateColUnit}>{provider.rates.standard.unit}</Text>
                    </Text>
                    <Text style={[styles.rateColNote, isDesktop && styles.rateColNoteDesktop]}>
                      {provider.rates.standard.note}
                    </Text>
                  </View>

                  <View style={[styles.rateCol, isDesktop && styles.rateColDesktop]}>
                    <Text style={[styles.rateColLabel, isDesktop && styles.rateColLabelDesktop]}>DIAGNOSTIC</Text>
                    <Text style={[styles.rateColPrice, isDesktop && styles.rateColPriceDesktop]}>
                      {provider.rates.diagnostic.rate}
                    </Text>
                    <Text style={[styles.rateColNote, isDesktop && styles.rateColNoteDesktop]}>
                      {provider.rates.diagnostic.note}
                    </Text>
                  </View>

                  <View style={[styles.rateCol, isDesktop && styles.rateColDesktop]}>
                    <Text style={[styles.rateColLabel, isDesktop && styles.rateColLabelDesktop]}>EMERGENCY</Text>
                    <Text style={[styles.rateColPrice, isDesktop && styles.rateColPriceDesktop]}>
                      {provider.rates.emergency.rate}
                    </Text>
                    <Text style={[styles.rateColNote, isDesktop && styles.rateColNoteDesktop]}>
                      {provider.rates.emergency.note}
                    </Text>
                  </View>
                </View>

                {/* Transparent Pricing Banner */}
                <View style={styles.pricingBanner}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#4B5563" style={{ marginRight: 6, flexShrink: 0 }} />
                  <Text
                    style={[styles.pricingBannerText, isDesktop && styles.pricingBannerTextDesktop]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    TRANSPARENT PRICING • NO HIDDEN CHARGES
                  </Text>
                </View>
              </View>

              {/* ABOUT & SKILLS */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons name="person-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                  <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                    ABOUT & SKILLS
                  </Text>
                </View>
                <Text style={[styles.aboutParagraph, isDesktop && styles.aboutParagraphDesktop]}>
                  {provider.about}
                </Text>

                <View style={styles.skillsRow}>
                  {provider.skills.map((skill) => (
                    <View key={skill} style={[styles.skillPill, isDesktop && styles.skillPillDesktop]}>
                      <Text style={[styles.skillPillText, isDesktop && styles.skillPillTextDesktop]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* VERIFIED DOCUMENTS */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="document-text-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      VERIFIED DOCUMENTS
                    </Text>
                  </View>
                  <Text style={styles.sectionRightBadgeText}>
                    {provider.verifiedDocuments.filter((d) => d.isValidated).length}/
                    {provider.verifiedDocuments.length} Validated
                  </Text>
                </View>

                <View style={[styles.docList, isDesktop && styles.docListDesktop]}>
                  {provider.verifiedDocuments.map((doc) => (
                    <View key={doc.id} style={[styles.docItem, isDesktop && styles.docItemDesktop]}>
                      <View style={styles.docIconBox}>
                        <Ionicons name={doc.iconName as any} size={20} color="#111827" />
                      </View>
                      <View style={styles.docInfo}>
                        <Text style={[styles.docTitle, isDesktop && styles.docTitleDesktop]}>{doc.title}</Text>
                        <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                      </View>
                      {doc.isValidated && (
                        <View style={styles.greenCheckSquare}>
                          <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* RECENT WORK */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="images-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      RECENT WORK
                    </Text>
                  </View>
                  <Text style={styles.sectionRightBadgeText}>16 Jobs Completed</Text>
                </View>

                <View style={[styles.recentWorkGrid, isDesktop && styles.recentWorkGridDesktop]}>
                  {displayedRecentWork.map((work) => (
                    <View key={work.id} style={[styles.recentWorkItem, isDesktop && styles.recentWorkItemDesktop]}>
                      <Image source={{ uri: work.imageUrl }} style={styles.recentWorkImage} />
                      <View style={styles.recentWorkTag}>
                        <Text style={styles.recentWorkTagText}>{work.title}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ================= TAB 2: CREDENTIALS ================= */}
          {activeTab === 'CREDENTIALS' && (
            <View style={styles.tabContent}>
              {/* GOVERNMENT & IDENTITY VERIFICATION */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      GOVERNMENT & IDENTITY VERIFICATION
                    </Text>
                  </View>
                  <View style={styles.verifiedGreenBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" style={{ marginRight: 3, flexShrink: 0 }} />
                    <Text style={styles.verifiedGreenBadgeText}>100% VERIFIED</Text>
                  </View>
                </View>

                <View style={[styles.credentialsList, isDesktop && styles.credentialsListDesktop]}>
                  {provider.identityVerifications.map((item) => (
                    <View key={item.id} style={[styles.credentialCard, isDesktop && styles.credentialCardDesktop]}>
                      <View style={styles.credIconBox}>
                        <Ionicons name={item.iconName as any} size={20} color="#374151" />
                      </View>
                      <View style={styles.credContent}>
                        <View style={styles.credTitleRow}>
                          <View style={styles.credTitleLeft}>
                            <Text style={[styles.credTitle, isDesktop && styles.credTitleDesktop]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 4, flexShrink: 0 }} />
                          </View>
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>{item.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.credDetails}>{item.details}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* LICENSES & PROFESSIONAL CERTIFICATIONS */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons name="ribbon-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                  <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                    LICENSES & PROFESSIONAL CERTIFICATIONS
                  </Text>
                </View>

                <View style={[styles.licensesList, isDesktop && styles.licensesListDesktop]}>
                  {provider.licensesAndCertifications.map((lic) => (
                    <View key={lic.id} style={[styles.licenseItem, isDesktop && styles.licenseItemDesktop]}>
                      <View style={styles.licenseHeaderRow}>
                        <Text style={[styles.licenseTitle, isDesktop && styles.licenseTitleDesktop]}>{lic.title}</Text>
                        {lic.badge ? (
                          <View style={styles.accreditedBadge}>
                            <Text style={styles.accreditedBadgeText}>{lic.badge}</Text>
                          </View>
                        ) : (
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
                        )}
                      </View>
                      <Text style={styles.licenseIssuer}>{lic.issuer}</Text>

                      {lic.licenseNumber && (
                        <View style={styles.licenseMetaRow}>
                          <Text style={styles.licenseMetaText}>
                            Lic: {lic.licenseNumber} • Exp: {lic.expiry}
                          </Text>
                          {lic.hasViewCert && (
                            <TouchableOpacity
                              style={styles.viewCertBtn}
                              onPress={() => handleViewCert(lic)}
                            >
                              <Ionicons name="eye-outline" size={13} color="#111827" style={{ marginRight: 4, flexShrink: 0 }} />
                              <Text style={styles.viewCertText}>View Cert</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      {lic.description && (
                        <Text style={styles.licenseDesc}>{lic.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* INSURANCE & WORK GUARANTEE */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="shield-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      INSURANCE & WORK GUARANTEE
                    </Text>
                  </View>
                  <Text style={styles.insuredBadgeText}>INSURED</Text>
                </View>

                <View style={[styles.insuranceList, isDesktop && styles.insuranceListDesktop]}>
                  {provider.insuranceAndGuarantees.map((ins) => (
                    <View key={ins.id} style={[styles.insuranceItem, isDesktop && styles.insuranceItemDesktop]}>
                      <View style={styles.greenIconBox}>
                        <Ionicons name={ins.iconName as any} size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.insuranceContent}>
                        <View style={styles.insTitleRow}>
                          <Text style={[styles.insTitle, isDesktop && styles.insTitleDesktop]}>{ins.title}</Text>
                          <View style={styles.policyBadge}>
                            <Text style={styles.policyBadgeText}>{ins.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.insProvider}>{ins.provider}</Text>
                        <Text style={styles.insDesc}>{ins.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* EXPERIENCE & APPRENTICESHIP */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="briefcase-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      EXPERIENCE & APPRENTICESHIP
                    </Text>
                  </View>
                  <Text style={styles.sectionRightBadgeText}>12+ Years</Text>
                </View>

                {/* Stat Boxes */}
                <View style={[styles.experienceStatsRow, isDesktop && styles.experienceStatsRowDesktop]}>
                  <View style={[styles.statBox, isDesktop && styles.statBoxDesktop]}>
                    <Text style={[styles.statBoxNumber, isDesktop && styles.statBoxNumberDesktop]}>
                      {provider.experience.years}
                    </Text>
                    <Text style={styles.statBoxLabel}>{provider.experience.tradeLabel}</Text>
                  </View>
                  <View style={[styles.statBox, isDesktop && styles.statBoxDesktop]}>
                    <Text style={[styles.statBoxNumber, isDesktop && styles.statBoxNumberDesktop]}>
                      {provider.experience.verifiedJobs}
                    </Text>
                    <Text style={styles.statBoxLabel}>{provider.experience.jobsLabel}</Text>
                  </View>
                </View>

                {/* History Cards */}
                <View style={[styles.historyList, isDesktop && styles.historyListDesktop]}>
                  {provider.experience.history.map((hist) => (
                    <View key={hist.id} style={[styles.historyCard, isDesktop && styles.historyCardDesktop]}>
                      <View style={styles.histIconBox}>
                        <Ionicons name="briefcase" size={18} color="#374151" />
                      </View>
                      <View style={styles.histContent}>
                        <Text style={[styles.histCompany, isDesktop && styles.histCompanyDesktop]}>{hist.company}</Text>
                        <Text style={styles.histRole}>{hist.role}</Text>
                        <Text style={styles.histDesc}>{hist.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ================= TAB 3: REVIEWS ================= */}
          {activeTab === 'REVIEWS' && (
            <View style={styles.tabContent}>
              {/* RATING OVERVIEW */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="chatbubbles-outline" size={18} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
                      RATING OVERVIEW
                    </Text>
                  </View>
                  <View style={styles.auditedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 4, flexShrink: 0 }} />
                    <Text style={styles.auditedBadgeText}>100% AUDITED REVIEWS</Text>
                  </View>
                </View>

                <View style={[styles.ratingOverviewRow, isDesktop && styles.ratingOverviewRowDesktop]}>
                  {/* Left Column: Big Score */}
                  <View style={[styles.scoreLeftCol, isDesktop && styles.scoreLeftColDesktop]}>
                    <Text style={[styles.bigScore, isDesktop && styles.bigScoreDesktop]}>
                      {provider.ratingOverview.overall}
                    </Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name="star" size={14} color="#111827" style={{ marginHorizontal: 1 }} />
                      ))}
                    </View>
                    <Text style={styles.reviewSubTotal}>{provider.ratingOverview.totalReviews} Reviews</Text>
                  </View>

                  {/* Middle Column: Star Percentage Bars */}
                  <View style={[styles.barsRightCol, isDesktop && styles.barsRightColDesktop]}>
                    {([5, 4, 3, 2, 1] as const).map((num) => {
                      const pct = provider.ratingOverview.percentageByStar[num];
                      return (
                        <View key={num} style={styles.barRow}>
                          <Text style={styles.barNumText}>{num}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%` }]} />
                          </View>
                          <Text style={styles.barPctText}>{pct}%</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Desktop Right Column: Sub-ratings */}
                  {isDesktop && (
                    <View style={styles.subRatingsDesktopCol}>
                      <View style={styles.subRatingBoxDesktop}>
                        <Text style={styles.subRatingLabel}>PUNCTUALITY</Text>
                        <Text style={styles.subRatingValueDesktop}>{provider.ratingOverview.punctuality}★</Text>
                      </View>
                      <View style={styles.subRatingBoxDesktop}>
                        <Text style={styles.subRatingLabel}>WORK QUALITY</Text>
                        <Text style={styles.subRatingValueDesktop}>{provider.ratingOverview.workQuality}★</Text>
                      </View>
                      <View style={styles.subRatingBoxDesktop}>
                        <Text style={styles.subRatingLabel}>FAIR PRICING</Text>
                        <Text style={styles.subRatingValueDesktop}>{provider.ratingOverview.fairPricing}★</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Mobile Sub-ratings Row */}
                {!isDesktop && (
                  <View style={styles.subRatingsRow}>
                    <View style={styles.subRatingCol}>
                      <Text style={styles.subRatingLabel}>PUNCTUALITY</Text>
                      <Text style={styles.subRatingValue}>{provider.ratingOverview.punctuality}★</Text>
                    </View>
                    <View style={styles.subRatingCol}>
                      <Text style={styles.subRatingLabel}>WORK QUALITY</Text>
                      <Text style={styles.subRatingValue}>{provider.ratingOverview.workQuality}★</Text>
                    </View>
                    <View style={styles.subRatingCol}>
                      <Text style={styles.subRatingLabel}>FAIR PRICING</Text>
                      <Text style={styles.subRatingValue}>{provider.ratingOverview.fairPricing}★</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Review Filter Chips with ScrollView for Mobile */}
              <View style={styles.filterChipsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.filterChipsRow, isDesktop && styles.filterChipsRowDesktop]}
                >
                  <TouchableOpacity
                    style={[styles.filterChip, reviewFilter === 'verified' && styles.filterChipActive]}
                    onPress={() => setReviewFilter('verified')}
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={reviewFilter === 'verified' ? '#FFFFFF' : '#10B981'}
                      style={{ marginRight: 4, flexShrink: 0 }}
                    />
                    <Text style={[styles.filterChipText, reviewFilter === 'verified' && styles.filterChipTextActive]}>
                      Verified Only ({provider.reviews.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, reviewFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setReviewFilter('all')}
                  >
                    <Text style={[styles.filterChipText, reviewFilter === 'all' && styles.filterChipTextActive]}>
                      All ({provider.reviews.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, reviewFilter === 'photos' && styles.filterChipActive]}
                    onPress={() => setReviewFilter('photos')}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={13}
                      color={reviewFilter === 'photos' ? '#FFFFFF' : '#4B5563'}
                      style={{ marginRight: 4, flexShrink: 0 }}
                    />
                    <Text style={[styles.filterChipText, reviewFilter === 'photos' && styles.filterChipTextActive]}>
                      With Photos (34)
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Filter Notice Banner when "With Photos" is active */}
              {reviewFilter === 'photos' && (
                <View style={[styles.photosNoticeBanner, !isDesktop && styles.photosNoticeBannerMobile]}>
                  <View style={styles.photosNoticeLeft}>
                    <Ionicons name="camera" size={15} color="#111827" style={{ marginRight: 6, flexShrink: 0 }} />
                    <Text style={[styles.photosNoticeText, !isDesktop && { flexShrink: 1 }]} numberOfLines={2}>
                      Showing 34 customer reviews with on-site work photos
                    </Text>
                  </View>
                  <Text style={styles.photosNoticeBadge}>VERIFIED ON-SITE WORK</Text>
                </View>
              )}

              {/* Review Cards Grid */}
              <View style={[styles.reviewsList, isDesktop && styles.reviewsListDesktop]}>
                {filteredReviews.map((rev) => {
                  const vote = helpfulVotes[rev.id] || { count: rev.helpfulCount, voted: false };
                  return (
                    <View
                      key={rev.id}
                      style={[
                        styles.reviewCard,
                        isDesktop && (isWide ? styles.reviewCardDesktopWide : styles.reviewCardDesktop),
                      ]}
                    >
                      {/* Reviewer Header */}
                      <View style={styles.reviewerHeader}>
                        <View style={styles.reviewerAvatarAndName}>
                          <View
                            style={[
                              styles.reviewerAvatar,
                              { backgroundColor: rev.avatarBgColor || '#E5E7EB' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.reviewerInitials,
                                rev.avatarBgColor === '#10B981' && { color: '#FFFFFF' },
                              ]}
                            >
                              {rev.authorInitials}
                            </Text>
                          </View>
                          <View style={styles.reviewerInfoCol}>
                            <Text style={styles.reviewerName} numberOfLines={1}>{rev.author}</Text>
                            <Text style={styles.reviewerMeta} numberOfLines={1}>
                              {rev.timeAgo} • <Text style={styles.serviceTag}>{rev.serviceType}</Text>
                            </Text>
                          </View>
                        </View>

                        {/* Verified Badge */}
                        <View style={styles.revVerifiedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" style={{ marginRight: 4, flexShrink: 0 }} />
                          <Text style={styles.revVerifiedText}>{rev.verifiedType}</Text>
                        </View>
                      </View>

                      {/* Stars */}
                      <View style={styles.reviewStarsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= rev.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#111827"
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>

                      {/* Content */}
                      <Text style={styles.reviewContent}>{rev.content}</Text>

                      {/* Photos if any */}
                      {rev.photos && rev.photos.length > 0 && (
                        <View style={styles.reviewPhotosRow}>
                          {rev.photos.map((photo, pIdx) => (
                            <View key={pIdx} style={styles.reviewPhotoItem}>
                              <Image source={{ uri: photo.url }} style={styles.reviewPhotoImage} />
                              <View style={styles.photoTagBadge}>
                                <Text style={styles.photoTagText}>{photo.tag}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Bottom Work & Helpful Row */}
                      <View style={styles.reviewBottomRow}>
                        <View style={styles.reviewLocationCol}>
                          <Text style={styles.workLocationText} numberOfLines={1}>
                            {rev.workLocation}
                            {rev.invoiceNumber ? ` • 🧾 ${rev.invoiceNumber}` : ''}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.helpfulBtn, vote.voted && styles.helpfulBtnVoted]}
                          onPress={() => toggleHelpful(rev.id)}
                        >
                          <Ionicons
                            name={vote.voted ? 'thumbs-up' : 'thumbs-up-outline'}
                            size={13}
                            color={vote.voted ? '#10B981' : '#4B5563'}
                            style={{ marginRight: 4, flexShrink: 0 }}
                          />
                          <Text style={[styles.helpfulText, vote.voted && styles.helpfulTextVoted]} numberOfLines={1}>
                            Was this helpful? {vote.count}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: isDesktop ? 60 : 120 }} />
        </ScrollView>

        {/* Bottom Fixed Action Bar for Mobile */}
        {!isDesktop && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => setMessageModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={17} color="#111827" style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={styles.messageBtnText} numberOfLines={1}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.instantBookBtn}
              onPress={() => setBookModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={17} color="#FFFFFF" style={{ marginRight: 6, flexShrink: 0 }} />
              <Text style={styles.instantBookBtnText} numberOfLines={1}>Instant Book</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Certificate Viewer Modal */}
        <CertificateModal
          visible={certModalVisible}
          onClose={() => setCertModalVisible(false)}
          license={selectedLicense}
          providerName={provider.name}
        />

        {/* Instant Booking Modal */}
        <InstantBookModal
          visible={bookModalVisible}
          onClose={() => setBookModalVisible(false)}
          provider={provider}
          onSuccess={() => {
            setBookModalVisible(false);
            router.push('/(tabs)/bookings');
          }}
        />

        {/* Direct Messaging Modal */}
        <MessageModal
          visible={messageModalVisible}
          onClose={() => setMessageModalVisible(false)}
          provider={provider}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
    width: '100%',
  },
  topBarDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  desktopBreadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  breadcrumbMuted: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  desktopVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 12,
  },
  desktopVerifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexShrink: 0,
  },
  desktopHeaderCTAs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 10,
  },
  desktopHeaderMsgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  desktopHeaderMsgText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  desktopHeaderBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  desktopHeaderBookText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Scroll Area
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    width: '100%',
  },
  scrollContentDesktop: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },

  // Header Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  profileCardDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
    borderRadius: 20,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTopRowDesktop: {
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
    flexShrink: 0,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  avatarImageDesktop: {
    width: 90,
    height: 90,
    borderRadius: 18,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarVerifiedBadgeDesktop: {
    width: 26,
    height: 26,
    borderRadius: 13,
    bottom: -3,
    right: -3,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  providerNameDesktop: {
    fontSize: 26,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  providerTitle: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  providerTitleDesktop: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  reviewCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  desktopInlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  profileMobileBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    flexShrink: 1,
  },
  backgroundBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifiedGreenCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    marginRight: 6,
    flexShrink: 0,
  },
  backgroundBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },

  // Desktop Profile Right Summary Box
  profileRightColDesktop: {
    marginLeft: 32,
    minWidth: 260,
  },
  desktopRateSummaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  desktopRateSummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  desktopRateSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  desktopRateSummaryPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  desktopRateSummaryUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  desktopResponsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  desktopResponseText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  desktopInstantBookAction: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  desktopInstantBookActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Segmented Tabs Container
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    width: '100%',
  },
  tabsContainerDesktop: {
    padding: 6,
    borderRadius: 14,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabButtonDesktop: {
    paddingVertical: 12,
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabButtonTextDesktop: {
    fontSize: 13.5,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  // Tab Content
  tabContent: {
    gap: 14,
    width: '100%',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  transparentLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.4,
  },
  sectionTitleDesktop: {
    fontSize: 14.5,
  },
  sectionRightBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    flexShrink: 0,
  },

  // Rates Grid
  ratesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  ratesGridDesktop: {
    gap: 16,
    marginBottom: 16,
  },
  rateCol: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rateColDesktop: {
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  rateColLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  rateColLabelDesktop: {
    fontSize: 11,
  },
  rateColPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  rateColPriceDesktop: {
    fontSize: 26,
  },
  rateColUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  rateColNote: {
    fontSize: 9.5,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  rateColNoteDesktop: {
    fontSize: 11.5,
  },
  pricingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  pricingBannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.4,
  },
  pricingBannerTextDesktop: {
    fontSize: 11.5,
  },

  // About & Skills
  aboutParagraph: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 14,
  },
  aboutParagraphDesktop: {
    fontSize: 14,
    lineHeight: 22,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillPillDesktop: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  skillPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  skillPillTextDesktop: {
    fontSize: 12.5,
  },

  // Verified Documents
  docList: {
    gap: 10,
    width: '100%',
  },
  docListDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
  },
  docItemDesktop: {
    flex: 1,
    padding: 14,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    paddingRight: 8,
  },
  docTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  docTitleDesktop: {
    fontSize: 13.5,
  },
  docSubtitle: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },
  greenCheckSquare: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Recent Work
  recentWorkGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  recentWorkGridDesktop: {
    gap: 16,
  },
  recentWorkItem: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  recentWorkItemDesktop: {
    height: 180,
  },
  recentWorkImage: {
    width: '100%',
    height: '100%',
  },
  recentWorkTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recentWorkTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Credentials Tab Specifics
  verifiedGreenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexShrink: 0,
  },
  verifiedGreenBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  credentialsList: {
    gap: 10,
    width: '100%',
  },
  credentialsListDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  credentialCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
  },
  credentialCardDesktop: {
    flex: 1,
    padding: 14,
  },
  credIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
    marginTop: 2,
  },
  credContent: {
    flex: 1,
  },
  credTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  credTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 6,
  },
  credTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  credTitleDesktop: {
    fontSize: 13.5,
  },
  activePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  credDetails: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 14,
  },

  // Licenses
  licensesList: {
    gap: 12,
    marginTop: 10,
    width: '100%',
  },
  licensesListDesktop: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  licenseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    width: '100%',
  },
  licenseItemDesktop: {
    flex: 1,
    minWidth: 260,
    borderBottomWidth: 0,
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  licenseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  licenseTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 6,
  },
  licenseTitleDesktop: {
    fontSize: 13.5,
  },
  accreditedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  accreditedBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  licenseIssuer: {
    fontSize: 10.5,
    color: '#4B5563',
    marginBottom: 4,
  },
  licenseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  licenseMetaText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
    paddingRight: 6,
  },
  viewCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  viewCertText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    textDecorationLine: 'underline',
  },
  licenseDesc: {
    fontSize: 10.5,
    color: '#6B7280',
    lineHeight: 14,
    marginTop: 4,
  },

  // Insurance
  insuredBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#111827',
    flexShrink: 0,
  },
  insuranceList: {
    gap: 10,
    width: '100%',
  },
  insuranceListDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  insuranceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
  },
  insuranceItemDesktop: {
    flex: 1,
    padding: 14,
  },
  greenIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
    marginTop: 2,
  },
  insuranceContent: {
    flex: 1,
  },
  insTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 6,
  },
  insTitleDesktop: {
    fontSize: 13.5,
  },
  policyBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  policyBadgeText: {
    color: '#065F46',
    fontSize: 8.5,
    fontWeight: '800',
  },
  insProvider: {
    fontSize: 10,
    color: '#4B5563',
    marginVertical: 2,
  },
  insDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },

  // Experience
  experienceStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
    width: '100%',
  },
  experienceStatsRowDesktop: {
    gap: 16,
    marginVertical: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBoxDesktop: {
    padding: 18,
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  statBoxNumberDesktop: {
    fontSize: 24,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  historyList: {
    gap: 10,
    width: '100%',
  },
  historyListDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
  },
  historyCardDesktop: {
    flex: 1,
    padding: 14,
  },
  histIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  histContent: {
    flex: 1,
  },
  histCompany: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  histCompanyDesktop: {
    fontSize: 13.5,
  },
  histRole: {
    fontSize: 10,
    color: '#4B5563',
    marginVertical: 2,
  },
  histDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },

  // Reviews Tab Specifics
  auditedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  auditedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#111827',
  },
  ratingOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  ratingOverviewRowDesktop: {
    marginBottom: 20,
  },
  scoreLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 105,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    paddingRight: 8,
    flexShrink: 0,
  },
  scoreLeftColDesktop: {
    width: 150,
    paddingRight: 16,
  },
  bigScore: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
  },
  bigScoreDesktop: {
    fontSize: 44,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  reviewSubTotal: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },
  barsRightCol: {
    flex: 1,
    paddingLeft: 12,
    gap: 4,
  },
  barsRightColDesktop: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barNumText: {
    fontSize: 10,
    color: '#6B7280',
    width: 10,
    textAlign: 'center',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  barPctText: {
    fontSize: 9.5,
    color: '#6B7280',
    width: 28,
    textAlign: 'right',
    flexShrink: 0,
  },

  // Desktop Sub-ratings Column
  subRatingsDesktopCol: {
    width: 200,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
    paddingLeft: 16,
    gap: 8,
  },
  subRatingBoxDesktop: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  subRatingValueDesktop: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },

  // Mobile Sub-ratings Row
  subRatingsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    width: '100%',
  },
  subRatingCol: {
    flex: 1,
    alignItems: 'center',
  },
  subRatingLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subRatingValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },

  // Review Filters
  filterChipsWrapper: {
    width: '100%',
    marginVertical: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChipsRowDesktop: {
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  photosNoticeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  photosNoticeBannerMobile: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  photosNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 6,
  },
  photosNoticeText: {
    fontSize: 10.5,
    color: '#374151',
    fontWeight: '500',
  },
  photosNoticeBadge: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.3,
    flexShrink: 0,
  },

  // Review Cards
  reviewsList: {
    gap: 12,
    width: '100%',
  },
  reviewsListDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  reviewCardDesktop: {
    width: '48.5%',
  },
  reviewCardDesktopWide: {
    width: '31.8%',
  },
  reviewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerAvatarAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  reviewerInfoCol: {
    flex: 1,
  },
  reviewerInitials: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  reviewerMeta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceTag: {
    fontWeight: '700',
    color: '#111827',
  },
  revVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  revVerifiedText: {
    fontSize: 9.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 10,
  },
  reviewPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    width: '100%',
  },
  reviewPhotoItem: {
    flex: 1,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  reviewPhotoImage: {
    width: '100%',
    height: '100%',
  },
  photoTagBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '600',
  },
  reviewBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  reviewLocationCol: {
    flex: 1,
    paddingRight: 8,
  },
  workLocationText: {
    fontSize: 10,
    color: '#6B7280',
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpfulBtnVoted: {
    opacity: 0.9,
  },
  helpfulText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  helpfulTextVoted: {
    color: '#10B981',
    fontWeight: 'bold',
  },

  // Bottom Fixed Action Bar (Mobile)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
    zIndex: 20,
    width: '100%',
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  instantBookBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
  },
  instantBookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
