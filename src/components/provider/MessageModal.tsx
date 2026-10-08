import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceProvider } from '../../types/provider';

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  provider: ServiceProvider;
}

export default function MessageModal({ visible, onClose, provider }: MessageModalProps) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const quickPrompts = [
    'Are you available for urgent service today?',
    'Can I get an upfront estimate for pipe repair?',
    'Do you bring all required replacement parts?',
    'What is your earliest availability this week?',
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      onClose();
    }, 1600);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarMini}>
                <Ionicons name="chatbubbles" size={16} color="#FFF" />
              </View>
              <View>
                <Text style={styles.title}>Message {provider.name}</Text>
                <Text style={styles.subtitle}>Typically responds within 10 minutes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View style={styles.sentContainer}>
              <Ionicons name="checkmark-done-circle" size={54} color="#10B981" />
              <Text style={styles.sentTitle}>Message Sent!</Text>
              <Text style={styles.sentSub}>
                {provider.name} has been notified via instant SMS and the HomeFix PRO dashboard.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Quick Prompt Chips */}
              <Text style={styles.quickPromptTitle}>Quick Inquiries</Text>
              <View style={styles.chipsContainer}>
                {quickPrompts.map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    style={styles.promptChip}
                    onPress={() => setMessage(prompt)}
                  >
                    <Ionicons name="sparkles" size={12} color="#10B981" style={{ marginRight: 4, flexShrink: 0 }} />
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Message Input */}
              <Text style={styles.inputTitle}>Your Message</Text>
              <TextInput
                placeholder="Write your message here... Describe the problem or ask for clarification."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />

              <View style={styles.secureNotice}>
                <Ionicons name="lock-closed-outline" size={14} color="#6B7280" style={{ flexShrink: 0 }} />
                <Text style={styles.secureText}>Phone number and personal contact protected by HomeFix Privacy Policy</Text>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                disabled={!message.trim()}
                onPress={handleSend}
              >
                <Ionicons name="send" size={16} color="#FFF" style={{ marginRight: 6, flexShrink: 0 }} />
                <Text style={styles.sendBtnText}>Send Message</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      default: {
        justifyContent: 'flex-end',
      },
    }),
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    ...Platform.select({
      web: {
        maxWidth: 560,
        alignSelf: 'center',
        width: '100%',
        borderRadius: 24,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollBody: {
    paddingBottom: 20,
  },
  quickPromptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptText: {
    fontSize: 11,
    color: '#374151',
  },
  inputTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 12,
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  secureText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  sendBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  sendBtnDisabled: {
    backgroundColor: '#A7F3D0',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sentContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  sentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  sentSub: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
