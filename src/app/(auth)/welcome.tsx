import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="home" size={16} color="#FFF" />
          </View>
          <Text style={styles.logoText}>HOMEFIX</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
          <Text style={styles.verifiedText}>VERIFIED PROS</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.circleBg} />
          <View style={styles.iconBox}>
            <Ionicons name="create-outline" size={40} color="#FFF" />
          </View>
          <View style={styles.fastHelpBadge}>
            <View style={styles.fastHelpDot} />
            <Text style={styles.fastHelpText}>FAST HELP</Text>
          </View>
          <View style={styles.lightningBadge}>
            <Ionicons name="flash" size={16} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Instant & Trusted{'\n'}Home Repairs</Text>
        <Text style={styles.subtitle}>Connect with verified technicians and master{'\n'}tradespeople in minutes.</Text>

        {/* Features */}
        <View style={styles.featureList}>
          <FeatureCard 
            icon="checkmark" 
            title="Upfront Transparent Pricing" 
            desc="Fixed upfront rates with zero surprise fees"
            badge="Guaranteed"
          />
          <FeatureCard 
            icon="shield-checkmark" 
            title="Vetted & Certified Experts" 
            desc="Thoroughly background-checked technicians"
            badge="Top Rated"
          />
          <FeatureCard 
            icon="time" 
            title="24/7 Rapid Emergency Response" 
            desc="At your doorstep in as quick as 30 mins"
            badge="< 30m"
          />
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.btnText}>GET STARTED NOW</Text>
          <View style={styles.btnIconContainer}>
            <Ionicons name="arrow-forward" size={16} color="#10B981" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, desc, badge }: any) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconBox}>
        <Ionicons name={icon} size={20} color="#FFF" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
      <View style={styles.featureBadge}>
        <Text style={styles.featureBadgeText}>{badge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { backgroundColor: '#111827', padding: 6, borderRadius: 8, marginRight: 8 },
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  verifiedBadge: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  illustrationContainer: { position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  circleBg: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: '#E5E7EB' },
  iconBox: { backgroundColor: '#111827', width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  fastHelpBadge: { position: 'absolute', bottom: -5, backgroundColor: '#111827', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: '#F9FAFB' },
  fastHelpDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  fastHelpText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  lightningBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#10B981', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F9FAFB' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  featureList: { width: '100%', marginBottom: 20 },
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  featureIconBox: { backgroundColor: '#10B981', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: '#6B7280', paddingRight: 10 },
  featureBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featureBadgeText: { color: '#059669', fontSize: 10, fontWeight: 'bold' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  dotActive: { width: 16, backgroundColor: '#10B981' },
  footer: { padding: 20, paddingBottom: 40 },
  btn: { backgroundColor: '#10B981', flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 12 },
  btnIconContainer: { backgroundColor: '#FFF', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#10B981', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }
});
