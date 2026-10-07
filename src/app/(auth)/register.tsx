import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

  const handleRegister = async () => {
    setErrorMessage('');
    if (!phone || !password) {
      setErrorMessage('Please enter your mobile number and password.');
      return;
    }
    if (!agreed) {
      setErrorMessage('You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const authEmail = email.trim() !== '' ? email.trim() : `${cleanPhone}@homefix.local`;
      
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      
      // We successfully created the user in Firebase Auth!
      // (Temporarily skipping Firestore user data storage until database is enabled)
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      setErrorMessage(error.message || 'An error occurred during registration.');
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

        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={styles.badgeText}>CUSTOMER ACCOUNT</Text>
        </View>

        <Text style={styles.title}>Join HomeFix</Text>

        <View style={styles.card}>
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
            <Text style={styles.labelOptional}>optional</Text>
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput 
              style={[styles.input, {paddingLeft: 40}]} 
              placeholder="johnathan.perera@example.com" 
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
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  badgeText: { color: '#059669', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
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
