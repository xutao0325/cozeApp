import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import RNSSE from 'react-native-sse';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';

// Message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// SSE event type from react-native-sse
type SSEEvent = {
  data: string | null;
};

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const sseRef = useRef<RNSSE | null>(null);
  const streamingContentRef = useRef('');

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Generate unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Send message to backend SSE endpoint
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsStreaming(true);
    streamingContentRef.current = '';

    // Create assistant message placeholder
    const assistantMessageId = generateId();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }]);

    // Prepare messages for API (only content)
    const apiMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get backend URL
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

    // Close existing SSE connection
    if (sseRef.current) {
      sseRef.current.close();
    }

    // Create new SSE connection
    const url = `${backendUrl}/api/v1/chat`;
    sseRef.current = new RNSSE(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    // Listen for messages
    sseRef.current.addEventListener('message', (event: SSEEvent) => {
      const data = event.data;
      if (!data) return;

      if (data === '[DONE]') {
        // Stream finished
        setIsStreaming(false);
        setIsLoading(false);
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        ));
        if (sseRef.current) {
          sseRef.current.close();
        }
        return;
      }

      try {
        const parsed = JSON.parse(data);
        if (parsed.content) {
          streamingContentRef.current += parsed.content;
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: streamingContentRef.current }
              : msg
          ));
        }
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
      }
    });

    // Listen for errors
    sseRef.current.addEventListener('error', (error: any) => {
      console.error('SSE Error:', error);
      setIsStreaming(false);
      setIsLoading(false);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: '抱歉，发生了错误，请稍后重试。', isStreaming: false }
          : msg
      ));
    });
  }, [messages, isLoading]);

  // Handle send button press
  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
    }
  };

  // Handle suggestion press
  const handleSuggestionPress = (text: string) => {
    sendMessage(text);
  };

  // Render message bubble
  const renderMessage = useCallback((message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {message.isStreaming && !message.content ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={theme.primary} />
              <ThemedText variant="small" style={styles.typingText}>
                正在思考...
              </ThemedText>
            </View>
          ) : (
            <ThemedText
              variant="body"
              style={isUser ? styles.userMessageText : styles.assistantMessageText}
            >
              {message.content}
              {message.isStreaming && (
                <Animated.View style={{ width: 8, height: 16, backgroundColor: isUser ? theme.buttonPrimaryText : theme.textPrimary }} />
              )}
            </ThemedText>
          )}
        </View>
      </View>
    );
  }, [styles, theme]);

  const questionList = [
    { text: '什么是人工智能？' },
    { text: '什么是勾股定理？' },
    { text: '推荐几部好看的电影' },
  ];
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <FontAwesome6 name="robot" size={36} color={theme.primary} />
      </View>
      {/* <ThemedText variant="h3" style={styles.emptyTitle}>
        XT的demo
      </ThemedText> */}
      <ThemedText variant="body" color={theme.textSecondary} style={styles.emptySubtitle}>
        嗨，我是T，有不会的问题就问我吧！
      </ThemedText>
      <ThemedText variant="title" style={styles.suggestionTitle}>
        试试这些问题
      </ThemedText>
      <View style={styles.welcomeCard}>
        { questionList.map(item => {
          return (
            <TouchableOpacity
              key={Math.random()}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(item.text)}
            >
              <ThemedText variant="small" style={styles.suggestionText}>
                {item.text}
              </ThemedText>
            </TouchableOpacity>
          );
        }) }
      </View>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <ThemedView level="root" style={styles.header}>
          <ThemedText variant="h3" style={styles.headerTitle}>
            T，你身边的服务专家
          </ThemedText>
          <ThemedText variant="small" style={styles.headerSubtitle}>
            xt的智能助手
          </ThemedText>
        </ThemedView>

        {/* Messages List */}
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContent}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              renderEmptyState()
            ) : (
              messages.map(renderMessage)
            )}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="输入您的问题..."
              placeholderTextColor={theme.textMuted}
              multiline
              editable={!isLoading}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <FontAwesome6
                name="paper-plane"
                size={18}
                color={theme.buttonPrimaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
