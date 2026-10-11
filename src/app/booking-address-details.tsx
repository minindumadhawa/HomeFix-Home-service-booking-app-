import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookingAddressDetailsScreen() {
  const params = useLocalSearchParams<{
    selectedDate?: string;
    selectedTime?: string;
    providerId?: string;
    providerName?: string;
    providerTitle?: string;
    serviceTitle?: string;
    totalAmount?: string;
    category?: string;
  }>();

  const selectedDate = params.selectedDate || 'Thu, Oct 8';
  const selectedTime = params.selectedTime || '10:30 AM';

  const [selectedAddressType, setSelectedAddressType] = useState<'Home' | 'Work' | 'New'>('Home');
  const [landmarkInstruction, setLandmarkInstruction] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop',
  ]);

  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  const addresses = {
    Home: {
      label: 'Home Address',
      line1: 'No 45/A, Temple Road',
      line2: 'Colombo 03, Western Province',
      phone: '+94 77 123 4567',
    },
    Work: {
      label: 'Work / Office Address',
      line1: 'Level 12, World Trade Center',
      line2: 'Echelon Square, Colombo 01',
      phone: '+94 71 987 6543',
    },
    New: {
      label: 'Custom Service Address',
      line1: customStreet || 'Enter street address below',
      line2: customCity || 'Enter city / suburb below',
      phone: customPhone || '',
    },
  };

  const handleAddSamplePhoto = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=200&auto=format&fit=crop',
    ];
    const nextPhoto = sampleImages[attachedPhotos.length % sampleImages.length];
    setAttachedPhotos([...attachedPhotos, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = attachedPhotos.filter((_, i) => i !== index);
    setAttachedPhotos(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Location & Details</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 2 of 3</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Section 1: Select Service Address */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECT SERVICE ADDRESS</Text>
          <Ionicons name="location-outline" size={18} color="#10B981" />
        </View>

        {/* Address Type Tabs */}
        <View style={styles.addressTabRow}>
          {(['Home', 'Work', 'New'] as const).map((type) => {
            const isSelected = selectedAddressType === type;
            let iconName: any = 'home-outline';
            if (type === 'Work') iconName = 'briefcase-outline';
            if (type === 'New') iconName = 'add-circle-outline';

            return (
              <TouchableOpacity
                key={type}
                style={[styles.addressTabBtn, isSelected && styles.addressTabBtnActive]}
                onPress={() => setSelectedAddressType(type)}
              >
                <Ionicons name={iconName} size={16} color={isSelected ? '#FFF' : '#374151'} style={{ marginRight: 6 }} />
                <Text style={[styles.addressTabText, isSelected && styles.addressTabTextActive]}>
                  {type === 'New' ? '+ Custom' : type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Address Detail Card (Dark Theme) */}
        <View style={styles.addressCard}>
          <View style={styles.addressCardHeader}>
            <View style={styles.addressIconBox}>
              <Ionicons
                name={selectedAddressType === 'Work' ? 'briefcase' : selectedAddressType === 'New' ? 'location' : 'home'}
                size={20}
                color="#10B981"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>{addresses[selectedAddressType].label}</Text>
              <Text style={styles.addressLine1}>{addresses[selectedAddressType].line1}</Text>
              <Text style={styles.addressLine2}>{addresses[selectedAddressType].line2}</Text>
              {addresses[selectedAddressType].phone !== '' && (
                <Text style={styles.addressPhone}>Contact: {addresses[selectedAddressType].phone}</Text>
              )}
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          </View>
        </View>

        {/* Custom Address Input Form (Shown when + Custom is selected) */}
        {selectedAddressType === 'New' && (
          <View style={styles.customAddressCard}>
            <View style={styles.customFormHeader}>
              <Ionicons name="create-outline" size={18} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.customFormTitle}>Enter New Custom Address</Text>
            </View>

            <View style={styles.customInputGroup}>
              <Text style={styles.inputLabel}>Street Address / House No.</Text>
              <TextInput
                placeholder="e.g. No 15/3, Station Road"
                placeholderTextColor="#9CA3AF"
                style={styles.customTextInput}
                value={customStreet}
                onChangeText={setCustomStreet}
              />
            </View>

            <View style={styles.customInputGroup}>
              <Text style={styles.inputLabel}>City / Suburb</Text>
              <TextInput
                placeholder="e.g. Nugegoda, Colombo"
                placeholderTextColor="#9CA3AF"
                style={styles.customTextInput}
                value={customCity}
                onChangeText={setCustomCity}
              />
            </View>

            <View style={styles.customInputGroup}>
              <Text style={styles.inputLabel}>Contact Phone Number</Text>
              <TextInput
                placeholder="e.g. +94 77 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.customTextInput}
                value={customPhone}
                onChangeText={setCustomPhone}
              />
            </View>
          </View>
        )}

        {/* Section 2: Special Landmark & Gate Instructions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SPECIAL LANDMARK / GATE INSTRUCTIONS</Text>
          <Ionicons name="navigate-outline" size={18} color="#10B981" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="e.g. Opposite Supermarket, ring gate bell #2"
            placeholderTextColor="#9CA3AF"
            style={styles.textInputSingle}
            value={landmarkInstruction}
            onChangeText={setLandmarkInstruction}
          />
        </View>

        {/* Section 3: Describe Issue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DESCRIBE YOUR NEED OR ISSUE</Text>
          <Ionicons name="document-text-outline" size={18} color="#10B981" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Describe the issue or requirements (e.g., Main circuit breaker trips when AC is turned on...)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            style={styles.textInputMulti}
            value={issueDescription}
            onChangeText={setIssueDescription}
          />
        </View>

        {/* Section 4: Attach Photos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ATTACH PHOTOS OF ISSUE (OPTIONAL)</Text>
          <Ionicons name="camera-outline" size={18} color="#10B981" />
        </View>

        <View style={styles.photoRow}>
          {attachedPhotos.map((uri, idx) => (
            <View key={idx} style={styles.photoThumbnailContainer}>
              <Image source={{ uri }} style={styles.photoThumbnail} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => handleRemovePhoto(idx)}>
                <Ionicons name="close" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddSamplePhoto} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={24} color="#10B981" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Review & Proceed to Payment Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.8}
          onPress={() => {
            const currentAddress = addresses[selectedAddressType];
            router.push({
              pathname: '/booking-review-payment',
              params: {
                selectedDate,
                selectedTime,
                addressType: selectedAddressType === 'New' ? 'Custom' : selectedAddressType,
                addressLabel: currentAddress.label,
                addressLine1: currentAddress.line1,
                addressLine2: currentAddress.line2,
                addressPhone: currentAddress.phone,
                landmarkInstruction,
                issueDescription,
                attachedPhotosJson: JSON.stringify(attachedPhotos),
                providerId: params.providerId,
                providerName: params.providerName,
                providerTitle: params.providerTitle,
                serviceTitle: params.serviceTitle,
                totalAmount: params.totalAmount,
                category: params.category,
              },
            });
          }}
        >
          <Text style={styles.continueText}>Review & Proceed to Payment</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  addressTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressTabBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  addressTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  addressTabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  addressLine1: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  addressLine2: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInputSingle: {
    fontSize: 13,
    color: '#111827',
  },
  textInputMulti: {
    fontSize: 13,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  photoThumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 10,
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
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
  customAddressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  customFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customFormTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  customInputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  customTextInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
});
