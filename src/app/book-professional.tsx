import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BookProfessionalScreen() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to Tomorrow
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');

  const dates = [
    { dayName: 'Today', dayNum: '7', month: 'Oct' },
    { dayName: 'Tomorrow', dayNum: '8', month: 'Oct' },
    { dayName: 'Thu', dayNum: '9', month: 'Oct' },
    { dayName: 'Fri', dayNum: '10', month: 'Oct' },
    { dayName: 'Sat', dayNum: '11', month: 'Oct' },
    { dayName: 'Sun', dayNum: '12', month: 'Oct' },
  ];

  const timeSlots = [
    { id: '1', time: '09:00 AM', period: 'Morning' },
    { id: '2', time: '10:30 AM', period: 'Morning' },
    { id: '3', time: '01:00 PM', period: 'Afternoon' },
    { id: '4', time: '03:00 PM', period: 'Afternoon' },
    { id: '5', time: '05:30 PM', period: 'Evening' },
    { id: '6', time: '07:00 PM', period: 'Evening' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 1 of 3</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Professional Details Card */}
        <View style={styles.proCard}>
          <View style={styles.proCardHeader}>
            <View style={styles.proAvatarContainer}>
              <Ionicons name="person" size={30} color="#9CA3AF" />
              <Text style={styles.proPhotoText}>PRO PHOTO</Text>
            </View>
            <View style={styles.proInfo}>
              <View style={styles.proBadgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
                <Text style={styles.proRating}>
                  <Ionicons name="star" size={12} color="#F59E0B" /> 4.8 <Text style={styles.proReviews}>(94 reviews)</Text>
                </Text>
              </View>
              <Text style={styles.proName}>Nimal Silva Electrical Works</Text>
              <Text style={styles.proRate}>Fixed Rate: Rs. 1,800/hr <Text style={styles.proDot}>•</Text></Text>
              <Text style={styles.proDistance}>
                <Ionicons name="location" size={12} color="#9CA3AF" /> 3.1 km away
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Select Date */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECT DATE</Text>
          <Ionicons name="calendar-outline" size={18} color="#10B981" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll} contentContainerStyle={styles.datesContainer}>
          {dates.map((item, index) => {
            const isSelected = selectedDateIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDateIndex(index)}
              >
                <Text style={[styles.dayName, isSelected && styles.dateTextActive]}>{item.dayName}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dateTextActive]}>{item.dayNum}</Text>
                <Text style={[styles.monthText, isSelected && styles.dateTextActive]}>{item.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section 2: Select Time Slot */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECT TIME SLOT</Text>
          <Ionicons name="time-outline" size={18} color="#10B981" />
        </View>

        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot.time;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[styles.timeCard, isSelected && styles.timeCardActive]}
                onPress={() => setSelectedTimeSlot(slot.time)}
              >
                <Ionicons name="time" size={16} color={isSelected ? '#10B981' : '#6B7280'} style={{ marginBottom: 4 }} />
                <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>{slot.time}</Text>
                <Text style={styles.periodText}>{slot.period}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Booking Summary Box */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Appointment Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Professional:</Text>
            <Text style={styles.summaryValue}>Nimal Silva</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Date:</Text>
            <Text style={styles.summaryValue}>{dates[selectedDateIndex].dayName}, Oct {dates[selectedDateIndex].dayNum}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Time:</Text>
            <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
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
  proCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  proCardHeader: {
    flexDirection: 'row',
  },
  proAvatarContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proPhotoText: {
    fontSize: 8,
    color: '#6B7280',
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
    color: '#D97706',
  },
  proReviews: {
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  proName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  proRate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  proDot: {
    color: '#9CA3AF',
  },
  proDistance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  datesScroll: {
    marginBottom: 20,
  },
  datesContainer: {
    paddingRight: 16,
  },
  dateCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginRight: 10,
    width: 72,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCardActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dayName: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  monthText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateTextActive: {
    color: '#FFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '31%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  timeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  timeTextActive: {
    color: '#10B981',
  },
  periodText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  continueBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  continueText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
