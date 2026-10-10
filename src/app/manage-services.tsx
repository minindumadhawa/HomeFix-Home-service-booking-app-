import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function ManageServicesScreen() {
  const { providerId } = useLocalSearchParams<{ providerId?: string }>();
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [standardRate, setStandardRate] = useState('');
  const [standardUnit, setStandardUnit] = useState('/hr');
  const [standardNote, setStandardNote] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [diagnosticRate, setDiagnosticRate] = useState('');
  const [diagnosticNote, setDiagnosticNote] = useState('');
  const [emergencyRate, setEmergencyRate] = useState('');
  const [emergencyNote, setEmergencyNote] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProviderData = async () => {
      let targetRef;
      if (providerId) {
        targetRef = doc(db, 'providers', String(providerId));
      } else if (auth.currentUser) {
        targetRef = doc(db, 'users', auth.currentUser.uid);
      }

      if (targetRef) {
        try {
          const userDoc = await getDoc(targetRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAbout(data.about || '');
            setJobRole(data.jobRole || '');
            setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''));
            
            if (data.rates) {
              setStandardRate(data.rates.standard?.rate || '');
              setStandardUnit(data.rates.standard?.unit || '/hr');
              setStandardNote(data.rates.standard?.note || '');
              
              setDiagnosticRate(data.rates.diagnostic?.rate || '');
              setDiagnosticNote(data.rates.diagnostic?.note || '');
              
              setEmergencyRate(data.rates.emergency?.rate || '');
              setEmergencyNote(data.rates.emergency?.note || '');
            }
          }
        } catch (error) {
          console.warn("Could not fetch provider details", error);
        }
      }
      setLoading(false);
    };

    fetchProviderData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const payload = {
        jobRole,
        about,
        skills: skillsArray,
        rates: {
          standard: { rate: standardRate, unit: standardUnit, note: standardNote },
          diagnostic: { rate: diagnosticRate, note: diagnosticNote },
          emergency: { rate: emergencyRate, note: emergencyNote }
        }
      };

      if (providerId) {
        await setDoc(doc(db, 'providers', String(providerId)), payload, { merge: true });
        Alert.alert('Success', 'Service details updated successfully');
        router.back();
      } else if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), payload);
        Alert.alert('Success', 'Service details updated successfully');
        router.back();
      }
    } catch (error) {
      console.error("Error updating service details:", error);
      Alert.alert('Error', 'Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services & Rates</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Role</Text>
            <TouchableOpacity 
              style={styles.inputContainer} 
              onPress={() => setShowRolePicker(true)}
            >
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <Text style={[styles.input, { marginTop: 15, color: jobRole ? '#111827' : '#9CA3AF' }]}>
                {jobRole || 'Select your main job role (e.g. Electrician)'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About / Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={styles.textArea}
                value={about}
                onChangeText={setAbout}
                placeholder="Tell customers about your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skills (comma separated)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="construct-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. Plumbing, Pipe Fitting, Water Heaters"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upfront Rates</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Standard Rate (e.g. Rs. 2,000)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={standardRate}
                onChangeText={setStandardRate}
                placeholder="Rs. 0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Standard Rate Unit (e.g. /hr or /job)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="time-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={standardUnit}
                onChangeText={setStandardUnit}
                placeholder="/hr"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Standard Rate Note (e.g. Min 1 hour)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={standardNote}
                onChangeText={setStandardNote}
                placeholder="Min 1 hour"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diagnostic Rate (e.g. Rs. 1,000)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={diagnosticRate}
                onChangeText={setDiagnosticRate}
                placeholder="Rs. 0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diagnostic Rate Note (e.g. Waived if hired)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={diagnosticNote}
                onChangeText={setDiagnosticNote}
                placeholder="Waived if hired"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Rate (e.g. Rs. 3,500)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="flash-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={emergencyRate}
                onChangeText={setEmergencyRate}
                placeholder="Rs. 0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Rate Note (e.g. 24/7 Priority)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={emergencyNote}
                onChangeText={setEmergencyNote}
                placeholder="24/7 Priority"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Details</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Job Role</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                'Electrician', 
                'Plumber', 
                'Carpenter', 
                'Cleaner', 
                'Painter', 
                'HVAC Technician', 
                'Handyman', 
                'Mason', 
                'Gardener', 
                'Pest Control', 
                'Appliance Repair'
              ].map((role) => (
                <TouchableOpacity 
                  key={role} 
                  style={styles.roleOption}
                  onPress={() => {
                    setJobRole(role);
                    setShowRolePicker(false);
                  }}
                >
                  <Text style={[
                    styles.roleOptionText,
                    jobRole === role && styles.roleOptionTextSelected
                  ]}>{role}</Text>
                  {jobRole === role && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    width: '100%',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#4B5563',
  },
  roleOptionTextSelected: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
});
