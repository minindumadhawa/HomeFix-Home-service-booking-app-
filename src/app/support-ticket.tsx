import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const issueTypes = ['Service Issue', 'Billing', 'Technician', 'Account'];

export default function SupportTicketScreen() {
  const params = useLocalSearchParams<{ issueType?: string; subject?: string }>();
  const initialIssueType = issueTypes.includes(params.issueType ?? '')
    ? params.issueType!
    : 'Service Issue';
  const [selectedIssue, setSelectedIssue] = useState(initialIssueType);
  const [subject, setSubject] = useState(params.subject ?? '');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('+94 77 123 4567');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please add a short subject and describe the issue before submitting.');
      return;
    }

    Alert.alert(
      'Ticket Submitted',
      `Your ${selectedIssue.toLowerCase()} request has been submitted. Our support team will contact you shortly.`
    );
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Support Ticket</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="help-buoy" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>We’re here to help</Text>
            <Text style={styles.bannerSubtitle}>Tell us what happened and we’ll reach out quickly.</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Issue Type</Text>
          <View style={styles.issueRow}>
            {issueTypes.map((type) => {
              const isSelected = selectedIssue === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.issueChip, isSelected && styles.issueChipActive]}
                  onPress={() => setSelectedIssue(type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.issueChipText, isSelected && styles.issueChipTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief summary of the problem"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Describe issue</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what happened, when it happened, and what you need help with..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.8}>
            <Ionicons name="attach-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={styles.attachButtonText}>Add photo or invoice</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9}>
          <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>Submit Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF1F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  bannerIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  bannerSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F1',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  issueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  issueChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  issueChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  issueChipTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingVertical: 14,
  },
  attachButtonText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
