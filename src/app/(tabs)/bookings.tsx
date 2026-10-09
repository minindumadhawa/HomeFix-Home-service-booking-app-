import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BookingRecord,
  BookingStatus,
  getBookings,
  updateBooking,
} from '../../services/bookingStore';

const bookingTabs: { label: string; status: BookingStatus }[] = [
  { label: 'Upcoming', status: 'upcoming' },
  { label: 'Completed', status: 'completed' },
  { label: 'Cancelled', status: 'cancelled' },
];

export default function BookingsScreen() {
  const [activeStatus, setActiveStatus] = useState<BookingStatus>('upcoming');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<BookingRecord | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      setBookings(await getBookings());
    } catch (error) {
      console.error('Unable to load saved bookings.', error);
      Alert.alert('Could not load bookings', 'Please try opening My Bookings again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookings();
    }, [loadBookings])
  );

  const changeBookingStatus = async (booking: BookingRecord, status: BookingStatus) => {
    setUpdatingBookingId(booking.id);
    try {
      await updateBooking(booking.id, { status });
      await loadBookings();
    } catch (error) {
      console.error(`Unable to update booking ${booking.id}.`, error);
      Alert.alert('Could not update booking', 'Please try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const confirmCancellation = (booking: BookingRecord) => {
    Alert.alert(
      'Cancel this booking?',
      `${booking.serviceTitle} with ${booking.providerName} will be moved to Cancelled.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => void changeBookingStatus(booking, 'cancelled'),
        },
      ]
    );
  };

  const openReview = (booking: BookingRecord) => {
    setReviewingBooking(booking);
    setReviewRating(booking.rating || 0);
    setReviewText(booking.review || '');
  };

  const submitReview = async () => {
    if (!reviewingBooking) return;
    if (reviewRating === 0) {
      Alert.alert('Choose a rating', 'Tap a star to rate your professional.');
      return;
    }

    setUpdatingBookingId(reviewingBooking.id);
    try {
      await updateBooking(reviewingBooking.id, {
        rating: reviewRating,
        review: reviewText.trim(),
      });
      setReviewingBooking(null);
      await loadBookings();
    } catch (error) {
      console.error(`Unable to save a review for booking ${reviewingBooking.id}.`, error);
      Alert.alert('Could not save review', 'Please try submitting your review again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const visibleBookings = bookings.filter((booking) => booking.status === activeStatus);
  const activeTabLabel = bookingTabs.find((tab) => tab.status === activeStatus)?.label ?? 'Upcoming';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>View your service appointment details</Text>
      </View>

      <View style={styles.segmentContainer}>
        {bookingTabs.map((tab) => (
          <TouchableOpacity
            key={tab.status}
            style={[styles.segmentBtn, activeStatus === tab.status && styles.segmentBtnActive]}
            onPress={() => setActiveStatus(tab.status)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeStatus === tab.status }}
          >
            <Text style={[styles.segmentText, activeStatus === tab.status && styles.segmentTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.emptyStateSub}>Loading your bookings…</Text>
          </View>
        ) : visibleBookings.length > 0 ? (
          visibleBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {booking.scheduledDate} · {booking.scheduledTime}
                  </Text>
                </View>
                <View style={[styles.statusBadge, statusBadgeStyles[booking.status]]}>
                  <Text style={[styles.statusText, statusTextStyles[booking.status]]}>
                    {booking.status === 'upcoming'
                      ? 'Confirmed'
                      : booking.status === 'completed'
                        ? 'Completed'
                        : 'Cancelled'}
                  </Text>
                </View>
              </View>

              <Text style={styles.serviceTitle}>{booking.serviceTitle}</Text>
              <Text style={styles.servicePrice}>{booking.rate}</Text>

              <View style={styles.proInfo}>
                <View style={styles.proAvatarContainer}>
                  <Ionicons name="person" size={22} color="#6B7280" />
                </View>
                <View style={styles.proDetails}>
                  <Text style={styles.proName}>{booking.providerName}</Text>
                  <Text style={styles.proSubtitle}>{booking.providerTitle}</Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <DetailRow icon="receipt-outline" label="Booking ID" value={`#${booking.id}`} />
                <DetailRow icon="location-outline" label="Service address" value={booking.address} />
                <DetailRow icon="wallet-outline" label="Payment" value={booking.paymentMethod} />
                {booking.notes ? (
                  <DetailRow icon="document-text-outline" label="Instructions" value={booking.notes} />
                ) : null}
              </View>

              {booking.status === 'completed' && (
                <View style={styles.reviewSection}>
                  {booking.rating ? (
                    <View style={styles.savedReview}>
                      <View style={styles.savedRatingRow}>
                        <Ionicons name="star" size={16} color="#F59E0B" />
                        <Text style={styles.savedRatingText}>{booking.rating}/5</Text>
                        <Text style={styles.savedReviewByline}>Your review for {booking.providerName}</Text>
                      </View>
                      {booking.review ? <Text style={styles.savedReviewText}>{booking.review}</Text> : null}
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.outlineBtn, styles.reviewBtn]}
                    onPress={() => openReview(booking)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="star-outline" size={16} color="#B45309" />
                    <Text style={[styles.outlineBtnText, styles.reviewBtnText]}>
                      {booking.rating ? 'Edit Review' : 'Review Worker'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === 'upcoming' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.outlineBtn, styles.completeBtn]}
                    onPress={() => void changeBookingStatus(booking, 'completed')}
                    disabled={updatingBookingId === booking.id}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.outlineBtnText, styles.completeBtnText]}>
                      {updatingBookingId === booking.id ? 'Updating…' : 'Mark Completed'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.outlineBtn, styles.cancelBtn]}
                    onPress={() => confirmCancellation(booking)}
                    disabled={updatingBookingId === booking.id}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.outlineBtnText, styles.cancelBtnText]}>Cancel Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                activeStatus === 'upcoming'
                  ? 'calendar-outline'
                  : activeStatus === 'completed'
                    ? 'checkmark-circle-outline'
                    : 'close-circle-outline'
              }
              size={54}
              color="#D1D5DB"
            />
            <Text style={styles.emptyStateTitle}>No {activeTabLabel.toLowerCase()} bookings</Text>
            <Text style={styles.emptyStateSub}>
              {activeStatus === 'upcoming'
                ? 'Confirmed appointments will appear here.'
                : activeStatus === 'completed'
                  ? 'Bookings you mark as completed will appear here.'
                  : 'Bookings you cancel will appear here.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={reviewingBooking !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewingBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.reviewModalHeader}>
              <View style={styles.reviewModalTitleWrap}>
                <Text style={styles.reviewModalTitle}>Review {reviewingBooking?.providerName}</Text>
                <Text style={styles.reviewModalSubtitle}>{reviewingBooking?.serviceTitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setReviewingBooking(null)}
                accessibilityLabel="Close review"
              >
                <Ionicons name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingPrompt}>How was your service?</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setReviewRating(rating)}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${rating} out of 5 stars`}
                  accessibilityState={{ selected: reviewRating === rating }}
                >
                  <Ionicons
                    name={rating <= reviewRating ? 'star' : 'star-outline'}
                    size={34}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share details about the worker and service"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Write your worker review"
            />

            <TouchableOpacity
              style={[styles.submitReviewButton, updatingBookingId === reviewingBooking?.id && styles.buttonDisabled]}
              onPress={() => void submitReview()}
              disabled={updatingBookingId === reviewingBooking?.id}
              activeOpacity={0.85}
            >
              <Text style={styles.submitReviewText}>
                {updatingBookingId === reviewingBooking?.id ? 'Saving…' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={15} color="#6B7280" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const statusBadgeStyles = StyleSheet.create({
  upcoming: { backgroundColor: '#D1FAE5' },
  completed: { backgroundColor: '#DBEAFE' },
  cancelled: { backgroundColor: '#FEE2E2' },
});

const statusTextStyles = StyleSheet.create({
  upcoming: { color: '#059669' },
  completed: { color: '#1D4ED8' },
  cancelled: { color: '#DC2626' },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentBtnActive: { borderBottomColor: '#10B981' },
  segmentText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  segmentTextActive: { color: '#10B981', fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dateContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  dateText: { fontSize: 12, color: '#4B5563', fontWeight: '600', flexShrink: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  serviceTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  servicePrice: { fontSize: 14, fontWeight: '700', color: '#10B981', marginBottom: 14 },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  proAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  proDetails: { flex: 1 },
  proName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  proSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  detailsSection: { gap: 10, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailLabel: { width: 92, fontSize: 11, color: '#6B7280', fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 11, color: '#374151', lineHeight: 16 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  completeBtn: { borderColor: '#A7F3D0' },
  completeBtnText: { color: '#047857' },
  cancelBtn: { borderColor: '#FECACA' },
  cancelBtnText: { color: '#DC2626' },
  reviewSection: { gap: 10, marginBottom: 14 },
  savedReview: { padding: 12, borderRadius: 12, backgroundColor: '#FFFBEB' },
  savedRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savedRatingText: { color: '#92400E', fontSize: 12, fontWeight: '800' },
  savedReviewByline: { color: '#78716C', fontSize: 11, flexShrink: 1 },
  savedReviewText: { color: '#57534E', fontSize: 12, lineHeight: 18, marginTop: 6 },
  reviewBtn: { flexDirection: 'row', gap: 7, borderColor: '#FCD34D' },
  reviewBtnText: { color: '#B45309' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  reviewModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 32,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reviewModalTitleWrap: { flex: 1, paddingRight: 12 },
  reviewModalTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  reviewModalSubtitle: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  ratingPrompt: { color: '#374151', textAlign: 'center', fontSize: 14, fontWeight: '700' },
  ratingStars: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 16 },
  reviewInput: {
    minHeight: 110,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    color: '#111827',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  submitReviewButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#10B981',
  },
  submitReviewText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  buttonDisabled: { opacity: 0.6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 28 },
  emptyStateTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyStateSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 19 },
});
