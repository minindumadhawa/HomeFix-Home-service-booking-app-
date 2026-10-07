import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('Upcoming');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.segmentBtn, activeTab === tab && styles.segmentBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segmentText, activeTab === tab && styles.segmentTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Upcoming' && (
          <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.dateText}>Tomorrow, 10:00 AM</Text>
              </View>
              <View style={[styles.statusBadge, {backgroundColor: '#D1FAE5'}]}>
                <Text style={[styles.statusText, {color: '#059669'}]}>Confirmed</Text>
              </View>
            </View>

            <Text style={styles.serviceTitle}>Whole-House Deep Clean</Text>
            <Text style={styles.servicePrice}>Rs. 8,500</Text>

            <View style={styles.proInfo}>
              <View style={styles.proAvatarContainer}>
                <Ionicons name="person" size={24} color="#9CA3AF" />
              </View>
              <View>
                <Text style={styles.proName}>Assigning Professional...</Text>
                <Text style={styles.proSubtitle}>HomeFix Team</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, {borderColor: '#FEE2E2', marginLeft: 12}]}>
                <Text style={[styles.outlineBtnText, {color: '#DC2626'}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'Completed' && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No past bookings</Text>
            <Text style={styles.emptyStateSub}>You haven't completed any services yet.</Text>
          </View>
        )}

        {activeTab === 'Cancelled' && (
          <View style={styles.emptyState}>
            <Ionicons name="close-circle-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No cancelled bookings</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  segmentBtnActive: { borderBottomColor: '#10B981' },
  segmentText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  segmentTextActive: { color: '#10B981', fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  bookingCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, color: '#4B5563', fontWeight: '600', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  servicePrice: { fontSize: 14, fontWeight: '600', color: '#10B981', marginBottom: 16 },
  proInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 16 },
  proAvatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  proName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  proSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardActions: { flexDirection: 'row' },
  outlineBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  outlineBtnText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});
