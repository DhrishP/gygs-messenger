import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getConversations, createConversation } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversations'>;

export default function ConversationsScreen({ navigation, route }: Props) {
  const { userId, onLogout } = route.params;
  const [conversations, setConversations] = useState<any[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const data = await getConversations(userId);
      setConversations(data);
    } catch (e) {
      console.error('Error fetching conversations', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      return () => {};
    }, [userId])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, onLogout]);

  const handleStartConversation = async () => {
    if (!newUserId.trim()) return;
    try {
      const conv = await createConversation(userId, newUserId.trim());
      navigation.navigate('Chat', { conversationId: conv.id, userId, otherUserId: newUserId.trim() });
      setNewUserId('');
    } catch (e) {
      console.error('Error starting conversation', e);
    }
  };

  const renderSkeleton = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const otherUser = item.participants.find((p: string) => p !== userId) || item.participants[0];
    
    // Generate a color based on username for avatar
    const avatarColor = `hsl(${otherUser.length * 40}, 70%, 50%)`;

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.id, 
          userId, 
          otherUserId: otherUser 
        })}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{otherUser.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{otherUser}</Text>
            {item.last_timestamp && (
              <Text style={styles.timestampText}>
                {new Date(item.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.last_message || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.greeting}>Logged in as: <Text style={{color: '#6366F1'}}>{userId}</Text></Text>
      </View>
      
      <View style={styles.newChatContainer}>
        <TextInput
          style={styles.input}
          placeholder="New chat (enter User ID)"
          placeholderTextColor="#666"
          value={newUserId}
          onChangeText={setNewUserId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.startBtn} onPress={handleStartConversation}>
          <Text style={styles.startBtnText}>Start</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        renderSkeleton()
      ) : conversations.length === 0 ? (
        <Text style={styles.emptyText}>No conversations yet.</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  headerArea: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  greeting: { fontSize: 14, color: '#A0A0A0', fontWeight: '500' },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
  newChatContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    marginBottom: 10 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    color: '#FFF', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 24, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  startBtn: { 
    backgroundColor: '#6366F1', 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    borderRadius: 24 
  },
  startBtnText: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  itemContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1A1A1A' 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  itemContent: { flex: 1, justifyContent: 'center' },
  itemTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  itemSubtitle: { color: '#888', fontSize: 13, marginTop: 2 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestampText: { color: '#666', fontSize: 11 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
  
  // Skeleton Styles
  skeletonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1A1A1A' 
  },
  skeletonAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#1A1A1A', 
    marginRight: 16 
  },
  skeletonContent: { flex: 1 },
  skeletonTitle: { 
    width: '40%', 
    height: 14, 
    backgroundColor: '#1A1A1A', 
    borderRadius: 7, 
    marginBottom: 8 
  },
  skeletonSubtitle: { 
    width: '70%', 
    height: 12, 
    backgroundColor: '#1A1A1A', 
    borderRadius: 6 
  }
});
