import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function LoginScreen() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!phoneOrEmail || !password) {
      setErrorMessage('Please enter your login details.');
      return;
    }
    
    setLoading(true);
    try {
      const cleanInput = phoneOrEmail.trim();
      const isEmail = cleanInput.includes('@');
      const authEmail = isEmail ? cleanInput : `${cleanInput.replace(/[^0-9]/g, '')}@homefix.local`;
      
      await signInWithEmailAndPassword(auth, authEmail, password);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      setErrorMessage('Invalid credentials or account does not exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="home" size={16} color="#FFF" />
            </View>
            <View>
              <Text style={styles.logoText}>HomeFix</Text>
              <Text style={styles.logoSubtitle}>PRO SERVICES</Text>
            </View>
          </View>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Access your account to manage service bookings.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Mobile Phone Number or Email</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="77 123 4567 or email" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputGroup}>
            <TextInput 
              style={[styles.input, {paddingLeft: 12}]} 
              placeholder="Password" 
              secureTextEntry 
              value={password}
              onChangeText={setPassword}
            />
            <Ionicons name="eye-outline" size={20} color="#6B7280" style={styles.rightIcon} />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
              <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={20} color={rememberMe ? "#10B981" : "#9CA3AF"} />
              <Text style={styles.checkboxText}>Remember Login</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage !== '' && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.loginBtnText}>LOG IN</Text>
              <View style={styles.loginIconBox}>
                <Ionicons name="arrow-forward" size={14} color="#10B981" />
              </View>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Ionicons name="logo-google" size={20} color="#EA4335" style={{marginRight: 10}} />
          <Text style={styles.googleBtnText}>Google SSO Authentication</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { backgroundColor: '#111827', padding: 8, borderRadius: 10, marginRight: 12 },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  logoSubtitle: { fontSize: 10, color: '#6B7280', fontWeight: 'bold' },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  profileInitials: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  card: { backgroundColor: '#E5E7EB', borderRadius: 20, padding: 20, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#111827', marginBottom: 8, marginTop: 12 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  leftIcon: { paddingLeft: 12 },
  rightIcon: { paddingHorizontal: 12 },
  input: { flex: 1, height: '100%', paddingLeft: 12, fontSize: 15, color: '#111827', fontWeight: '500' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkboxText: { fontSize: 13, color: '#374151', marginLeft: 8 },
  forgotText: { fontSize: 13, color: '#10B981', fontWeight: 'bold' },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 16, textAlign: 'center', paddingHorizontal: 16 },
  loginBtn: { backgroundColor: '#10B981', flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  loginIconBox: { backgroundColor: '#FFF', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#D1D5DB' },
  dividerText: { marginHorizontal: 12, fontSize: 11, color: '#6B7280', fontWeight: 'bold' },
  googleBtn: { backgroundColor: '#FFF', flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 40 },
  googleBtnText: { color: '#111827', fontSize: 15, fontWeight: 'bold' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { color: '#6B7280', fontSize: 14 },
  signupLink: { color: '#111827', fontSize: 14, fontWeight: 'bold' }
});
