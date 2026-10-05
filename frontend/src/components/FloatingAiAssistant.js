import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme';
import { aiService } from '../services/aiService';
import { accountingService } from '../services/accountingService';
import { Badge } from './common/Badge';

export function FloatingAiAssistant({ onDataChanged }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya Asisten AI Keuangan AUBE TERRA. Saya dapat membantu menganalisis arus kas, memeriksa saldo rekening, maupun mencatat transaksi kas masuk dan keluar secara cerdas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Berapa saldo kas aktif saat ini?',
    'Ringkas arus kas bulan ini',
    'Tampilkan pengeluaran terbesar',
  ];

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiService.chat(text, historyPayload);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply || 'Data berhasil dianalisis.',
        tools: res.executed_tools || [],
        draftCard: res.draft_card || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If tools mutated data or performed actions, notify parent to refresh
      const hasMutatingTool = res.executed_tools?.some((t) => {
        const name = typeof t === 'string' ? t : (t?.tool || t?.name);
        return name === 'create_transaction' || name === 'update_transaction' || name === 'delete_transaction';
      });

      if (hasMutatingTool && onDataChanged) {
        onDataChanged();
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, terjadi kendala saat menghubungkan ke AI Backend. Silakan coba lagi.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmDraft = async (draft, msgId) => {
    try {
      setIsTyping(true);
      const payload = {
        date: draft.date || new Date().toISOString().split('T')[0],
        type: draft.type,
        amount: parseFloat(draft.amount),
        account_id: draft.account_id || 1,
        category_id: draft.category_id || 1,
        payment_method: draft.payment_method || 'Transfer Bank',
        description: draft.description || 'Transaksi via AI Assistant',
      };

      await accountingService.createTransaction(payload);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, draftSaved: true } : msg
        )
      );

      if (onDataChanged) {
        onDataChanged();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✓ Transaksi berhasil diverifikasi dan disimpan ke sistem pembukuan!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      alert(e.message || 'Gagal menyimpan transaksi dari draft AI.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCancelDraft = (msgId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, draftCancelled: true } : msg
      )
    );
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu terkait keuangan perusahaan?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* Expanded Popover Window */}
      {isOpen && (
        <View style={[styles.popoverCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.popoverHeader, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.sparkleBadge, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}>
                <Feather name="cpu" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.popoverTitle, { color: colors.textPrimary }]}>AI Assistant</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.onlineDot, { backgroundColor: colors.cashIn }]} />
                  <Text style={[styles.statusText, { color: colors.textMuted }]}>Gemini AI Online</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={handleResetChat}
                title="Reset Chat"
                activeOpacity={0.7}
              >
                <Feather name="rotate-ccw" size={13} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setIsOpen(false)}
                title="Tutup"
                activeOpacity={0.7}
              >
                <Feather name="x" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Prompts Bar */}
          <View style={[styles.quickPromptContainer, { borderBottomColor: colors.borderLight, backgroundColor: colors.surfaceSecondary }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickPrompts.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSend(q)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.promptChipText, { color: colors.primaryHover }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={[styles.chatScroll, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.userWrapper : styles.assistantWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: colors.primary }]
                        : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : [styles.assistantText, { color: colors.textPrimary }],
                      ]}
                    >
                      {m.content}
                    </Text>

                    {/* Tool executions */}
                    {m.tools && m.tools.length > 0 && (
                      <View style={styles.toolList}>
                        {m.tools.map((t, idx) => {
                          const toolLabel =
                            typeof t === 'string'
                              ? t
                              : (t?.tool || t?.name || 'Sistem');
                          return (
                            <View key={idx} style={[styles.toolBadge, { backgroundColor: colors.indigoBg, borderColor: colors.indigoBorder }]}>
                              <Text style={[styles.toolBadgeText, { color: colors.indigo }]}>⚡ Tool: {String(toolLabel)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Draft Card preview */}
                    {m.draftCard && (
                      <View style={[styles.draftBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <View style={styles.draftBoxHeader}>
                          <Text style={[styles.draftTitle, { color: colors.textPrimary }]}>📋 Draf Entri Transaksi</Text>
                          <Badge
                            label={m.draftCard.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                            variant={m.draftCard.type === 'cash_in' ? 'cash_in' : 'cash_out'}
                            size="sm"
                          />
                        </View>
                        <Text style={[styles.draftAmount, { color: colors.textPrimary }]}>
                          {m.draftCard.amount_formatted || `Rp ${Number(m.draftCard.amount || 0).toLocaleString('id-ID')}`}
                        </Text>
                        <Text style={[styles.draftDesc, { color: colors.textSecondary }]}>
                          {String(m.draftCard.description || 'Tanpa keterangan')}
                        </Text>
                        <Text style={[styles.draftMeta, { color: colors.textMuted }]}>
                          {m.draftCard.account_name ? `Rekening: ${m.draftCard.account_name} • ` : ''}
                          {m.draftCard.category_name ? `Kategori: ${m.draftCard.category_name} • ` : ''}
                          Metode: {String(m.draftCard.payment_method || 'Transfer Bank')}
                        </Text>

                        {!m.draftSaved && !m.draftCancelled && (
                          <View style={styles.draftActions}>
                            <TouchableOpacity
                              style={[styles.draftCancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                              onPress={() => handleCancelDraft(m.id)}
                            >
                              <Text style={[styles.draftCancelText, { color: colors.textSecondary }]}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.draftConfirmBtn, { backgroundColor: colors.cashIn }]}
                              onPress={() => handleConfirmDraft(m.draftCard, m.id)}
                            >
                              <Text style={styles.draftConfirmText}>✓ Simpan ke Buku</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {m.draftSaved && (
                          <Text style={[styles.draftStatusSaved, { color: colors.cashIn }]}>✓ Tersimpan di Database</Text>
                        )}
                        {m.draftCancelled && (
                          <Text style={[styles.draftStatusCancelled, { color: colors.textMuted }]}>✕ Draf dibatalkan</Text>
                        )}
                      </View>
                    )}

                    <Text style={[styles.timestampText, { color: colors.textLight }]}>{m.timestamp}</Text>
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.messageWrapper, styles.assistantWrapper]}>
                <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.typingText, { color: colors.textMuted }]}>Sedang memproses analisa...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Footer */}
          <View style={[styles.inputContainer, { borderTopColor: colors.borderLight, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Tanyakan keuangan atau perintahkan catat kas..."
              placeholderTextColor={colors.textLight}
              multiline={false}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary },
                (!inputMessage.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputMessage.trim() || isTyping}
              activeOpacity={0.8}
            >
              <Feather name="send" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.fabButton, { backgroundColor: colors.primary }, isOpen && { backgroundColor: colors.primaryHover }]}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <View style={styles.fabInner}>
          <Feather name="cpu" size={16} color="#ffffff" style={styles.fabIcon} />
          <Text style={styles.fabText}>{isOpen ? 'Tutup AI' : 'AI Assistant'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  fabButton: {
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...theme.shadows.fab,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabIcon: {
    marginRight: 8,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  popoverCard: {
    width: 420,
    height: 560,
    maxWidth: '92vw',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginBottom: 16,
    ...theme.shadows.lg,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  popoverHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  popoverTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  promptChip: {
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 14,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: theme.borderRadius.lg,
    padding: 12,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {},
  timestampText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  toolList: {
    marginTop: 8,
    gap: 4,
  },
  toolBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  toolBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  draftBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  draftBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  draftTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  draftAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  draftDesc: {
    fontSize: 12,
  },
  draftMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  draftCancelBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  draftCancelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  draftConfirmBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  draftConfirmText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  draftStatusSaved: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  draftStatusCancelled: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
