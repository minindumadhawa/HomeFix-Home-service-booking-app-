import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  createSupportTicket,
  getUserTickets,
  updateTicket,
  deleteTicket,
} from '../../services/ticketService';
import { SupportTicket, TicketPriority } from '../../types/ticket';
import { auth } from '../../config/firebase';

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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State for Create / Edit Ticket
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);

  // Form Fields
  const [selectedTopic, setSelectedTopic] = useState('Warranty Claims & Guarantee');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');

  // Detail Modal State
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await getUserTickets();
      setTickets(data);
    } catch (e) {
      console.warn('Error fetching tickets:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTickets();
  };

  const handleOpenCreateModal = (prefilledTopic?: string) => {
    setEditingTicket(null);
    setSelectedTopic(prefilledTopic || topicList[0]);
    setSubject('');
    setDescription('');
    setPriority('Medium');
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (t: SupportTicket) => {
    setEditingTicket(t);
    setSelectedTopic(t.topic);
    setSubject(t.subject);
    setDescription(t.description);
    setPriority(t.priority);
    setIsModalVisible(true);
  };

  const handleSaveTicket = async () => {
    if (!subject.trim()) {
      Alert.alert('Required Field', 'Please enter a ticket subject or brief summary.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please describe the issue in detail.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTicket) {
        // UPDATE existing ticket
        await updateTicket(editingTicket.id, {
          topic: selectedTopic,
          subject: subject.trim(),
          description: description.trim(),
          priority,
        });
        Alert.alert('Ticket Updated', `Ticket #${editingTicket.id} has been modified.`);
      } else {
        // CREATE new ticket
        const created = await createSupportTicket({
          topic: selectedTopic,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          userName: auth.currentUser?.displayName || 'App User',
          userEmail: auth.currentUser?.email || '',
        });
        Alert.alert('Ticket Submitted', `Ticket #${created.id} has been opened and sent to Support.`);
      }
      setIsModalVisible(false);
      fetchTickets();
    } catch (err) {
      console.error('Save ticket error:', err);
      Alert.alert('Submission Error', 'Could not save ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = (ticket: SupportTicket) => {
    Alert.alert(
      'Delete Ticket',
      `Are you sure you want to delete Ticket #${ticket.id}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicket(ticket.id);
              setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
              if (viewingTicket?.id === ticket.id) setViewingTicket(null);
              Alert.alert('Deleted', 'Ticket has been removed.');
            } catch (e) {
              console.error('Delete error:', e);
            }
          },
        },
      ]
    );
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Open':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'In Progress':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'Resolved':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Closed':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#10B981']} />
        }
      >
        <View style={styles.phoneShell}>
          {/* Header */}
          <View style={styles.topHeader}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Help & Support</Text>
              <Text style={styles.headerSubtitle}>24/7 Dedicated Customer Care</Text>
            </View>
            <View style={styles.greenBadge}>
              <Ionicons name="help-buoy" size={18} color="#FFFFFF" />
            </View>
          </View>

          {/* Quick Support Ticket Banner */}
          <View style={styles.quickCtaBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickCtaTitle}>Need immediate help?</Text>
              <Text style={styles.quickCtaSub}>Open a support ticket for prioritized technician follow-up</Text>
            </View>
            <TouchableOpacity style={styles.quickCtaBtn} onPress={() => handleOpenCreateModal()}>
              <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 2 }} />
              <Text style={styles.quickCtaBtnText}>New Ticket</Text>
            </TouchableOpacity>
          </View>

          {/* Active Tickets List (CRUD View) */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ticket-outline" size={18} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>My Support Tickets</Text>
              </View>
              <Text style={styles.ticketCountBadge}>
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 14 }} />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyTicketsBox}>
                <Ionicons name="checkmark-done-circle-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyTicketsTitle}>No open tickets</Text>
                <Text style={styles.emptyTicketsSub}>
                  Everything looks clear! If you have any issue, tap below to open a ticket.
                </Text>
              </View>
            ) : (
              tickets.map((t) => {
                const badge = getStatusBadgeStyle(t.status);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.ticketCardItem}
                    onPress={() => setViewingTicket(t)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.ticketItemTop}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <Text style={styles.ticketItemId}>#{t.id}</Text>
                          <Text style={styles.ticketItemTopic}>• {t.topic}</Text>
                        </View>
                        <Text style={styles.ticketItemSubject} numberOfLines={1}>
                          {t.subject}
                        </Text>
                      </View>
                      <View style={[styles.ticketBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={[styles.ticketBadgeText, { color: badge.text }]}>{t.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.ticketItemDesc} numberOfLines={2}>
                      {t.description}
                    </Text>

                    {t.adminResponse && (
                      <View style={styles.adminReplyPill}>
                        <Ionicons name="chatbox-ellipses" size={12} color="#059669" style={{ marginRight: 4 }} />
                        <Text style={styles.adminReplyText} numberOfLines={1}>
                          Support: {t.adminResponse}
                        </Text>
                      </View>
                    )}

                    <View style={styles.ticketItemFooter}>
                      <Text style={styles.ticketItemDate}>
                        Priority: <Text style={{ fontWeight: 'bold' }}>{t.priority}</Text>
                      </Text>
                      <View style={styles.ticketActionRow}>
                        <TouchableOpacity
                          style={styles.ticketEditAction}
                          onPress={() => handleOpenEditModal(t)}
                        >
                          <Ionicons name="pencil" size={13} color="#4B5563" style={{ marginRight: 3 }} />
                          <Text style={styles.ticketActionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.ticketDeleteAction}
                          onPress={() => handleDeleteTicket(t)}
                        >
                          <Ionicons name="trash-outline" size={13} color="#DC2626" style={{ marginRight: 3 }} />
                          <Text style={[styles.ticketActionText, { color: '#DC2626' }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Recent Issue Summary */}
          <View style={styles.cardSection}>
            <View style={styles.inlineHeader}>
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.inlineLabel}>Warranty Protection</Text>
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
              <Text style={styles.statusNote}>30-day rework warranty active</Text>
            </View>
          </View>

          {/* Direct Contact Channels */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Direct Contact Channels</Text>
            <View style={styles.channelRow}>
              {contactChannels.map((channel) => (
                <TouchableOpacity
                  key={channel.label}
                  style={styles.channelButton}
                  onPress={() => handleOpenCreateModal(channel.label)}
                >
                  <View style={[styles.channelIcon, { backgroundColor: `${channel.color}20` }]}>
                    <Ionicons name={channel.icon as any} size={18} color={channel.color} />
                  </View>
                  <Text style={styles.channelLabel}>{channel.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Browse by Topic */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Browse by Topic</Text>
              <Text style={styles.mutedText}>4 Categories</Text>
            </View>

            <View style={styles.topicList}>
              {topicList.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  style={styles.topicRow}
                  onPress={() => handleOpenCreateModal(item)}
                >
                  <View style={styles.topicMarker}>
                    <Ionicons
                      name={index % 2 === 0 ? 'shield-checkmark-outline' : 'cash-outline'}
                      size={16}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.topicText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqList.map((item, index) => (
              <View key={item} style={[styles.faqItem, index === faqList.length - 1 && styles.faqItemLast]}>
                <Text style={styles.faqText}>{item}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </View>
            ))}
          </View>

          {/* Main Open Support Ticket CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => handleOpenCreateModal()}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>Open Support Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CREATE / EDIT TICKET MODAL */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingTicket ? `Edit Ticket #${editingTicket.id}` : 'Create Support Ticket'}
                </Text>
                <Text style={styles.modalSub}>
                  {editingTicket
                    ? 'Update your problem description or priority'
                    : 'Our admin & support staff will review and respond'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 380 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Category / Topic selector */}
              <Text style={styles.formLabel}>Select Inquiry Topic</Text>
              <View style={styles.topicPillsWrap}>
                {topicList.map((top) => {
                  const isSelected = selectedTopic === top;
                  return (
                    <TouchableOpacity
                      key={top}
                      style={[styles.topicPill, isSelected && styles.topicPillSelected]}
                      onPress={() => setSelectedTopic(top)}
                    >
                      <Text style={[styles.topicPillText, isSelected && styles.topicPillTextSelected]}>
                        {top}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Priority */}
              <Text style={styles.formLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.priorityPill, isSelected && styles.priorityPillSelected]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[styles.priorityPillText, isSelected && styles.priorityPillTextSelected]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subject */}
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Technician arrived late or leaking joint"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />

              {/* Description */}
              <Text style={styles.formLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Explain the problem clearly, including booking details or technician name..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Submit button */}
            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSaveTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSubmitText}>
                    {editingTicket ? 'Save Changes' : 'Submit Ticket to Admin'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VIEW TICKET DETAIL MODAL */}
      <Modal
        visible={!!viewingTicket}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingTicket(null)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setViewingTicket(null)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Ticket Details #{viewingTicket?.id}</Text>
                <Text style={styles.modalSub}>{viewingTicket?.topic}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingTicket(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.viewDetailContent}>
              <View style={styles.viewDetailRow}>
                <Text style={styles.viewDetailLabel}>Status:</Text>
                <Text style={styles.viewDetailValue}>{viewingTicket?.status}</Text>
              </View>
              <View style={styles.viewDetailRow}>
                <Text style={styles.viewDetailLabel}>Priority:</Text>
                <Text style={styles.viewDetailValue}>{viewingTicket?.priority}</Text>
              </View>
              <View style={styles.viewDetailRow}>
                <Text style={styles.viewDetailLabel}>Created:</Text>
                <Text style={styles.viewDetailValue}>
                  {viewingTicket ? new Date(viewingTicket.createdAt).toLocaleString() : ''}
                </Text>
              </View>

              <Text style={[styles.viewDetailLabel, { marginTop: 12 }]}>Subject:</Text>
              <Text style={styles.viewDetailSubject}>{viewingTicket?.subject}</Text>

              <Text style={[styles.viewDetailLabel, { marginTop: 10 }]}>Description:</Text>
              <Text style={styles.viewDetailDesc}>{viewingTicket?.description}</Text>

              {viewingTicket?.adminResponse ? (
                <View style={styles.adminResponseCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.adminResponseTitle}>Support Staff Response:</Text>
                  </View>
                  <Text style={styles.adminResponseContent}>{viewingTicket.adminResponse}</Text>
                </View>
              ) : (
                <View style={styles.waitingResponseBox}>
                  <Ionicons name="time-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={styles.waitingResponseText}>Awaiting Administrator Review</Text>
                </View>
              )}
            </View>

            <View style={styles.viewModalActions}>
              <TouchableOpacity
                style={styles.viewEditBtn}
                onPress={() => {
                  const t = viewingTicket;
                  setViewingTicket(null);
                  if (t) handleOpenEditModal(t);
                }}
              >
                <Ionicons name="pencil" size={15} color="#4B5563" style={{ marginRight: 4 }} />
                <Text style={styles.viewEditBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewDeleteBtn}
                onPress={() => viewingTicket && handleDeleteTicket(viewingTicket)}
              >
                <Ionicons name="trash-outline" size={15} color="#DC2626" style={{ marginRight: 4 }} />
                <Text style={styles.viewDeleteBtnText}>Delete Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  greenBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCtaBox: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  quickCtaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
  },
  quickCtaSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    paddingRight: 8,
  },
  quickCtaBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  quickCtaBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  ticketCountBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyTicketsBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTicketsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 6,
  },
  emptyTicketsSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 12,
  },
  ticketCardItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketItemId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  ticketItemTopic: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  ticketItemSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  ticketBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 6,
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketItemDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 16,
  },
  adminReplyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  adminReplyText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  ticketItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F1',
  },
  ticketItemDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  ticketActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketEditAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 6,
  },
  ticketDeleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  ticketActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
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
    marginRight: 6,
  },
  inlineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  mutedText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  issueMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  specialistMeta: {
    fontSize: 10,
    color: '#6B7280',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 3,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  statusNote: {
    fontSize: 11,
    color: '#6B7280',
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  channelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 18,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  topicPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  topicPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topicPillSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  topicPillText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  topicPillTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityPillSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  priorityPillTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 6,
  },
  formTextArea: {
    height: 80,
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  modalSubmitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewDetailContent: {
    marginVertical: 10,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  viewDetailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  viewDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  viewDetailSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  viewDetailDesc: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
    lineHeight: 18,
  },
  adminResponseCard: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  adminResponseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
  },
  adminResponseContent: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  waitingResponseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
  },
  waitingResponseText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  viewModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  viewEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewEditBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  viewDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDeleteBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
  },
});
