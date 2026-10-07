import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FilterScreen() {
  const [selectedSort, setSelectedSort] = useState('Recommended');
  const [selectedRating, setSelectedRating] = useState('4.5');
  const [selectedDistance, setSelectedDistance] = useState('5km');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.optionsGrid}>
            {['Recommended', 'Nearest First', 'Lowest Price', 'Highest Rated'].map((opt) => (
              <TouchableOpacity 
                key={opt} 
                style={[styles.optionBtn, selectedSort === opt && styles.optionBtnActive]}
                onPress={() => setSelectedSort(opt)}
              >
                <Text style={[styles.optionText, selectedSort === opt && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Minimum Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.optionsRow}>
            {['Any', '3.5', '4.0', '4.5', '5.0'].map((opt) => (
              <TouchableOpacity 
                key={opt} 
                style={[styles.circleBtn, selectedRating === opt && styles.circleBtnActive]}
                onPress={() => setSelectedRating(opt)}
              >
                {opt !== 'Any' && <Ionicons name="star" size={12} color={selectedRating === opt ? "#FFF" : "#FBBF24"} style={{marginRight: 2}} />}
                <Text style={[styles.circleText, selectedRating === opt && styles.circleTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Maximum Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Distance</Text>
          <View style={styles.optionsRow}>
            {['1km', '5km', '10km', 'Anywhere'].map((opt) => (
              <TouchableOpacity 
                key={opt} 
                style={[styles.optionBtn, selectedDistance === opt && styles.optionBtnActive]}
                onPress={() => setSelectedDistance(opt)}
              >
                <Text style={[styles.optionText, selectedDistance === opt && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pro Verification */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.sectionTitle}>HomeFix Verified Pros Only</Text>
              <Text style={styles.sectionSubtitle}>Only show professionals with verified background checks</Text>
            </View>
            <Ionicons name="toggle" size={40} color="#10B981" />
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearBtn} onPress={() => {
          setSelectedSort('Recommended');
          setSelectedRating('Any');
          setSelectedDistance('Anywhere');
        }}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={() => router.back()}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, paddingRight: 40 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10, marginBottom: 10 },
  optionBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  optionTextActive: { color: '#FFF' },
  optionsRow: { flexDirection: 'row', gap: 10 },
  circleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  circleBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  circleText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  circleTextActive: { color: '#FFF' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFF' },
  clearBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  clearText: { fontSize: 16, fontWeight: 'bold', color: '#6B7280' },
  applyBtn: { flex: 2, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16 },
  applyText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' }
});
