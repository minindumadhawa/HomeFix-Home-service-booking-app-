import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { createBooking } from '../services/bookingService';

export default function CardPaymentScreen() {
  const params = useLocalSearchParams<{
    selectedDate?: string;
    selectedTime?: string;
    addressType?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressPhone?: string;
    landmarkInstruction?: string;
    issueDescription?: string;
    totalAmount?: string;
    providerId?: string;
    providerName?: string;
    serviceTitle?: string;
    category?: string;
  }>();

  const totalAmount = params.totalAmount || '2,320.00';

  const [cardHolder, setCardHolder] = useState('Nimali Perera');
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [expiryDate, setExpiryDate] = useState('08/28');
  const [cvv, setCvv] = useState('321');
  const [saveCard, setSaveCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleAuthenticateAndPay = async () => {
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardHolder.trim()) {
      Alert.alert('Incomplete Details', 'Please fill in all card details to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      const created = await createBooking({
        selectedDate: params.selectedDate || 'Thu, Oct 8, 2026',
        selectedTime: params.selectedTime || '10:30 AM',
        addressType: params.addressType || 'Home',
        addressLine1: params.addressLine1 || 'No 45/A, Temple Road',
        addressLine2: params.addressLine2 || 'Colombo 03',
        addressPhone: params.addressPhone || '+94 77 123 4567',
        landmarkInstruction: params.landmarkInstruction,
        issueDescription: params.issueDescription,
        totalAmount,
        paymentMethod: 'Credit / Debit Card',
        paymentStatus: 'Paid',
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4) || '7890',
        status: 'Upcoming',
        serviceTitle: params.serviceTitle || 'Electrical Safety & Circuit Audit',
        providerName: params.providerName || 'Nimal Silva',
        providerId: params.providerId || 'nimal-silva',
        category: params.category || 'Electrical',
      });

      setIsProcessing(false);
      router.push({
        pathname: '/booking-confirmation',
        params: {
          ...params,
          bookingId: created.id,
          status: 'paid',
          paymentMethod: 'Credit / Debit Card',
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4) || '7890',
          totalAmount,
        },
      });
    } catch (err) {
      setIsProcessing(false);
      console.error('Failed to create booking:', err);
      Alert.alert('Payment Error', 'Could not save booking. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Card Payment</Text>
          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={10} color="#059669" />
            <Text style={styles.secureBadgeText}>256-Bit SSL Encrypted</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Payable Summary Card */}
        <View style={styles.amountBanner}>
          <View>
            <Text style={styles.amountBannerLabel}>Total Payable Amount</Text>
            <Text style={styles.amountBannerSub}>Service: Electrical Works (Nimal Silva)</Text>
          </View>
          <Text style={styles.amountBannerPrice}>LKR {totalAmount}</Text>
        </View>

        {/* Visual Credit Card Preview (Dark Theme) */}
        <View style={styles.cardPreview}>
          <View style={styles.cardPreviewTop}>
            <View style={styles.cardChipContainer}>
              <View style={styles.cardChip} />
              <Ionicons name="wifi" size={18} color="#D1D5DB" style={{ marginLeft: 8 }} />
            </View>
            <Text style={styles.cardTypeBrand}>VISA</Text>
          </View>

          <Text style={styles.cardPreviewNumber}>
            {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
          </Text>

          <View style={styles.cardPreviewBottom}>
            <View>
              <Text style={styles.cardPreviewSmallLabel}>CARD HOLDER</Text>
              <Text style={styles.cardPreviewName} numberOfLines={1}>
                {cardHolder.toUpperCase() || 'YOUR NAME'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardPreviewSmallLabel}>EXPIRES</Text>
              <Text style={styles.cardPreviewExpiry}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* Card Input Form */}
        <View style={styles.formCard}>
          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Name as printed on card"
                placeholderTextColor="#9CA3AF"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CARD NUMBER</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="4532 •••• •••• ••••"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                maxLength={19}
              />
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            </View>
          </View>

          {/* Expiry Date and CVV Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>EXPIRY DATE</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  maxLength={5}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelWithInfo}>
                <Text style={styles.inputLabel}>CVV / CVC</Text>
                <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="3 digits"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Save card toggle */}
          <TouchableOpacity
            style={styles.saveCardRow}
            onPress={() => setSaveCard(!saveCard)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
              {saveCard && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.saveCardText}>Save card securely for future home bookings</Text>
          </TouchableOpacity>
        </View>

        {/* Security badges */}
        <View style={styles.securityBox}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.securityText}>PCI-DSS Level 1</Text>
          </View>
          <View style={styles.securityDivider} />
          <View style={styles.securityItem}>
            <Ionicons name="checkmark-done-circle" size={16} color="#10B981" />
            <Text style={styles.securityText}>Verified by Visa</Text>
          </View>
          <View style={styles.securityDivider} />
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={16} color="#10B981" />
            <Text style={styles.securityText}>Mastercard ID Check</Text>
          </View>
        </View>

        {/* Authenticate & Pay Button */}
        <TouchableOpacity
          style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
          onPress={handleAuthenticateAndPay}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator color="#FFF" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>Authenticating with Bank...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>Authenticate & Pay LKR {totalAmount}</Text>
            </>
          )}
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
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  secureBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  amountBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountBannerLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  amountBannerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  amountBannerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Dark Visual Credit Card
  cardPreview: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    height: 190,
    justifyContent: 'space-between',
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  cardTypeBrand: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  cardPreviewNumber: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewSmallLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardPreviewName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    maxWidth: 180,
  },
  cardPreviewExpiry: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Form
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  labelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  checkboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  saveCardText: {
    fontSize: 12,
    color: '#4B5563',
  },

  // Security badges
  securityBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 4,
  },
  securityDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#A7F3D0',
  },

  // Pay Button
  payBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnDisabled: {
    backgroundColor: '#6EE7B7',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
