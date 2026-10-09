import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const recentIssue = {
  title: 'Plumbing Leakage & Pipe Repair',
  subTitle: 'Today, 3:45 PM • Colombo 07',
  status: 'Completed',
  duration: '42 mins',
  specialist: 'K. L. Perera',
  rating: '4.9',
};

const contactChannels = [
  { label: 'Chat Support', icon: 'chatbubble-ellipses-outline', color: '#10B981' },
  { label: 'Call Agent', icon: 'call-outline', color: '#F59E0B' },
  { label: 'WhatsApp', icon: 'logo-whatsapp', color: '#22C55E' },
];

const topicList = [
  'Warranty Claims & Guarantee',
  'Payments, Refunds & Invoices',
  'Technician Tracking & Safety',
  'Account & Saved Addresses',
];

const faqList = [
  'What is the repaired pipe or wiring warranty?',
  'How do I dispute an extra technician charge?',
  'How do I download official tax invoice PDFs?',
  'Can I cancel the technician after dispatch?',
];

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneShell}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.iconButton}>
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
                <TouchableOpacity key={channel.label} style={styles.channelButton}>
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
              {topicList.map((item, index) => (
                <TouchableOpacity key={item} style={styles.topicRow}>
                  <View style={styles.topicMarker}>
                    <Ionicons name={index % 2 === 0 ? 'shield-checkmark-outline' : 'cash-outline'} size={16} color="#10B981" />
                  </View>
                  <Text style={styles.topicText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqList.map((item, index) => (
              <View key={item} style={[styles.faqItem, index === faqList.length - 1 && styles.faqItemLast]}>
                <Text style={styles.faqText}>{item}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.ctaButton}>
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
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
