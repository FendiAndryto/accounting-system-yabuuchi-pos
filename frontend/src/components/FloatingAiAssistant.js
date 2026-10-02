import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors, theme } from '../theme';
import { aiService } from '../services/aiService';
import { accountingService } from '../services/accountingService';
import { Badge } from './common/Badge';

export function FloatingAiAssistant({ onDataChanged }) {
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
      if (res.executed_tools?.length > 0 && onDataChanged) {
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
        <View style={styles.popoverCard}>
          {/* Header */}
          <View style={styles.popoverHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.sparkleBadge}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
              <View>
                <Text style={styles.popoverTitle}>AI Assistant</Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>Gemini AI Online</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleResetChat}
                title="Reset Chat"
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsOpen(false)}
                title="Tutup"
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Prompts Bar */}
          <View style={styles.quickPromptContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickPrompts.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => handleSend(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.promptChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
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
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {m.content}
                    </Text>

                    {/* Tool executions */}
                    {m.tools && m.tools.length > 0 && (
                      <View style={styles.toolList}>
                        {m.tools.map((t, idx) => (
                          <View key={idx} style={styles.toolBadge}>
                            <Text style={styles.toolBadgeText}>⚡ Tool: {t.name || t}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Draft Card preview */}
                    {m.draftCard && (
                      <View style={styles.draftBox}>
                        <View style={styles.draftBoxHeader}>
                          <Text style={styles.draftTitle}>📋 Draf Entri Transaksi</Text>
                          <Badge
                            label={m.draftCard.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                            variant={m.draftCard.type === 'cash_in' ? 'cash_in' : 'cash_out'}
                            size="sm"
                          />
                        </View>
                        <Text style={styles.draftAmount}>
                          Rp {Number(m.draftCard.amount || 0).toLocaleString('id-ID')}
                        </Text>
                        <Text style={styles.draftDesc}>
                          {m.draftCard.description || 'Tanpa keterangan'}
                        </Text>
                        <Text style={styles.draftMeta}>
                          Metode: {m.draftCard.payment_method || 'Transfer Bank'}
                        </Text>

                        {!m.draftSaved && !m.draftCancelled && (
                          <View style={styles.draftActions}>
                            <TouchableOpacity
                              style={styles.draftCancelBtn}
                              onPress={() => handleCancelDraft(m.id)}
                            >
                              <Text style={styles.draftCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.draftConfirmBtn}
                              onPress={() => handleConfirmDraft(m.draftCard, m.id)}
                            >
                              <Text style={styles.draftConfirmText}>✓ Simpan ke Buku</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {m.draftSaved && (
                          <Text style={styles.draftStatusSaved}>✓ Tersimpan di Database</Text>
                        )}
                        {m.draftCancelled && (
                          <Text style={styles.draftStatusCancelled}>✕ Draf dibatalkan</Text>
                        )}
                      </View>
                    )}

                    <Text style={styles.timestampText}>{m.timestamp}</Text>
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.messageWrapper, styles.assistantWrapper]}>
                <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.typingText}>Sedang memproses analisa...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Footer */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
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
                (!inputMessage.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputMessage.trim() || isTyping}
              activeOpacity={0.8}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.fabButton, isOpen && styles.fabButtonActive]}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>✨</Text>
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
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...theme.shadows.fab,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  fabButtonActive: {
    backgroundColor: colors.primaryHover,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 16,
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
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...theme.shadows.lg,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  popoverHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sparkleText: {
    fontSize: 16,
  },
  popoverTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
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
    backgroundColor: colors.cashIn,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: colors.textMuted,
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
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickPromptContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceSecondary,
  },
  promptChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  promptChipText: {
    fontSize: 11,
    color: colors.primaryHover,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#fafbfc',
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
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: colors.textPrimary,
  },
  timestampText: {
    fontSize: 10,
    color: colors.textLight,
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
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  toolList: {
    marginTop: 8,
    gap: 4,
  },
  toolBadge: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  toolBadgeText: {
    fontSize: 11,
    color: colors.indigo,
    fontWeight: '600',
  },
  draftBox: {
    marginTop: 10,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  draftAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  draftDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  draftMeta: {
    fontSize: 11,
    color: colors.textMuted,
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  draftCancelText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  draftConfirmBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.cashIn,
  },
  draftConfirmText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  draftStatusSaved: {
    fontSize: 11,
    color: colors.cashIn,
    fontWeight: '700',
    marginTop: 8,
  },
  draftStatusCancelled: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});
