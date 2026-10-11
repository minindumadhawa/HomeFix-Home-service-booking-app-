import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  getUserBookings,
  rescheduleBooking,
  cancelBooking,
  completeBooking,
  deleteBooking,
} from '../../services/bookingService';
import { Booking, BookingStatus } from '../../types/booking';

const RESCHEDULE_DATES = [
  { dayName: 'Today', dateStr: 'Today, Oct 11, 2026' },
  { dayName: 'Tomorrow', dateStr: 'Mon, Oct 12, 2026' },
  { dayName: 'Tue, Oct 13', dateStr: 'Tue, Oct 13, 2026' },
  { dayName: 'Wed, Oct 14', dateStr: 'Wed, Oct 14, 2026' },
  { dayName: 'Thu, Oct 15', dateStr: 'Thu, Oct 15, 2026' },
  { dayName: 'Fri, Oct 16', dateStr: 'Fri, Oct 16, 2026' },
];

const TIME_SLOTS = [
  '09:00 AM - 10:30 AM',
  '10:30 AM - 12:00 PM',
  '01:00 PM - 02:30 PM',
  '03:00 PM - 04:30 PM',
  '05:30 PM - 07:00 PM',
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<BookingStatus>('Upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState(RESCHEDULE_DATES[1].dateStr);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState(TIME_SLOTS[1]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Filtered by active tab
  const upcomingList = useMemo(() => bookings.filter((b) => b.status === 'Upcoming'), [bookings]);
  const completedList = useMemo(() => bookings.filter((b) => b.status === 'Completed'), [bookings]);
  const cancelledList = useMemo(() => bookings.filter((b) => b.status === 'Cancelled'), [bookings]);

  const displayedList = useMemo(() => {
    if (activeTab === 'Upcoming') return upcomingList;
    if (activeTab === 'Completed') return completedList;
    return cancelledList;
  }, [activeTab, upcomingList, completedList, cancelledList]);

  // CRUD: Reschedule Booking (Update)
  const handleOpenReschedule = (booking: Booking) => {
    setRescheduleModalBooking(booking);
    setSelectedRescheduleDate(booking.selectedDate || RESCHEDULE_DATES[1].dateStr);
    setSelectedRescheduleTime(booking.selectedTime || TIME_SLOTS[1]);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleModalBooking) return;
    setIsUpdating(true);
    try {
      await rescheduleBooking(rescheduleModalBooking.id, selectedRescheduleDate, selectedRescheduleTime);
      Alert.alert('Booking Rescheduled', `Your appointment has been updated to ${selectedRescheduleDate} at ${selectedRescheduleTime}.`);
      setRescheduleModalBooking(null);
      await fetchBookings();
    } catch (err) {
      Alert.alert('Error', 'Could not reschedule booking. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // CRUD: Cancel Booking (Update status to Cancelled)
  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking?',
      `Are you sure you want to cancel booking ${booking.id} (${booking.serviceTitle})?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking.id, 'Cancelled by user');
              await fetchBookings();
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
            } catch (err) {
              Alert.alert('Error', 'Could not cancel booking.');
            }
          },
        },
      ]
    );
  };

  // CRUD: Mark Booking Completed (Update status to Completed)
  const handleCompleteBooking = (booking: Booking) => {
    Alert.alert(
      'Mark as Completed?',
      'Has the service been successfully performed by the professional?',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Yes, Completed',
          onPress: async () => {
            try {
              await completeBooking(booking.id);
              await fetchBookings();
              Alert.alert('Service Completed', 'Thank you! The booking is now in your Completed history.');
            } catch (err) {
              Alert.alert('Error', 'Could not update booking.');
            }
          },
        },
      ]
    );
  };

  // CRUD: Delete Booking Record (Delete from database)
  const handleDeleteBooking = (booking: Booking) => {
    Alert.alert(
      'Delete Booking Record?',
      `Permanently remove ${booking.id} from your booking history? This cannot be undone.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBooking(booking.id);
              await fetchBookings();
              Alert.alert('Deleted', 'Booking record has been removed.');
            } catch (err) {
              Alert.alert('Error', 'Could not delete booking.');
            }
          },
        },
      ]
    );
  };

  const handleCallPro = (phone?: string) => {
    const p = phone || '+94771234567';
    Linking.openURL(`tel:${p}`).catch(() => {
      Alert.alert('Calling Professional', `Dialing ${p}...`);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{bookings.length} Total</Text>
          </View>
        </View>
      </View>

      {/* Segment Tab Controls with dynamic counts */}
      <View style={styles.segmentContainer}>
        {(['Upcoming', 'Completed', 'Cancelled'] as BookingStatus[]).map((tab) => {
          const count =
            tab === 'Upcoming'
              ? upcomingList.length
              : tab === 'Completed'
              ? completedList.length
              : cancelledList.length;
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : displayedList.length === 0 ? (
          /* Empty State for the active tab */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={
                  activeTab === 'Upcoming'
                    ? 'calendar-outline'
                    : activeTab === 'Completed'
                    ? 'receipt-outline'
                    : 'close-circle-outline'
                }
                size={44}
                color="#9CA3AF"
              />
            </View>
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'Upcoming'
                ? 'No Upcoming Bookings'
                : activeTab === 'Completed'
                ? 'No Completed Bookings'
                : 'No Cancelled Bookings'}
            </Text>
            <Text style={styles.emptyStateSub}>
              {activeTab === 'Upcoming'
                ? 'You do not have any scheduled appointments. Need something fixed at home?'
                : activeTab === 'Completed'
                ? 'Services you have finished and signed off will show up here.'
                : 'Cancelled booking requests will be kept here for reference.'}
            </Text>

            {activeTab === 'Upcoming' && (
              <TouchableOpacity
                style={styles.bookServiceBtn}
                onPress={() => router.push('/(tabs)/services')}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.bookServiceBtnText}>Book a Service Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Bookings Cards List */
          displayedList.map((booking) => {
            const isUpcoming = booking.status === 'Upcoming';
            const isCompleted = booking.status === 'Completed';
            const isCancelled = booking.status === 'Cancelled';

            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                activeOpacity={0.92}
                onPress={() => setSelectedBookingForDetails(booking)}
              >
                {/* Card Top: ID, Scheduled Date & Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.bookingIdRow}>
                    <Text style={styles.bookingIdText}>{booking.id}</Text>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{booking.category}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isUpcoming && styles.statusBadgeUpcoming,
                      isCompleted && styles.statusBadgeCompleted,
                      isCancelled && styles.statusBadgeCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isUpcoming && styles.statusTextUpcoming,
                        isCompleted && styles.statusTextCompleted,
                        isCancelled && styles.statusTextCancelled,
                      ]}
                    >
                      {booking.status === 'Upcoming' ? 'Confirmed' : booking.status}
                    </Text>
                  </View>
                </View>

                {/* Service Title & Schedule */}
                <Text style={styles.serviceTitle}>{booking.serviceTitle}</Text>

                <View style={styles.scheduleRow}>
                  <Ionicons name="time-outline" size={15} color="#10B981" />
                  <Text style={styles.scheduleText}>
                    {booking.selectedDate} • {booking.selectedTime}
                  </Text>
                </View>

                {/* Price and Payment Method */}
                <View style={styles.priceRow}>
                  <Text style={styles.servicePrice}>
                    {booking.totalAmount.startsWith('Rs') || booking.totalAmount.startsWith('$')
                      ? booking.totalAmount
                      : `Rs. ${booking.totalAmount}`}
                  </Text>
                  <View style={styles.paymentMethodPill}>
                    <Ionicons
                      name={booking.paymentMethod.includes('Card') ? 'card-outline' : 'cash-outline'}
                      size={12}
                      color="#4B5563"
                    />
                    <Text style={styles.paymentMethodText}>
                      {booking.paymentMethod} {booking.paymentStatus === 'Paid' ? '(Paid)' : ''}
                    </Text>
                  </View>
                </View>

                {/* Assigned Professional Profile Card */}
                <View style={styles.proInfo}>
                  {booking.providerAvatar ? (
                    <Image source={{ uri: booking.providerAvatar }} style={styles.proAvatar} />
                  ) : (
                    <View style={styles.proAvatarFallback}>
                      <Text style={styles.proAvatarInitials}>
                        {booking.providerName.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.proTextCol}>
                    <Text style={styles.proName}>{booking.providerName}</Text>
                    <Text style={styles.proSubtitle}>{booking.providerTitle || 'Certified Specialist'}</Text>
                  </View>

                  {isUpcoming && (
                    <TouchableOpacity
                      style={styles.proCallBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCallPro(booking.userPhone);
                      }}
                    >
                      <Ionicons name="call" size={16} color="#059669" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Address Summary */}
                {booking.addressLine1 && (
                  <View style={styles.addressSummaryRow}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.addressSummaryText} numberOfLines={1}>
                      {booking.addressLine1} {booking.addressLine2 ? `• ${booking.addressLine2}` : ''}
                    </Text>
                  </View>
                )}

                {/* Card Actions (Reschedule, Cancel, Complete, Delete) */}
                <View style={styles.cardActions}>
                  {isUpcoming && (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => handleOpenReschedule(booking)}
                      >
                        <Ionicons name="calendar-outline" size={14} color="#374151" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnText}>Reschedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnComplete}
                        onPress={() => handleCompleteBooking(booking)}
                      >
                        <Ionicons name="checkmark-done" size={14} color="#065F46" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnCompleteText}>Done</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnDanger}
                        onPress={() => handleCancelBooking(booking)}
                      >
                        <Ionicons name="close" size={14} color="#DC2626" style={{ marginRight: 2 }} />
                        <Text style={styles.actionBtnDangerText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {isCompleted && (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => router.push('/(tabs)/services')}
                      >
                        <Ionicons name="refresh" size={14} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnPrimaryText}>Book Again</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnDanger}
                        onPress={() => handleDeleteBooking(booking)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnDangerText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {isCancelled && (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => router.push('/(tabs)/services')}
                      >
                        <Ionicons name="reload" size={14} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnPrimaryText}>Rebook</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnDanger}
                        onPress={() => handleDeleteBooking(booking)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                        <Text style={styles.actionBtnDangerText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Reschedule Modal (Update Date & Time) */}
      <Modal
        visible={!!rescheduleModalBooking}
        animationType="slide"
        transparent
        onRequestClose={() => setRescheduleModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reschedule Booking</Text>
                <Text style={styles.modalSubtitle}>
                  {rescheduleModalBooking?.id} • {rescheduleModalBooking?.serviceTitle}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRescheduleModalBooking(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.pickerSectionTitle}>SELECT NEW DATE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePickerScroll}>
                {RESCHEDULE_DATES.map((item, idx) => {
                  const isSelected = selectedRescheduleDate === item.dateStr;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.datePickChip, isSelected && styles.datePickChipActive]}
                      onPress={() => setSelectedRescheduleDate(item.dateStr)}
                    >
                      <Text style={[styles.datePickChipDay, isSelected && styles.datePickChipTextActive]}>
                        {item.dayName}
                      </Text>
                      <Text style={[styles.datePickChipDate, isSelected && styles.datePickChipTextActive]}>
                        {item.dateStr.split(',')[1] || item.dateStr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.pickerSectionTitle, { marginTop: 18 }]}>SELECT TIME WINDOW</Text>
              <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((slot, idx) => {
                  const isSelected = selectedRescheduleTime === slot;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.timeSlotChip, isSelected && styles.timeSlotChipActive]}
                      onPress={() => setSelectedRescheduleTime(slot)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={isSelected ? '#FFF' : '#374151'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalSummaryBox}>
                <Text style={styles.modalSummaryLabel}>Updated Appointment:</Text>
                <Text style={styles.modalSummaryValue}>
                  {selectedRescheduleDate} at {selectedRescheduleTime}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmRescheduleBtn}
                onPress={handleConfirmReschedule}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmRescheduleBtnText}>Confirm New Time</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Booking Full Details Modal */}
      <Modal
        visible={!!selectedBookingForDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedBookingForDetails(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetLarge}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <Text style={styles.modalSubtitle}>{selectedBookingForDetails?.id}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedBookingForDetails(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedBookingForDetails && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                {/* Service and Status Banner */}
                <View style={styles.detailsStatusCard}>
                  <Text style={styles.detailsServiceTitle}>{selectedBookingForDetails.serviceTitle}</Text>
                  <View style={styles.detailsStatusRow}>
                    <Text style={styles.detailsCategory}>{selectedBookingForDetails.category}</Text>
                    <View style={styles.detailsStatusBadge}>
                      <Text style={styles.detailsStatusBadgeText}>
                        {selectedBookingForDetails.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Appointment Schedule */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>SCHEDULED TIME</Text>
                  <View style={styles.detailsInfoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#10B981" />
                    <Text style={styles.detailsInfoText}>
                      {selectedBookingForDetails.selectedDate} at {selectedBookingForDetails.selectedTime}
                    </Text>
                  </View>
                </View>

                {/* Assigned Specialist */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>ASSIGNED SPECIALIST</Text>
                  <View style={styles.detailsInfoRow}>
                    <Ionicons name="person-outline" size={18} color="#10B981" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.detailsProName}>{selectedBookingForDetails.providerName}</Text>
                      <Text style={styles.detailsProTitle}>
                        {selectedBookingForDetails.providerTitle || 'Master Specialist'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => handleCallPro(selectedBookingForDetails.userPhone)}
                    >
                      <Ionicons name="call" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Service Address */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>SERVICE ADDRESS</Text>
                  <View style={styles.detailsInfoRow}>
                    <Ionicons name="location-outline" size={18} color="#10B981" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.detailsAddressText}>
                        {selectedBookingForDetails.addressLine1 || 'Temple Road'}
                      </Text>
                      {selectedBookingForDetails.addressLine2 ? (
                        <Text style={styles.detailsAddressSubText}>
                          {selectedBookingForDetails.addressLine2}
                        </Text>
                      ) : null}
                      {selectedBookingForDetails.landmarkInstruction ? (
                        <Text style={styles.detailsLandmarkText}>
                          Note: {selectedBookingForDetails.landmarkInstruction}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Issue Description */}
                {selectedBookingForDetails.issueDescription ? (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>REPORTED ISSUE / NOTES</Text>
                    <Text style={styles.detailsIssueText}>{selectedBookingForDetails.issueDescription}</Text>
                  </View>
                ) : null}

                {/* Payment Summary */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>PAYMENT INFORMATION</Text>
                  <View style={styles.detailsPaymentRow}>
                    <Text style={styles.detailsPaymentLabel}>Method:</Text>
                    <Text style={styles.detailsPaymentVal}>{selectedBookingForDetails.paymentMethod}</Text>
                  </View>
                  <View style={styles.detailsPaymentRow}>
                    <Text style={styles.detailsPaymentLabel}>Payment Status:</Text>
                    <Text
                      style={[
                        styles.detailsPaymentVal,
                        {
                          color:
                            selectedBookingForDetails.paymentStatus === 'Paid' ? '#059669' : '#D97706',
                          fontWeight: 'bold',
                        },
                      ]}
                    >
                      {selectedBookingForDetails.paymentStatus}
                    </Text>
                  </View>
                  <View style={[styles.detailsPaymentRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 }]}>
                    <Text style={styles.detailsTotalLabel}>Total Amount:</Text>
                    <Text style={styles.detailsTotalVal}>
                      {selectedBookingForDetails.totalAmount.startsWith('Rs') ||
                      selectedBookingForDetails.totalAmount.startsWith('$')
                        ? selectedBookingForDetails.totalAmount
                        : `Rs. ${selectedBookingForDetails.totalAmount}`}
                    </Text>
                  </View>
                </View>

                {/* Bottom Close Button */}
                <TouchableOpacity
                  style={styles.detailsCloseBtn}
                  onPress={() => setSelectedBookingForDetails(null)}
                >
                  <Text style={styles.detailsCloseBtnText}>Close Details</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  totalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentBtnActive: { borderBottomColor: '#10B981' },
  segmentText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  segmentTextActive: { color: '#10B981', fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  centerBox: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13, color: '#6B7280' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  emptyStateSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  bookServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bookServiceBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingIdRow: { flexDirection: 'row', alignItems: 'center' },
  bookingIdText: { fontSize: 13, fontWeight: '800', color: '#111827', marginRight: 8 },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  statusBadgeUpcoming: { backgroundColor: '#ECFDF5' },
  statusBadgeCompleted: { backgroundColor: '#EFF6FF' },
  statusBadgeCancelled: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextUpcoming: { color: '#059669' },
  statusTextCompleted: { color: '#2563EB' },
  statusTextCancelled: { color: '#DC2626' },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scheduleText: { fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 6 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  servicePrice: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  paymentMethodText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  proAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  proAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  proAvatarInitials: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  proTextCol: { flex: 1 },
  proName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  proSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  proCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  addressSummaryText: { fontSize: 11, color: '#6B7280', marginLeft: 4, flex: 1 },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  actionBtnComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnCompleteText: { fontSize: 12, fontWeight: '700', color: '#065F46' },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  actionBtnDangerText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 8,
  },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalSheetLarge: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  modalCloseBtn: { padding: 4 },
  modalBody: { paddingBottom: 20 },
  pickerSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  datePickerScroll: { marginBottom: 10 },
  datePickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
  },
  datePickChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  datePickChipDay: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 2 },
  datePickChipDate: { fontSize: 11, color: '#6B7280' },
  datePickChipTextActive: { color: '#FFF' },
  timeSlotsGrid: { gap: 8, marginBottom: 16 },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  timeSlotChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  timeSlotTextActive: { color: '#FFF' },
  modalSummaryBox: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  modalSummaryLabel: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  modalSummaryValue: { fontSize: 13, fontWeight: 'bold', color: '#047857', marginTop: 2 },
  confirmRescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 14,
  },
  confirmRescheduleBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  // Details Modal styles
  detailsStatusCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  detailsServiceTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  detailsStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsCategory: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  detailsStatusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  detailsStatusBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  detailsSection: { marginBottom: 14 },
  detailsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  detailsInfoText: { fontSize: 13, fontWeight: '600', color: '#111827', marginLeft: 8 },
  detailsProName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  detailsProTitle: { fontSize: 11, color: '#6B7280' },
  callSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsAddressText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  detailsAddressSubText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  detailsLandmarkText: { fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: '500' },
  detailsIssueText: {
    fontSize: 13,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    lineHeight: 18,
  },
  detailsPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailsPaymentLabel: { fontSize: 12, color: '#6B7280' },
  detailsPaymentVal: { fontSize: 12, color: '#111827', fontWeight: '600' },
  detailsTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  detailsTotalVal: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  detailsCloseBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  detailsCloseBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
});
