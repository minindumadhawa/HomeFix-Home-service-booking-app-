import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function ProfileScreen() {
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role) setRole(data.role);
            if (data.phone) setPhone(data.phone);
          }
        } catch (error) {
          console.warn("Could not fetch user profile", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  const isProvider = role === 'provider';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarInitials}>JD</Text>
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>John Doe</Text>
            {isProvider && <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{marginLeft: 4}} />}
          </View>
          <Text style={styles.userPhone}>{phone}</Text>
          {isProvider && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>VERIFIED PRO</Text>
            </View>
          )}
        </View>

        {isProvider && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statValue}>Rs. 45K</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxBorder]}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statValue}><Ionicons name="star" size={14} color="#FBBF24" /> 4.9</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Jobs</Text>
              <Text style={styles.statValue}>24</Text>
            </View>
          </View>
        )}

        {/* Dynamic Settings Groups based on Role */}
        {isProvider ? (
          <>
            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>PROFESSIONAL DASHBOARD</Text>
              <View style={styles.settingsCard}>
                <SettingItem icon="wallet-outline" title="Bank Account & Payouts" />
                <SettingItem icon="calendar-outline" title="Availability Schedule" />
                <SettingItem icon="construct-outline" title="Manage Services & Rates" />
                <SettingItem icon="document-text-outline" title="Verification Documents" isLast />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>ACCOUNT SETTINGS</Text>
              <View style={styles.settingsCard}>
                <SettingItem icon="location-outline" title="Manage Addresses" />
                <SettingItem icon="card-outline" title="Payment Methods" />
                <SettingItem icon="notifications-outline" title="Notifications" />
                <SettingItem icon="shield-checkmark-outline" title="Privacy & Security" isLast />
              </View>
            </View>
          </>
        )}

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>SUPPORT & ABOUT</Text>
          <View style={styles.settingsCard}>
            <SettingItem icon="help-circle-outline" title="Help Center" />
            <SettingItem icon="document-text-outline" title="Terms & Conditions" />
            <SettingItem icon="information-circle-outline" title="About HomeFix" isLast />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{marginRight: 8}} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon, title, isLast }: any) {
  return (
    <TouchableOpacity style={[styles.settingItem, !isLast && styles.settingItemBorder]}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={22} color="#4B5563" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarInitials: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F3F4F6' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  userPhone: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  proBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  proBadgeText: { color: '#059669', fontSize: 10, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statBoxBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  settingsGroup: { marginBottom: 24 },
  groupTitle: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 12, marginLeft: 12, letterSpacing: 0.5 },
  settingsCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16 },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { marginRight: 12 },
  settingTitle: { fontSize: 15, color: '#111827', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', paddingVertical: 16, borderRadius: 16, marginBottom: 24 },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },
  versionText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF' }
});
