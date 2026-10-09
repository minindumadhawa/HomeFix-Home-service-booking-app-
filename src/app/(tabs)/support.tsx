import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const recentIssue = {
  title: 'Plumbing Leakage & Pipe Repair',
  subTitle: 'Today, 3:45 PM • Colombo 07',
  status: 'Completed',
  duration: '42 mins',
  specialist: 'K. L. Perera',
  rating: '4.9',
};

const supportPhone = '+94771234567';
const supportWhatsAppUrl = 'https://wa.me/94771234567?text=Hello%20HomeFix%20Support%2C%20I%20need%20help.';

const contactChannels = [
  {
    label: 'Chat Support',
    icon: 'chatbubble-ellipses-outline',
    color: '#10B981',
    action: () => {
      const message = encodeURIComponent('Hello HomeFix Support, I need help.');
      Linking.openURL(`sms:${supportPhone}?body=${message}`).catch(() => {
        Alert.alert('Chat support', 'Your device does not support SMS chat right now.');
      });
    },
  },
  {
    label: 'Call Agent',
    icon: 'call-outline',
    color: '#F59E0B',
    action: () => {
      Linking.openURL(`tel:${supportPhone}`).catch(() => {
        Alert.alert('Call agent', `Unable to place a call to ${supportPhone} right now.`);
      });
    },
  },
  {
    label: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#22C55E',
    action: () => {
      Linking.openURL(supportWhatsAppUrl).catch(() => {
        Alert.alert('WhatsApp', 'Unable to open WhatsApp support right now.');
      });
    },
  },
];

const topicList = [
  {
    title: 'Warranty Claims & Guarantee',
    icon: 'shield-checkmark-outline',
    issueType: 'Service Issue',
    description:
      'Check the warranty terms for a completed service or ask us to review a repair that needs follow-up.',
  },
  {
    title: 'Payments, Refunds & Invoices',
    icon: 'card-outline',
    issueType: 'Billing',
    description:
      'Get help with a charge, refund status, payment method, or a missing invoice for your booking.',
  },
  {
    title: 'Technician Tracking & Safety',
    icon: 'navigate-outline',
    issueType: 'Technician',
    description:
      'Find help with technician arrival, booking updates, safety concerns, or a service in progress.',
  },
  {
    title: 'Account & Saved Addresses',
    icon: 'person-circle-outline',
    issueType: 'Account',
    description:
      'Get help updating your account details, phone number, or saved service addresses.',
  },
];

const faqList = [
  {
    question: 'What is the repaired pipe or wiring warranty?',
    answer:
      'Warranty coverage depends on the service and the terms shown on your booking. Open a support ticket with your booking details and our team can confirm the coverage or help with a claim.',
  },
  {
    question: 'How do I dispute an extra technician charge?',
    answer:
      'Ask the technician to explain any additional work and charges before approving it. If a charge is unclear or already appears on your bill, open a support ticket and include your booking ID and invoice details.',
  },
  {
    question: 'How do I download official tax invoice PDFs?',
    answer:
      'Open Bookings, select the completed service, and check its payment or receipt details for the invoice. If the invoice is missing, submit a support ticket with your booking ID.',
  },
  {
    question: 'Can I cancel the technician after dispatch?',
    answer:
      'Cancellation options may depend on the booking status and service terms. Open your booking to check available actions. If the technician is already on the way and you cannot cancel in the app, contact support using the channels above.',
  },
];

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  const handleOpenTicket = () => {
    router.push('/support-ticket');
  };

  const handleTopicTicket = (topic: (typeof topicList)[number]) => {
    router.push(
      `/support-ticket?issueType=${encodeURIComponent(topic.issueType)}&subject=${encodeURIComponent(topic.title)}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneShell}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={styles.greenBadge}>
              <Ionicons name="help-buoy-outline" size={18} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.cardSection}>
            <View style={styles.inlineHeader}>
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.inlineLabel}>Warranty claim</Text>
              </View>
              <Text style={styles.mutedText}>42 mins</Text>
            </View>

            <Text style={styles.issueTitle}>{recentIssue.title}</Text>
            <Text style={styles.issueMeta}>{recentIssue.subTitle}</Text>

            <View style={styles.specialistRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>K</Text>
              </View>
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>{recentIssue.specialist}</Text>
                <Text style={styles.specialistMeta}>Lead Plumbing Specialist</Text>
              </View>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{recentIssue.rating}</Text>
              </View>
            </View>

            <View style={styles.statusBar}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Completed</Text>
              </View>
              <Text style={styles.statusNote}>Service completed</Text>
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Direct Contact Channels</Text>
            <View style={styles.channelRow}>
              {contactChannels.map((channel) => (
                <TouchableOpacity
                  key={channel.label}
                  style={styles.channelButton}
                  onPress={channel.action}
                  activeOpacity={0.8}
                >
                  <View style={[styles.channelIcon, { backgroundColor: `${channel.color}20` }]}>
                    <Ionicons name={channel.icon as any} size={18} color={channel.color} />
                  </View>
                  <Text style={styles.channelLabel}>{channel.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Browse by Topic</Text>
              <Text style={styles.mutedText}>4 Categories</Text>
            </View>

            <View style={styles.topicList}>
              {topicList.map((topic, index) => {
                const isExpanded = expandedTopic === index;

                return (
                  <View key={topic.title} style={styles.topicItem}>
                    <TouchableOpacity
                      style={styles.topicRow}
                      onPress={() => setExpandedTopic(isExpanded ? null : index)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isExpanded }}
                    >
                      <View style={styles.topicMarker}>
                        <Ionicons name={topic.icon as any} size={16} color="#10B981" />
                      </View>
                      <Text style={styles.topicText}>{topic.title}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                        size={16}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.topicDetails}>
                        <Text style={styles.topicDescription}>{topic.description}</Text>
                        <TouchableOpacity
                          style={styles.topicHelpButton}
                          onPress={() => handleTopicTicket(topic)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.topicHelpButtonText}>Get help with this topic</Text>
                          <Ionicons name="arrow-forward" size={14} color="#059669" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqList.map((item, index) => {
              const isExpanded = expandedFaq === index;

              return (
                <View
                  key={item.question}
                  style={[styles.faqItem, index === faqList.length - 1 && styles.faqItemLast]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestionButton}
                    onPress={() => setExpandedFaq(isExpanded ? null : index)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <Text style={styles.faqText}>{item.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  {isExpanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={handleOpenTicket} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.ctaText}>Open Support Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF1F0',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  phoneShell: {
    backgroundColor: '#F6F7F6',
    borderRadius: 28,
    paddingBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  greenBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F1',
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  inlineLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  mutedText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  issueTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  issueMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
  },
  specialistRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 14,
  },
  specialistInfo: {
    flex: 1,
    marginLeft: 10,
  },
  specialistName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  specialistMeta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingText: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '800',
    marginLeft: 4,
  },
  statusBar: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusNote: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  channelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
  },
  channelIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  channelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicList: {
    marginTop: 4,
  },
  topicItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 12,
  },
  topicMarker: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topicText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  topicDetails: {
    paddingLeft: 38,
    paddingRight: 4,
    paddingBottom: 12,
  },
  topicDescription: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 19,
  },
  topicHelpButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
  },
  topicHelpButtonText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  faqQuestionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqAnswer: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 19,
    paddingBottom: 12,
    paddingRight: 24,
  },
  ctaButton: {
    marginTop: 16,
    marginHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
