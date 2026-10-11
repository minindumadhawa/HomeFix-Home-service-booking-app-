import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ServiceProvider } from '../../types/provider';

export interface ChatMessage {
  id: string;
  providerId: string;
  providerName: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  provider: ServiceProvider;
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export default function MessageModal({ visible, onClose, provider }: MessageModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Update (Edit) state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  const quickPrompts = [
    'Are you available for urgent service today?',
    'Can I get an upfront estimate for pipe repair?',
    'Do you bring all required replacement parts?',
    'What is your earliest availability this week?',
  ];

  const storageKey = `@homefix_messages_${provider?.id || 'default'}`;

  // Helper to persist to AsyncStorage
  const persistLocally = useCallback(async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch (err) {
      console.warn('AsyncStorage write error:', err);
    }
  }, [storageKey]);

  // READ: Load messages whenever modal opens
  useEffect(() => {
    if (!visible || !provider?.id) return;

    let isMounted = true;
    (async () => {
      setIsLoading(true);
      try {
        // 1. Read from local AsyncStorage cache
        const localData = await AsyncStorage.getItem(storageKey);
        let loadedMessages: ChatMessage[] = localData ? JSON.parse(localData) : [];

        if (isMounted && loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }

        // 2. Fetch from Firestore for syncing
        try {
          const q = query(
            collection(db, 'messages'),
            where('providerId', '==', provider.id)
          );
          const snap = await getDocs(q);

          if (!snap.empty && isMounted) {
            const firestoreList: ChatMessage[] = [];
            snap.forEach((docSnap) => {
              firestoreList.push(docSnap.data() as ChatMessage);
            });

            // Merge & deduplicate by ID
            const map = new Map<string, ChatMessage>();
            loadedMessages.forEach((m) => map.set(m.id, m));
            firestoreList.forEach((m) => map.set(m.id, m));

            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            setMessages(merged);
            await persistLocally(merged);
          }
        } catch (dbErr) {
          console.warn('Firestore messages fetch fallback to local:', dbErr);
        }
      } catch (err) {
        console.warn('Error loading messages:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [visible, provider?.id, storageKey, persistLocally]);

  // CREATE: Send a new message
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const currentUid = auth.currentUser?.uid || 'customer_user';
    const currentName = auth.currentUser?.displayName || 'Customer';

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      providerId: provider.id,
      providerName: provider.name,
      senderId: currentUid,
      senderName: currentName,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isEdited: false,
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    setInputText('');

    // Save to local storage
    await persistLocally(updated);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Sync to Firestore
    try {
      const docRef = doc(db, 'messages', newMessage.id);
      await setDoc(docRef, newMessage);
    } catch (err) {
      console.warn('Firestore message save failed, saved locally:', err);
    }
  };

  // UPDATE: Start editing an existing message
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text);
  };

  // UPDATE: Save edited message
  const handleSaveEdit = async () => {
    const trimmed = editingText.trim();
    if (!editingMessageId || !trimmed) return;

    const updated = messages.map((m) => {
      if (m.id === editingMessageId) {
        return {
          ...m,
          text: trimmed,
          isEdited: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMessages(updated);
    setEditingMessageId(null);
    setEditingText('');

    // Save locally
    await persistLocally(updated);

    // Sync update to Firestore
    try {
      const docRef = doc(db, 'messages', editingMessageId);
      await updateDoc(docRef, {
        text: trimmed,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore update failed, saved locally:', err);
    }
  };

  // UPDATE: Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  // DELETE: Delete a specific message
  const handleDeleteMessage = (messageId: string) => {
    const performDelete = async () => {
      const filtered = messages.filter((m) => m.id !== messageId);
      setMessages(filtered);

      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingText('');
      }

      // Update local storage
      await persistLocally(filtered);

      // Sync deletion to Firestore
      try {
        const docRef = doc(db, 'messages', messageId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore message deletion failed, removed locally:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this message?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // DELETE: Clear all messages in thread
  const handleClearAll = () => {
    const performClear = async () => {
      setMessages([]);
      setEditingMessageId(null);
      setEditingText('');
      await persistLocally([]);

      // Clean up in Firestore
      try {
        for (const m of messages) {
          const docRef = doc(db, 'messages', m.id);
          await deleteDoc(docRef);
        }
      } catch (err) {
        console.warn('Firestore clear-all failed, cleared locally:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Clear all messages with this specialist?')) {
        performClear();
      }
    } else {
      Alert.alert(
        'Clear Chat History',
        `Are you sure you want to delete all messages with ${provider.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: performClear },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarMini}>
                <Ionicons name="chatbubbles" size={16} color="#FFF" />
              </View>
              <View>
                <Text style={styles.title}>Message {provider.name}</Text>
                <View style={styles.activeRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.subtitle}>Typically responds in ~10 mins</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              {messages.length > 0 && (
                <TouchableOpacity
                  style={styles.clearHeaderBtn}
                  onPress={handleClearAll}
                  accessibilityLabel="Clear chat history"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Feed (READ & DISPLAY) */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingText}>Loading messages...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color="#10B981" />
                </View>
                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Ask {provider.name} about project quotes, parts needed, or schedule availability.
                </Text>

                {/* Quick Prompts */}
                <Text style={styles.quickPromptTitle}>Frequently Asked Questions</Text>
                <View style={styles.chipsContainer}>
                  {quickPrompts.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      style={styles.promptChip}
                      onPress={() => setInputText(prompt)}
                    >
                      <Ionicons
                        name="sparkles"
                        size={12}
                        color="#10B981"
                        style={{ marginRight: 4, flexShrink: 0 }}
                      />
                      <Text style={styles.promptText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.messagesList}>
                {messages.map((item) => {
                  const isEditingThis = editingMessageId === item.id;

                  return (
                    <View key={item.id} style={styles.messageCard}>
                      {isEditingThis ? (
                        /* UPDATE: Inline editing form */
                        <View style={styles.editCardBox}>
                          <View style={styles.editHeaderRow}>
                            <Ionicons name="pencil" size={14} color="#10B981" />
                            <Text style={styles.editHeading}>Edit Message</Text>
                          </View>
                          <TextInput
                            style={styles.inlineEditInput}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                            autoFocus
                          />
                          <View style={styles.editBtnRow}>
                            <TouchableOpacity
                              style={styles.cancelEditBtn}
                              onPress={handleCancelEdit}
                            >
                              <Text style={styles.cancelEditText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.saveEditBtn}
                              onPress={handleSaveEdit}
                            >
                              <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />
                              <Text style={styles.saveEditText}>Save Changes</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        /* READ: Standard message bubble with actions */
                        <View style={styles.bubbleContent}>
                          <View style={styles.bubbleTopRow}>
                            <View style={styles.senderInfoRow}>
                              <Text style={styles.senderLabel}>You</Text>
                              <Text style={styles.timestampText}>
                                • {formatMessageTime(item.createdAt)}
                              </Text>
                              {item.isEdited && (
                                <Text style={styles.editedTag}>(edited)</Text>
                              )}
                            </View>

                            {/* CRUD ACTIONS: Edit & Delete */}
                            <View style={styles.actionsRow}>
                              <TouchableOpacity
                                style={styles.actionIconBtn}
                                onPress={() => handleStartEdit(item)}
                                accessibilityLabel="Edit message"
                              >
                                <Ionicons name="create-outline" size={16} color="#6B7280" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.actionIconBtn, { marginLeft: 8 }]}
                                onPress={() => handleDeleteMessage(item.id)}
                                accessibilityLabel="Delete message"
                              >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <Text style={styles.messageBodyText}>{item.text}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts when messages exist */}
          {messages.length > 0 && !editingMessageId && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChips}
            >
              {quickPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.horizontalPromptChip}
                  onPress={() => setInputText(prompt)}
                >
                  <Ionicons name="sparkles" size={11} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* CREATE: Input & Send Bar */}
          {!editingMessageId && (
            <View style={styles.inputBarContainer}>
              <TextInput
                placeholder={`Message ${provider.name}...`}
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                style={styles.messageInput}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                disabled={!inputText.trim()}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.secureNotice}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#10B981" />
            <Text style={styles.secureText}>
              Direct communication protected by HomeFix Verified Pro policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 18,
    maxHeight: '90%',
    minHeight: 460,
    ...Platform.select({
      web: {
        maxWidth: 580,
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  clearHeaderBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollBody: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  quickPromptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promptText: {
    fontSize: 11,
    color: '#374151',
  },
  messagesList: {
    gap: 12,
  },
  messageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  bubbleContent: {
    gap: 6,
  },
  bubbleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  editedTag: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
  },
  messageBodyText: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  editCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#10B981',
    gap: 8,
  },
  editHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  inlineEditInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  cancelEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  saveEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  horizontalChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  horizontalPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  promptChipText: {
    fontSize: 11,
    color: '#4B5563',
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  secureText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
