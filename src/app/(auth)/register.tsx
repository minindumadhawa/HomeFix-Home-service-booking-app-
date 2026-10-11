import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState<'customer' | 'provider' | 'admin'>('customer'); // 'customer', 'provider', or 'admin'
  const [adminPasscode, setAdminPasscode] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    // Validation
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!phone && !email) {
      setErrorMessage('Please enter either a mobile number or email address.');
      return;
    }

    if (role === 'admin') {
      const code = adminPasscode.trim().toLowerCase();
      if (code !== 'admin123' && code !== 'homefix_admin' && code !== 'admin') {
        setErrorMessage('Invalid Admin Passcode. Use "admin123" to register as Admin.');
        return;
      }
    }

    if (!agreed) {
      setErrorMessage('You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const authEmail = email.trim() !== '' ? email.trim() : `${cleanPhone || 'user'}@homefix.local`;
      
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      
      // Save the user's selected role to Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          phone: cleanPhone ? '+94' + cleanPhone : '',
          email: authEmail,
          role: role,
          displayName: role === 'admin' ? 'System Administrator' : undefined,
          createdAt: new Date().toISOString()
        });
      } catch (dbError) {
        console.warn("Firestore error (did you enable it?): ", dbError);
        // Continue anyway so they are logged in locally
      }
      
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'provider') {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      let userMsg = error.message || 'An error occurred during registration.';
      if (error.code === 'auth/email-already-in-use') {
        userMsg = 'This email or phone account already exists. Please Sign In.';
      } else if (error.code === 'auth/invalid-email') {
        userMsg = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        userMsg = 'Password is too weak. Please use at least 6 characters.';
      }
      setErrorMessage(userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={20} color="#FFF" />
          </View>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]} 
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'provider' && styles.roleBtnActive]} 
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.roleText, role === 'provider' && styles.roleTextActive]}>Provider</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'admin' && styles.roleBtnActiveAdmin]} 
            onPress={() => setRole('admin')}
          >
            <Ionicons name="shield-checkmark" size={13} color={role === 'admin' ? '#FFF' : '#6B7280'} style={{ marginRight: 4 }} />
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {role === 'admin' ? 'Admin Portal Registration' : 'Join HomeFix'}
        </Text>

        <View style={styles.card}>
          {role === 'admin' && (
            <View style={styles.adminNoticeBox}>
              <View style={styles.adminNoticeHeader}>
                <Ionicons name="shield-half" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.adminNoticeTitle}>Administrator Authorization</Text>
              </View>
              <Text style={styles.adminNoticeSub}>
                Authorized personnel only. Enter Master Security Passcode to register. (Default: <Text style={{fontWeight: 'bold', color: '#111827'}}>admin123</Text>)
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={[styles.label, { color: '#DC2626', marginTop: 0, marginBottom: 0 }]}>ADMIN PASSCODE</Text>
                <TouchableOpacity onPress={() => setAdminPasscode('admin123')}>
                  <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: 'bold', textDecorationLine: 'underline' }}>
                    Auto-fill (admin123)
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { borderColor: '#FECACA', borderWidth: 1, marginTop: 8 }]}>
                <Ionicons name="key-outline" size={18} color="#DC2626" style={styles.leftIcon} />
                <TextInput 
                  style={[styles.input, { paddingLeft: 40 }]} 
                  placeholder="Enter Passcode (e.g. admin123)" 
                  secureTextEntry 
                  value={adminPasscode}
                  onChangeText={setAdminPasscode}
                />
              </View>
            </View>
          )}

          <Text style={styles.label}>MOBILE PHONE NUMBER</Text>
          <View style={styles.inputGroup}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>LK +94</Text>
              <Ionicons name="chevron-down" size={14} color="#6B7280" />
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="77 123 4567" 
              keyboardType="phone-pad" 
              value={phone}
              onChangeText={setPhone}
            />
            {phone.length > 8 && <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.inputIcon} />}
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <Text style={styles.labelOptional}>{role === 'admin' ? 'required for admin' : 'optional'}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput 
              style={[styles.input, {paddingLeft: 40}]} 
              placeholder="admin@homefix.lk" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput 
              style={[styles.input, {paddingLeft: 40}]} 
              placeholder="SuperSecure123!" 
              secureTextEntry 
              value={password}
              onChangeText={setPassword}
            />
            <Ionicons name="eye-off-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)}>
            <Ionicons name={agreed ? "checkmark-circle" : "ellipse-outline"} size={24} color={agreed ? "#10B981" : "#9CA3AF"} />
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.btnText}>CREATE ACCOUNT</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" style={{marginLeft: 8}} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  roleContainer: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexDirection: 'row' },
  roleBtnActive: { backgroundColor: '#10B981' },
  roleBtnActiveAdmin: { backgroundColor: '#DC2626' },
  roleText: { fontSize: 13, fontWeight: 'bold', color: '#6B7280' },
  roleTextActive: { color: '#FFF' },
  adminNoticeBox: { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  adminNoticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  adminNoticeTitle: { fontSize: 13, fontWeight: 'bold', color: '#DC2626' },
  adminNoticeSub: { fontSize: 12, color: '#4B5563', lineHeight: 17 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 40 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8, marginTop: 16 },
  labelOptional: { fontSize: 12, color: '#9CA3AF', marginBottom: 8, marginTop: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, height: 50 },
  prefixBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  prefixText: { fontSize: 14, fontWeight: '600', color: '#111827', marginRight: 4 },
  input: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 15, color: '#111827' },
  inputIcon: { paddingHorizontal: 12 },
  leftIcon: { position: 'absolute', left: 12, zIndex: 1 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 24 },
  checkboxText: { flex: 1, fontSize: 13, color: '#4B5563', marginLeft: 10, lineHeight: 20 },
  link: { color: '#111827', textDecorationLine: 'underline', fontWeight: '500' },
  btn: { backgroundColor: '#10B981', flexDirection: 'row', height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#10B981', fontSize: 14, fontWeight: 'bold' }
});
