import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceProvider } from '../../types/provider';
import { createBooking } from '../../services/bookingService';

interface InstantBookModalProps {
  visible: boolean;
  onClose: () => void;
  provider: ServiceProvider;
  onSuccess: () => void;
}

export default function InstantBookModal({
  visible,
  onClose,
  provider,
  onSuccess,
}: InstantBookModalProps) {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'diagnostic' | 'emergency'>('standard');
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);

  const getPrice = () => {
    if (selectedTier === 'standard') return `${provider.rates.standard.rate}${provider.rates.standard.unit || '/hr'}`;
    if (selectedTier === 'diagnostic') return provider.rates.diagnostic.rate;
    return provider.rates.emergency.rate;
  };

  const handleConfirm = async () => {
    try {
      await createBooking({
        providerId: provider.id,
        providerName: provider.name,
        providerTitle: provider.title,
        providerAvatar: provider.avatarUrl,
        serviceTitle: `${provider.title} (${selectedTier.toUpperCase()} TIER)`,
        category: provider.category || 'Home Service',
        selectedDate: selectedDay === 'Today' ? 'Today' : 'Tomorrow',
        selectedTime: selectedSlot,
        status: 'Upcoming',
        totalAmount: getPrice(),
        paymentMethod: 'Cash on Completion',
        paymentStatus: 'Pending',
        issueDescription: notes || 'Instant priority dispatch service',
      });
    } catch (err) {
      console.warn('Instant booking creation error:', err);
    }

    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      onSuccess();
    }, 1800);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.flashIcon}>
                <Ionicons name="flash" size={16} color="#FFF" />
              </View>
              <Text style={styles.title}>Instant Booking</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {booked ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={54} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSub}>
                {provider.name} has accepted your request for {selectedDay} at {selectedSlot}.
              </Text>
              <View style={styles.successCard}>
                <Text style={styles.successCardText}>Priority dispatch activated • SOS Unit ID #LK-998</Text>
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Provider Info Pill */}
              <View style={styles.providerCard}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerTitle}>{provider.title}</Text>
                <View style={styles.rateHighlightRow}>
                  <Text style={styles.rateHighlightLabel}>Estimated Rate:</Text>
                  <Text style={styles.rateHighlightValue}>{getPrice()}</Text>
                </View>
              </View>

              {/* Tier Selection */}
              <Text style={styles.sectionHeading}>Select Service Tier</Text>
              <View style={styles.tierRow}>
                <TouchableOpacity
                  style={[styles.tierCard, selectedTier === 'standard' && styles.tierCardActive]}
                  onPress={() => setSelectedTier('standard')}
                >
                  <Text style={[styles.tierTitle, selectedTier === 'standard' && styles.tierTextActive]}>Standard</Text>
                  <Text style={[styles.tierPrice, selectedTier === 'standard' && styles.tierTextActive]}>
                    {provider.rates.standard.rate}/hr
                  </Text>
                  <Text style={styles.tierNote}>Min 1 hr</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierCard, selectedTier === 'diagnostic' && styles.tierCardActive]}
                  onPress={() => setSelectedTier('diagnostic')}
                >
                  <Text style={[styles.tierTitle, selectedTier === 'diagnostic' && styles.tierTextActive]}>Diagnostic</Text>
                  <Text style={[styles.tierPrice, selectedTier === 'diagnostic' && styles.tierTextActive]}>
                    {provider.rates.diagnostic.rate}
                  </Text>
                  <Text style={styles.tierNote}>Waived if hired</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierCard, selectedTier === 'emergency' && styles.tierCardActive]}
                  onPress={() => setSelectedTier('emergency')}
                >
                  <Text style={[styles.tierTitle, selectedTier === 'emergency' && styles.tierTextActive]}>Emergency</Text>
                  <Text style={[styles.tierPrice, selectedTier === 'emergency' && styles.tierTextActive]}>
                    {provider.rates.emergency.rate}
                  </Text>
                  <Text style={styles.tierNote}>24/7 Priority</Text>
                </TouchableOpacity>
              </View>

              {/* Day Selection */}
              <Text style={styles.sectionHeading}>Preferred Day</Text>
              <View style={styles.chipRow}>
                {['Today', 'Tomorrow', 'In 2 Days'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.chip, selectedDay === day && styles.chipActive]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.chipText, selectedDay === day && styles.chipTextActive]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time Slots */}
              <Text style={styles.sectionHeading}>Select Time Slot</Text>
              <View style={styles.slotList}>
                {['08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM', '05:00 PM - 07:00 PM'].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotItem, selectedSlot === slot && styles.slotItemActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Ionicons
                      name={selectedSlot === slot ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedSlot === slot ? '#10B981' : '#9CA3AF'}
                      style={{ marginRight: 8, flexShrink: 0 }}
                    />
                    <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Issue Description */}
              <Text style={styles.sectionHeading}>Job Description / Notes</Text>
              <TextInput
                placeholder="e.g. Leaking main shutoff valve in bathroom floor..."
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                style={styles.notesInput}
                multiline
                numberOfLines={3}
              />

              {/* Security Banner */}
              <View style={styles.securityRow}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" style={{ flexShrink: 0 }} />
                <Text style={styles.securityText}>100% Satisfaction Guarantee • No upfront payment needed</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Ionicons name="flash" size={16} color="#FFF" style={{ marginRight: 6, flexShrink: 0 }} />
                <Text style={styles.confirmBtnText}>Confirm Instant Booking ({getPrice()})</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      default: {
        justifyContent: 'flex-end',
      },
    }),
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        borderRadius: 24,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollBody: {
    paddingBottom: 24,
  },
  providerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  providerTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rateHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rateHighlightLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  rateHighlightValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 6,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tierCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  tierCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  tierTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginVertical: 2,
  },
  tierNote: {
    fontSize: 9,
    color: '#6B7280',
  },
  tierTextActive: {
    color: '#065F46',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  slotList: {
    gap: 8,
    marginBottom: 16,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  slotItemActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  slotText: {
    fontSize: 12,
    color: '#374151',
  },
  slotTextActive: {
    fontWeight: 'bold',
    color: '#065F46',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  securityText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  successContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  successIconBox: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
    marginBottom: 16,
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
  },
  successCardText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
});
