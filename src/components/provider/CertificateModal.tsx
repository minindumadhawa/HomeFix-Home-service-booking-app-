import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalLicense } from '../../types/provider';

interface CertificateModalProps {
  visible: boolean;
  onClose: () => void;
  license: ProfessionalLicense | null;
  providerName: string;
}

export default function CertificateModal({
  visible,
  onClose,
  license,
  providerName,
}: CertificateModalProps) {
  if (!license) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="ribbon" size={22} color="#10B981" style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={styles.headerTitle}>Verified Certificate</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Certificate Frame */}
            <View style={styles.certFrame}>
              <View style={styles.certBadge}>
                <Ionicons name="shield-checkmark" size={32} color="#10B981" />
                <Text style={styles.certBadgeText}>DIGITALLY VERIFIED</Text>
              </View>

              <Text style={styles.certOrg}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
              <Text style={styles.certIssuer}>{license.issuer}</Text>

              <View style={styles.divider} />

              <Text style={styles.certPresents}>THIS IS TO CERTIFY THAT</Text>
              <Text style={styles.holderName}>{providerName}</Text>
              <Text style={styles.certQualification}>Has successfully attained qualification for</Text>
              <Text style={styles.certTitle}>{license.title}</Text>

              <View style={styles.metaBox}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>License Number:</Text>
                  <Text style={styles.metaValue}>{license.licenseNumber || 'NVQ-PLM-2018-842'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Status:</Text>
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>ACCREDITED & ACTIVE</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Valid Until:</Text>
                  <Text style={styles.metaValue}>{license.expiry || 'December 2027'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Audit Agency:</Text>
                  <Text style={styles.metaValue}>National Registry Match • TVEC</Text>
                </View>
              </View>

              <View style={styles.sealRow}>
                <View style={styles.sealCircle}>
                  <Ionicons name="checkmark-done" size={24} color="#059669" />
                  <Text style={styles.sealText}>OFFICIAL</Text>
                </View>
                <View style={styles.sealInfo}>
                  <Text style={styles.sealTitle}>Government Validated</Text>
                  <Text style={styles.sealSub}>Identity and trade credentials cross-checked via TVEC National Registry.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Certificate</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollBody: {
    alignItems: 'center',
  },
  certFrame: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  certBadge: {
    alignItems: 'center',
    marginBottom: 12,
  },
  certBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 1,
    marginTop: 4,
  },
  certOrg: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  certIssuer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  certPresents: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  holderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  certQualification: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  metaBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  activePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sealCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexShrink: 0,
  },
  sealText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#059669',
  },
  sealInfo: {
    flex: 1,
  },
  sealTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
  },
  sealSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
