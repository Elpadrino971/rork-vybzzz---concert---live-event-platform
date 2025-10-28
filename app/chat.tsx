import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useLanguage } from '@/hooks/language-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// CRITICAL SECURITY WARNING: API key should NEVER be in client-side code
// This key is exposed to all users and should be rotated immediately
// TODO: Move to environment variable (process.env.OPENAI_API_KEY) or use backend API
const OPENAI_API_KEY = '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';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I am your Vybzzz AI assistant. I can help you with questions about events, tickets, uploading videos, becoming an artist, and more. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestions = [
    t('chat.suggestions.howToUpload'),
    t('chat.suggestions.findEvents'),
    t('chat.suggestions.buyTickets'),
    t('chat.suggestions.becomeArtist'),
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for Vybzzz, a concert and live event platform. You help users with:
              - Finding and discovering live music events and concerts
              - Buying tickets and VIP passes
              - Uploading and sharing concert videos
              - Becoming verified artists on the platform
              - Using premium features and subscriptions
              - Navigating the app and its features
              - General questions about live music and events
              
              Keep responses helpful, friendly, and concise. Focus on Vybzzz-related topics.`,
            },
            {
              role: 'user',
              content: text.trim(),
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.choices[0].message.content.trim(),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble connecting right now. Please try again later or contact support for help.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    messagesContainer: {
      flex: 1,
      padding: 16,
    },
    messageContainer: {
      marginBottom: 16,
      maxWidth: '80%',
    },
    userMessageContainer: {
      alignSelf: 'flex-end',
    },
    aiMessageContainer: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      padding: 12,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiBubble: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
    },
    messageIcon: {
      marginRight: 8,
      marginTop: 2,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      flex: 1,
    },
    userMessageText: {
      color: colors.background,
    },
    aiMessageText: {
      color: colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'right',
    },
    userTimestamp: {
      textAlign: 'right',
    },
    aiTimestamp: {
      textAlign: 'left',
    },
    loadingContainer: {
      alignSelf: 'flex-start',
      maxWidth: '80%',
      marginBottom: 16,
    },
    loadingBubble: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    suggestionsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    suggestionButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
      maxHeight: 100,
    },
    sendButton: {
      marginLeft: 8,
      padding: 10,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chat.title')}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.messageIcon}>
                    <Bot size={16} color={colors.primary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.aiMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      message.isUser ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                  >
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                {message.isUser && (
                  <View style={styles.messageIcon}>
                    <User size={16} color={colors.background} />
                  </View>
                )}
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <Bot size={16} color={colors.primary} />
                <Text style={styles.loadingText}>{t('chat.thinking')}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length === 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(suggestion)}
                testID={`suggestion-${index}`}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            testID="message-input"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            testID="send-button"
          >
            <Send size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}