import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const technicianPhone = '+94771234567';

export default function TrackProfessionalScreen() {
  const params = useLocalSearchParams<{
    bookingId?: string;
    selectedDate?: string;
    selectedTime?: string;
    addressLine1?: string;
    addressLine2?: string;
    issueDescription?: string;
  }>();
  const [isOpeningMap, setIsOpeningMap] = useState(false);

  const address = [params.addressLine1, params.addressLine2, 'Sri Lanka']
    .filter(Boolean)
    .join(', ');

  const handleCallProfessional = async () => {
    try {
      await Linking.openURL(`tel:${technicianPhone}`);
    } catch (error) {
      console.error('Unable to open the phone app for the professional.', error);
      Alert.alert('Unable to call', 'Please try calling the professional again.');
    }
  };

  const handleOpenDirections = async () => {
    if (!address) {
      Alert.alert('Address unavailable', 'This booking does not include a service address.');
      return;
    }

    setIsOpeningMap(true);
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Unable to open directions for the service address.', error);
      Alert.alert('Unable to open maps', 'Please try opening directions again.');
    } finally {
      setIsOpeningMap(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityLabel="Back to booking confirmation"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Tracking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bookingCard}>
          <View style={styles.bookingHeading}>
            <View style={styles.bookingIcon}>
              <Ionicons name="construct-outline" size={20} color="#059669" />
            </View>
            <View style={styles.bookingDetails}>
              <Text style={styles.cardEyebrow}>BOOKING {params.bookingId || '#HF-89421'}</Text>
              <Text style={styles.issueTitle}>{params.issueDescription || 'Home service appointment'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={17} color="#059669" />
            <Text style={styles.metaText}>
              {params.selectedDate || 'Date to be confirmed'} at {params.selectedTime || 'Time to be confirmed'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={17} color="#059669" />
            <Text style={styles.metaText}>{address || 'Service address unavailable'}</Text>
          </View>
        </View>

        <View style={styles.professionalCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#065F46" />
          </View>
          <View style={styles.professionalDetails}>
            <Text style={styles.professionalName}>Nimal Silva</Text>
            <Text style={styles.professionalRole}>Assigned professional</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Booking confirmed</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallProfessional}
            activeOpacity={0.8}
            accessibilityLabel="Call professional"
          >
            <Ionicons name="call" size={19} color="#059669" />
          </TouchableOpacity>
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Ionicons name="information-circle-outline" size={20} color="#92400E" />
          </View>
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>Live GPS is not connected</Text>
            <Text style={styles.noticeText}>
              This booking currently has no technician location feed, so live position and arrival updates are unavailable. You can call the professional or open directions to your service address.
            </Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.mapPreview}>
            <View style={styles.mapRoadHorizontal} />
            <View style={styles.mapRoadVertical} />
            <View style={styles.mapRoadDiagonal} />
            <View style={styles.mapPin}>
              <Ionicons name="home" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.mapLabel}>
              <Ionicons name="location" size={13} color="#059669" />
              <Text style={styles.mapLabelText}>Service address</Text>
            </View>
          </View>
          <Text style={styles.locationTitle}>Your service location</Text>
          <Text style={styles.locationAddress}>{address || 'No address was provided for this booking.'}</Text>
          <TouchableOpacity
            style={[styles.directionsButton, isOpeningMap && styles.buttonDisabled]}
            onPress={handleOpenDirections}
            disabled={isOpeningMap}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>
              {isOpeningMap ? 'Opening Maps…' : 'Get Directions'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.returnButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.returnButtonText}>Return to Booking</Text>
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
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 38,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  bookingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  bookingDetails: {
    flex: 1,
  },
  cardEyebrow: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  issueTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 9,
  },
  metaText: {
    color: '#4B5563',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  professionalRole: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  noticeIcon: {
    marginRight: 10,
    paddingTop: 1,
  },
  noticeBody: {
    flex: 1,
  },
  noticeTitle: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  noticeText: {
    color: '#78350F',
    fontSize: 12,
    lineHeight: 18,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  mapPreview: {
    height: 170,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#E7F0E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  mapRoadHorizontal: {
    position: 'absolute',
    width: '120%',
    height: 18,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-12deg' }],
  },
  mapRoadVertical: {
    position: 'absolute',
    width: 15,
    height: '130%',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '24deg' }],
  },
  mapRoadDiagonal: {
    position: 'absolute',
    width: '110%',
    height: 8,
    backgroundColor: '#D1D5DB',
    transform: [{ rotate: '32deg' }],
  },
  mapPin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  mapLabelText: {
    color: '#374151',
    fontSize: 10,
    fontWeight: '700',
  },
  locationTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  locationAddress: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  directionsButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  returnButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  returnButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
});
