import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BookProfessionalScreen() {
  // Dynamic date strip state
  const [datesList, setDatesList] = useState([
    { dayName: 'Today', dayNum: '7', month: 'Oct', fullDate: 'Wed, Oct 7', rawDay: 7 },
    { dayName: 'Tomorrow', dayNum: '8', month: 'Oct', fullDate: 'Thu, Oct 8', rawDay: 8 },
    { dayName: 'Thu', dayNum: '9', month: 'Oct', fullDate: 'Fri, Oct 9', rawDay: 9 },
    { dayName: 'Fri', dayNum: '10', month: 'Oct', fullDate: 'Sat, Oct 10', rawDay: 10 },
    { dayName: 'Sat', dayNum: '11', month: 'Oct', fullDate: 'Sun, Oct 11', rawDay: 11 },
    { dayName: 'Sun', dayNum: '12', month: 'Oct', fullDate: 'Mon, Oct 12', rawDay: 12 },
  ]);

  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default Tomorrow (Oct 8)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calSelectedDay, setCalSelectedDay] = useState(8); // Default 8th

  const timeSlots = [
    { id: '1', time: '09:00 AM', period: 'Morning' },
    { id: '2', time: '10:30 AM', period: 'Morning' },
    { id: '3', time: '01:00 PM', period: 'Afternoon' },
    { id: '4', time: '03:00 PM', period: 'Afternoon' },
    { id: '5', time: '05:30 PM', period: 'Evening' },
    { id: '6', time: '07:00 PM', period: 'Evening' },
  ];

  // Calendar logic for October 2026 (Current Date: Oct 7, 2026)
  const currentMonthName = 'October 2026';
  const todayDay = 7; // October 7 is Today
  const totalDaysInMonth = 31;
  // October 1, 2026 starts on Thursday (index 4: Sun 0, Mon 1, Tue 2, Wed 3, Thu 4)
  const startDayOffset = 4;

  const calendarDays = [];
  // Empty offset slots
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ dayNumber: null, isPast: false });
  }
  // Days of month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarDays.push({
      dayNumber: day,
      isPast: day < todayDay, // Past dates disabled
    });
  }

  // Handle selecting any date from the Calendar Modal
  const handleSelectCalDate = (dayNum: number) => {
    setCalSelectedDay(dayNum);

    // Check if dayNum already exists in date cards list
    const existingIdx = datesList.findIndex((d) => d.rawDay === dayNum);

    if (existingIdx !== -1) {
      setSelectedDateIndex(existingIdx);
    } else {
      // Dynamically add the selected date to the cards strip so it is displayed and highlighted!
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Oct 1, 2026 is Thursday (4) -> Oct N day of week = (4 + N - 1) % 7
      const dayOfWeekStr = dayNames[(4 + dayNum - 1) % 7];
      
      const newItem = {
        dayName: dayOfWeekStr,
        dayNum: String(dayNum),
        month: 'Oct',
        fullDate: `${dayOfWeekStr}, Oct ${dayNum}`,
        rawDay: dayNum,
      };

      const updatedList = [...datesList, newItem].sort((a, b) => a.rawDay - b.rawDay);
      setDatesList(updatedList);

      const newIdx = updatedList.findIndex((d) => d.rawDay === dayNum);
      setSelectedDateIndex(newIdx);
    }

    setIsCalendarOpen(false);
  };

  const getDisplayDate = () => {
    const selectedItem = datesList[selectedDateIndex];
    if (!selectedItem) return 'Oct 8';
    return `${selectedItem.dayName}, Oct ${selectedItem.dayNum}`;
  };

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
        
        {/* Professional Details Card (Dark Styling) */}
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
                  <Ionicons name="star" size={12} color="#FBBF24" /> 4.8 <Text style={styles.proReviews}>(94 reviews)</Text>
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
          <TouchableOpacity 
            style={styles.calendarIconBtn} 
            onPress={() => setIsCalendarOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color="#10B981" />
            <Text style={styles.calendarBtnLabel}>Calendar View</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll} contentContainerStyle={styles.datesContainer}>
          {datesList.map((item, index) => {
            const isSelected = selectedDateIndex === index;
            return (
              <TouchableOpacity
                key={item.rawDay}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => {
                  setSelectedDateIndex(index);
                  setCalSelectedDay(item.rawDay);
                }}
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
            <Text style={styles.summaryValue}>{getDisplayDate()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Time:</Text>
            <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueBtn} 
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: '/booking-address-details',
            params: {
              selectedDate: getDisplayDate(),
              selectedTime: selectedTimeSlot,
            },
          })}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

      </ScrollView>

      {/* Full Month Calendar Modal */}
      <Modal
        visible={isCalendarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsCalendarOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Booking Date</Text>
              <TouchableOpacity onPress={() => setIsCalendarOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Month Control */}
            <View style={styles.monthHeader}>
              <TouchableOpacity style={styles.monthNavBtn}>
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{currentMonthName}</Text>
              <TouchableOpacity style={styles.monthNavBtn}>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View style={styles.weekDaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <Text key={idx} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (item.dayNumber === null) {
                  return <View key={index} style={styles.daySlotEmpty} />;
                }

                const isPast = item.isPast;
                const isSelected = calSelectedDay === item.dayNumber;

                return (
                  <TouchableOpacity
                    key={index}
                    disabled={isPast}
                    style={[
                      styles.daySlot,
                      isPast && styles.daySlotPast,
                      isSelected && styles.daySlotSelected,
                    ]}
                    onPress={() => handleSelectCalDate(item.dayNumber!)}
                  >
                    <Text
                      style={[
                        styles.daySlotText,
                        isPast && styles.daySlotTextPast,
                        isSelected && styles.daySlotTextSelected,
                      ]}
                    >
                      {item.dayNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Footer Tip */}
            <View style={styles.modalFooter}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Selected</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                  <Text style={styles.legendText}>Past (Disabled)</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
  calendarIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  calendarBtnLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 4,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavBtn: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  weekDayText: {
    width: '14%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  daySlotEmpty: {
    width: '14%',
    height: 40,
  },
  daySlot: {
    width: '14%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 6,
  },
  daySlotPast: {
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  daySlotSelected: {
    backgroundColor: '#10B981',
  },
  daySlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  daySlotTextPast: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  daySlotTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
