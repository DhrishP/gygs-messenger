import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getMessages, deleteMessage, markMessageSeen, WS_URL } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: Props) {
  const { conversationId, userId, isGroup } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    setupWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    if (isGroup && route.params.participants) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert('Group Members', route.params.participants?.join(', ') || '');
            }}
            style={{ padding: 8 }}
          >
            <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>
              👥 {route.params.participants?.length || 0}
            </Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isGroup, route.params.participants]);

  const loadMessages = async () => {
    try {
      const data = await getMessages(conversationId);
      const visibleMsgs = data.filter((m: any) => !m.deleted_for.includes(userId));
      setMessages(visibleMsgs);
      
      visibleMsgs.forEach((m: any) => {
        if (!m.seen_by.includes(userId) && m.sender !== userId) {
          markMessageSeen(m.id, userId);
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    ws.current = new WebSocket(`${WS_URL}/${conversationId}/`);
    
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new_message') {
        const newMsg = {
          id: data.message_id,
          content: data.message,
          sender: data.sender_id,
          timestamp: data.timestamp,
          seen_by: [],
          deleted_for: []
        };
        setMessages(prev => [...prev, newMsg]);
        
        if (data.sender_id !== userId) {
          markMessageSeen(data.message_id, userId);
        }
      }
    };
  };

  const sendMessage = () => {
    if (!inputText.trim() || !ws.current) return;
    
    ws.current.send(JSON.stringify({
      action: 'send_message',
      message: inputText.trim(),
      sender_id: userId
    }));
    
    setInputText('');
  };

  const handleDelete = (messageId: string, senderId: string) => {
    Alert.alert("Message Options", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete for me", onPress: async () => {
          await deleteMessage(messageId, userId, false);
          setMessages(prev => prev.filter(m => m.id !== messageId));
      }},
      ...(senderId === userId ? [{
        text: "Delete for everyone", style: 'destructive' as any, onPress: async () => {
          await deleteMessage(messageId, userId, true);
          setMessages(prev => prev.filter(m => m.id !== messageId));
        }
      }] : [])
    ]);
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.sender === userId;
    const isSeen = item.seen_by.length > 0;
    
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.otherBubbleWrapper]}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onLongPress={() => handleDelete(item.id, item.sender)}
          style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}
        >
          {isGroup && !isMe && (
            <Text style={styles.senderName}>{item.sender}</Text>
          )}
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={[styles.metaText, isMe ? styles.myMetaText : styles.otherMetaText]}>
              {formatTime(item.timestamp)}
            </Text>
            {isMe && (
              <Text style={[styles.tickText, isSeen && styles.seenTick]}>
                {isSeen ? "✓✓" : "✓"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={[styles.skeletonBubble, i % 2 === 0 ? styles.skeletonMyBubble : styles.skeletonOtherBubble]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      >
        {loading ? (
          renderSkeleton()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: '#FFF' }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#666"
              multiline
              keyboardAppearance="dark"
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  keyboardView: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 10 },
  bubbleWrapper: { width: '100%', marginBottom: 16 },
  myBubbleWrapper: { alignItems: 'flex-end' },
  otherBubbleWrapper: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '80%', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  myBubble: { 
    backgroundColor: '#6366F1', 
    borderBottomRightRadius: 4 
  },
  otherBubble: { 
    backgroundColor: '#1F1F1F', 
    borderBottomLeftRadius: 4 
  },
  senderName: { color: '#6366F1', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myText: { color: '#FFF' },
  otherText: { color: '#E0E0E0' },
  metaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    marginTop: 4 
  },
  metaText: { fontSize: 11 },
  myMetaText: { color: 'rgba(255,255,255,0.6)' },
  otherMetaText: { color: 'rgba(255,255,255,0.4)' },
  tickText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginLeft: 4 },
  seenTick: { color: '#4ADE80' }, // Green tick for seen
  inputArea: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A'
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  input: { 
    flex: 1, 
    color: '#FFF', 
    minHeight: 40, 
    maxHeight: 100, 
    paddingTop: 12, 
    paddingBottom: 12,
    fontSize: 16
  },
  sendBtn: { 
    backgroundColor: '#6366F1', 
    height: 36, 
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    borderRadius: 18, 
    marginBottom: 4,
    marginLeft: 8
  },
  sendBtnDisabled: { backgroundColor: '#333' },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  // Skeleton Styles
  skeletonBubble: {
    height: 44,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#1A1A1A'
  },
  skeletonMyBubble: {
    width: '60%',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  skeletonOtherBubble: {
    width: '70%',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4
  }
});
