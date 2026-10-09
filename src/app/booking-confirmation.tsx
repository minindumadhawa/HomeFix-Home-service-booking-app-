import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams<{
    status?: string; // 'paid' | 'confirmed'
    paymentMethod?: string;
    cardLast4?: string;
    totalAmount?: string;
    selectedDate?: string;
    selectedTime?: string;
    addressType?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressPhone?: string;
    landmarkInstruction?: string;
    issueDescription?: string;
  }>();

  const isPaid = params.status === 'paid';
  const bookingId = '#HF-89421';
  const totalAmount = params.totalAmount || '2,320.00';
  const selectedDate = params.selectedDate || 'Thu, Oct 8, 2026';
  const selectedTime = params.selectedTime || '10:30 AM';
  const paymentMethod = params.paymentMethod || (isPaid ? 'Credit / Debit Card' : 'Cash on Completion');
  const addressLine1 = params.addressLine1 || 'No 45/A, Temple Road, Colombo 03';

  // Tracking Steps Flow:
  // 1. Placed (Done) -> 2. On the Way (Active) -> 3. Work in Progress (Pending) -> 4. Completed (Pending)
  const [currentStepIndex, setCurrentStepIndex] = useState(1); // 1 = "On the way"

  const trackingSteps = [
    {
      title: 'Booking Placed',
      description: 'Request assigned & confirmed by Nimal Silva',
      time: 'Just now',
      icon: 'checkmark-circle',
    },
    {
      title: 'Professional On the Way',
      description: 'En route with toolkit & safety gear (ETA ~25 mins)',
      time: 'In Progress',
      icon: 'bicycle',
    },
    {
      title: 'Work in Progress',
      description: 'Inspection & electrical fix at your premise',
      time: 'Upcoming',
      icon: 'hammer',
    },
    {
      title: 'Service Completed',
      description: 'Quality check verified & digital sign-off',
      time: 'Upcoming',
      icon: 'star',
    },
  ];

  const handleDownloadReceipt = () => {
    Alert.alert(
      'Receipt Downloaded',
      `E-Receipt for Booking ${bookingId} (LKR ${totalAmount}) has been saved to your downloads folder.`
    );
  };

  const handleCallPro = () => {
    const phoneNumber = '+94771234567';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Call Nimal Silva', `Dialing ${phoneNumber}...`);
    });
  };

  const handleMessagePro = () => {
    Alert.alert('Message Nimal Silva', 'Opening direct in-app chat with professional...');
  };

  const handleTrackLive = () => {
    Alert.alert(
      '📍 Live GPS Tracking',
      'Nimal Silva is approximately 3.1 km away on Marine Drive. Estimated arrival in 25 minutes.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isPaid ? 'Payment & Booking Details' : 'Booking Confirmation'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={32} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>
            {isPaid ? 'Payment Successful!' : 'Booking Confirmed!'}
          </Text>
          <Text style={styles.successSubtitle}>
            {isPaid
              ? 'Your payment was authorized and appointment is secured.'
              : 'Your booking has been successfully placed with the professional.'}
          </Text>

          {/* Booking ID badge */}
          <View style={styles.bookingIdBadge}>
            <Text style={styles.bookingIdLabel}>BOOKING ID:</Text>
            <Text style={styles.bookingIdValue}>{bookingId}</Text>
          </View>
        </View>

        {/* Transaction Summary Card */}
        <View style={styles.transactionCard}>
          <View style={styles.transRow}>
            <Text style={styles.transLabel}>Payment Method</Text>
            <View style={styles.methodPill}>
              <Ionicons
                name={isPaid ? 'card-outline' : 'wallet-outline'}
                size={14}
                color="#059669"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.methodPillText}>{paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.transDivider} />

          <View style={styles.transRow}>
            <Text style={styles.transLabel}>
              {isPaid ? 'Total Amount Paid' : 'Total Payable'}
            </Text>
            <Text style={styles.transAmount}>LKR {totalAmount}</Text>
          </View>

          {/* Receipt Download: ONLY shown when payment is made via Card */}
          {isPaid && (
            <TouchableOpacity
              style={styles.downloadReceiptBtn}
              onPress={handleDownloadReceipt}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.downloadReceiptText}>Download Payment Receipt (PDF)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Assigned Professional Profile Card (Dark Theme) */}
        <View style={styles.proCard}>
          <View style={styles.proCardHeader}>
            <View style={styles.proAvatarContainer}>
              <Ionicons name="person" size={26} color="#9CA3AF" />
              <Text style={styles.proPhotoText}>PRO</Text>
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proBadgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={11} color="#FFF" />
                  <Text style={styles.verifiedText}>ASSIGNED</Text>
                </View>
                <Text style={styles.proRating}>
                  <Ionicons name="star" size={12} color="#FBBF24" /> 4.8 (94)
                </Text>
              </View>
              <Text style={styles.proName}>Nimal Silva</Text>
              <Text style={styles.proRole}>Certified Senior Electrician • 3.1 km away</Text>
            </View>
          </View>

          {/* Quick Contact Actions */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallPro} activeOpacity={0.8}>
              <Ionicons name="call" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.callBtnText}>Call Professional</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.msgBtn} onPress={handleMessagePro} activeOpacity={0.8}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.msgBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Professional Tracking Flow */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LIVE SERVICE TRACKING</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.trackingCard}>
          {trackingSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;
            const isLast = index === trackingSteps.length - 1;

            return (
              <View key={index} style={styles.trackStepRow}>
                {/* Left indicator icon & connecting line */}
                <View style={styles.stepIndicatorCol}>
                  <View
                    style={[
                      styles.stepIconCircle,
                      isCompleted && styles.stepIconCompleted,
                      isCurrent && styles.stepIconCurrent,
                      isUpcoming && styles.stepIconUpcoming,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark' : (step.icon as any)}
                      size={14}
                      color={isCompleted || isCurrent ? '#FFF' : '#9CA3AF'}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        isCompleted ? styles.stepLineCompleted : styles.stepLineUpcoming,
                      ]}
                    />
                  )}
                </View>

                {/* Right content */}
                <View style={[styles.stepContentCol, !isLast && { paddingBottom: 22 }]}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCurrent && styles.stepTitleCurrent,
                        isUpcoming && styles.stepTitleUpcoming,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepTime,
                        isCurrent && styles.stepTimeCurrent,
                      ]}
                    >
                      {step.time}
                    </Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Booking Summary Box */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APPOINTMENT SUMMARY</Text>
          <Ionicons name="calendar-outline" size={16} color="#10B981" />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={styles.summaryLabel}>Scheduled:</Text>
            <Text style={styles.summaryValue}>{selectedDate} at {selectedTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="location-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{addressLine1}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.trackLiveBtn} onPress={handleTrackLive} activeOpacity={0.8}>
          <Ionicons name="navigate" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.trackLiveBtnText}>Track Professional Live</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <Text style={styles.homeBtnText}>Return to Home</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Success Banner
  successBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bookingIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookingIdLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    marginRight: 6,
  },
  bookingIdValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 1,
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodPillText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  transDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  transAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  downloadReceiptBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  downloadReceiptText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Assigned Pro Card
  proCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  proCardHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  proAvatarContainer: {
    width: 52,
    height: 52,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  proPhotoText: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
  },
  proInfo: {
    flex: 1,
  },
  proBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  proRating: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  proName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  proRole: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  callBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  msgBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Tracking Flow
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  trackingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackStepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: '#10B981',
  },
  stepIconCurrent: {
    backgroundColor: '#F59E0B',
  },
  stepIconUpcoming: {
    backgroundColor: '#E5E7EB',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepLineUpcoming: {
    backgroundColor: '#E5E7EB',
  },
  stepContentCol: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  stepTitleCurrent: {
    color: '#D97706',
  },
  stepTitleUpcoming: {
    color: '#6B7280',
  },
  stepTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepTimeCurrent: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  stepDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 6,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },

  // Action Buttons
  trackLiveBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  trackLiveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
});
