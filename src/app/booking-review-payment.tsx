import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { createBooking } from '../services/bookingService';

export default function BookingReviewPaymentScreen() {
  const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'Card' | 'KOKO' | 'LankaQR'>('Cash');
  const [isBooked, setIsBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useLocalSearchParams<{
    selectedDate?: string;
    selectedTime?: string;
    addressType?: string;
    addressLabel?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressPhone?: string;
    landmarkInstruction?: string;
    issueDescription?: string;
    attachedPhotosJson?: string;
    providerId?: string;
    providerName?: string;
    providerTitle?: string;
    serviceTitle?: string;
    totalAmount?: string;
    category?: string;
  }>();

  const selectedDate = params.selectedDate || 'Thu, Oct 8, 2026';
  const selectedTime = params.selectedTime || '10:30 AM';
  const addressType = params.addressType || 'Home';
  const addressLine1 = params.addressLine1 || 'No 45/A, Temple Road';
  const addressLine2 = params.addressLine2 || 'Colombo 03, Western Province';
  const addressPhone = params.addressPhone || '+94 77 123 4567';
  const landmarkInstruction = params.landmarkInstruction?.trim() || 'Opposite Supermarket, ring gate bell #2';
  const issueDescription = params.issueDescription?.trim() || 'Main circuit breaker trips when AC is turned on';

  let attachedPhotos: string[] = [];
  try {
    if (params.attachedPhotosJson) {
      attachedPhotos = JSON.parse(params.attachedPhotosJson);
    }
  } catch (e) {
    attachedPhotos = [];
  }

  if (attachedPhotos.length === 0) {
    attachedPhotos = [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop',
    ];
  }

  const handleConfirmAndBook = async () => {
    if (isSubmitting) return;

    const bookingPayload = {
      selectedDate,
      selectedTime,
      addressType,
      addressLine1,
      addressLine2,
      addressPhone,
      landmarkInstruction,
      issueDescription,
      totalAmount: params.totalAmount || '2,320.00',
      providerId: params.providerId || 'nimal-silva',
      providerName: params.providerName || 'Nimal Silva',
      providerTitle: params.providerTitle || 'Master Electrical Specialist',
      serviceTitle: params.serviceTitle || 'Electrical Safety & Circuit Audit',
      category: params.category || 'Electrical',
    };

    if (selectedPayment === 'Card') {
      // Directs to Card Payment details input page
      router.push({
        pathname: '/card-payment',
        params: bookingPayload,
      });
    } else {
      setIsSubmitting(true);
      try {
        const paymentMethodLabel =
          selectedPayment === 'Cash'
            ? 'Cash on Completion'
            : selectedPayment === 'KOKO'
            ? 'KOKO Payment (Pay in 3)'
            : 'LANKAQR / Online Banking';

        const created = await createBooking({
          ...bookingPayload,
          paymentMethod: paymentMethodLabel,
          paymentStatus: 'Pending',
          status: 'Upcoming',
          attachedPhotos,
        });

        // Directs directly to confirmation page (Cash, KOKO, LankaQR)
        router.push({
          pathname: '/booking-confirmation',
          params: {
            ...bookingPayload,
            bookingId: created.id,
            status: 'confirmed',
            paymentMethod: paymentMethodLabel,
          },
        });
      } catch (err) {
        console.error('Failed to create booking:', err);
        Alert.alert('Booking Error', 'Could not save booking details. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const paymentMethods = [
    {
      id: 'Cash',
      title: 'Cash on Completion',
      subtitle: 'Pay after service is performed and inspected',
      icon: 'cash-outline',
      badge: 'POPULAR',
    },
    {
      id: 'Card',
      title: 'Credit / Debit Card',
      subtitle: 'Visa, MasterCard, or Amex via secure gateway',
      icon: 'card-outline',
      badge: null,
    },
    {
      id: 'KOKO',
      title: 'KOKO Payment (Pay in 3)',
      subtitle: '3 interest-free installments of LKR 773.33',
      icon: 'pricetag-outline',
      badge: '0% INTEREST',
    },
    {
      id: 'LankaQR',
      title: 'LANKAQR / Online Banking',
      subtitle: 'Instant mobile app QR code transfer',
      icon: 'qr-code-outline',
      badge: null,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Review & Payment</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 3 of 3</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Professional Details Card (Dark Styling) */}
        <View style={styles.proCard}>
          <View style={styles.proCardHeader}>
            <View style={styles.proAvatarContainer}>
              <Ionicons name="person" size={28} color="#9CA3AF" />
              <Text style={styles.proPhotoText}>PRO PHOTO</Text>
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proBadgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
                <Text style={styles.proRating}>
                  <Ionicons name="star" size={12} color="#FBBF24" /> 4.8{' '}
                  <Text style={styles.proReviews}>(94 reviews)</Text>
                </Text>
              </View>
              <Text style={styles.proName}>Nimal Silva Electrical Works</Text>
              <Text style={styles.proRate}>
                Fixed Rate: LKR 1,800/hr <Text style={styles.proDot}>•</Text>
              </Text>
              <Text style={styles.proDistance}>
                <Ionicons name="location" size={12} color="#9CA3AF" /> 3.1 km away
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Booking & Schedule Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BOOKING DETAILS</Text>
          <Ionicons name="calendar-outline" size={18} color="#10B981" />
        </View>

        <View style={styles.cardContainer}>
          {/* Date & Time */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={18} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date & Time Slot</Text>
              <Text style={styles.detailValue}>{selectedDate} at {selectedTime}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Service Address */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={addressType === 'Work' ? 'briefcase' : addressType === 'Custom' ? 'location' : 'home'}
                size={18}
                color="#10B981"
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Service Location ({addressType})</Text>
              <Text style={styles.detailValue}>{addressLine1}</Text>
              {addressLine2 ? <Text style={styles.detailSubValue}>{addressLine2}</Text> : null}
              {addressPhone ? <Text style={styles.detailPhone}>Contact: {addressPhone}</Text> : null}
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Special Landmark */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="navigate" size={18} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Special Landmark / Gate Info</Text>
              <Text style={styles.detailValue}>{landmarkInstruction}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Issue Description */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={18} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Described Issue</Text>
              <Text style={styles.detailValue}>{issueDescription}</Text>
            </View>
          </View>

          {/* Attached photos */}
          {attachedPhotos.length > 0 && (
            <View style={styles.attachedPhotosRow}>
              <Text style={styles.photosLabel}>Attached Photos ({attachedPhotos.length}):</Text>
              <View style={styles.photoContainer}>
                {attachedPhotos.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.photoThumb} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Section 3: Cost Breakdown (All in LKR) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>COST BREAKDOWN</Text>
          <Ionicons name="receipt-outline" size={18} color="#10B981" />
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Initial Hourly Service Charge</Text>
            <Text style={styles.priceValue}>LKR 1,800.00</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceWithTooltip}>
              <Text style={styles.priceLabel}>Platform & Safety Assurance Fee</Text>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.priceValue}>LKR 250.00</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Standard Government Tax (15% VAT)</Text>
            <Text style={styles.priceValue}>LKR 270.00</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalPriceRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalSubtext}>(Includes all taxes & platform fees)</Text>
            </View>
            <Text style={styles.totalValue}>LKR 2,320.00</Text>
          </View>
        </View>

        {/* Section 4: Select Payment Method */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
          <Ionicons name="wallet-outline" size={18} color="#10B981" />
        </View>

        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentMethodCard, isSelected && styles.paymentMethodCardActive]}
                onPress={() => setSelectedPayment(method.id as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.paymentIconBox, isSelected && styles.paymentIconBoxActive]}>
                  <Ionicons
                    name={method.icon as any}
                    size={22}
                    color={isSelected ? '#FFF' : '#4B5563'}
                  />
                </View>

                <View style={styles.paymentMethodInfo}>
                  <View style={styles.paymentTitleRow}>
                    <Text style={[styles.paymentMethodTitle, isSelected && styles.paymentMethodTitleActive]}>
                      {method.title}
                    </Text>
                    {method.badge && (
                      <View style={[styles.methodBadge, isSelected && styles.methodBadgeActive]}>
                        <Text style={[styles.methodBadgeText, isSelected && styles.methodBadgeTextActive]}>{method.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.paymentMethodSubtitle, isSelected && styles.paymentMethodSubtitleActive]}>
                    {method.subtitle}
                  </Text>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cancellation policy guarantee */}
        <View style={styles.policyBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#059669" style={{ marginRight: 8 }} />
          <Text style={styles.policyText}>
            Free cancellation up to 2 hours before the booking time. 100% satisfaction guaranteed.
          </Text>
        </View>

        {/* Confirm & Book Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomTotalLabel}>Total Amount</Text>
            <Text style={styles.bottomTotalAmount}>LKR 2,320.00</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmAndBook}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>Confirm & Book</Text>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
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
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  stepBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Professional Card (Dark Theme)
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
  },
  proAvatarContainer: {
    width: 60,
    height: 60,
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
    color: '#FBBF24',
  },
  proReviews: {
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  proName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  proRate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  proDot: {
    color: '#6B7280',
  },
  proDistance: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },

  // Details Container Cards
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  detailSubValue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  detailPhone: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  attachedPhotosRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  photosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  photoContainer: {
    flexDirection: 'row',
  },
  photoThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Cost Breakdown
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceWithTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Payment Methods
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  paymentMethodCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentMethodTitleActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  paymentMethodSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentMethodSubtitleActive: {
    color: '#E6FFFA',
    fontWeight: '500',
  },
  methodBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  methodBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: '#FFF',
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  methodBadgeTextActive: {
    color: '#FFF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },

  // Policy Guarantee
  policyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  policyText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },

  // Bottom Confirmation Bar
  bottomBar: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  bottomTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
