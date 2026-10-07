import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function ProfileScreen() {
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert("Error", "Could not log out.");
    }
  };

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
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userPhone}>+94 77 123 4567</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>ACCOUNT SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingItem icon="location-outline" title="Manage Addresses" />
            <SettingItem icon="card-outline" title="Payment Methods" />
            <SettingItem icon="notifications-outline" title="Notifications" />
            <SettingItem icon="shield-checkmark-outline" title="Privacy & Security" isLast />
          </View>
        </View>

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
  profileHeader: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarInitials: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F3F4F6' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  userPhone: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  editProfileBtn: { backgroundColor: '#E5E7EB', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editProfileText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
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
