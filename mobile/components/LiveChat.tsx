import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

interface LiveChatProps {
  eventId: string;
}

export default function LiveChat({ eventId }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [eventId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles:user_id (
            display_name
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setMessages(data.reverse() as ChatMessage[]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Fetch the full message with profile info
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              id,
              user_id,
              message,
              created_at,
              profiles:user_id (
                display_name
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as ChatMessage]);
            // Auto-scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        event_id: eventId,
        user_id: user.id,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.user_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage && styles.ownMessageContainer,
        ]}
      >
        <View
          style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}
        >
          {!isOwnMessage && (
            <Text style={styles.senderName}>
              {item.profiles?.display_name || 'Anonyme'}
            </Text>
          )}
          <Text
            style={[styles.messageText, isOwnMessage && styles.ownMessageText]}
          >
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Envoyer un message..."
          placeholderTextColor="#A0AEC0"
          value={newMessage}
          onChangeText={setNewMessage}
          editable={!sending}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  messagesList: {
    padding: 12,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
  },
  ownMessageBubble: {
    backgroundColor: '#FF6B35',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#2D3748',
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A202C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
