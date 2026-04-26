import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from './src/api';

import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import LoginScreen from './src/screens/LoginScreen';

export type RootStackParamList = {
  Login: { onLogin: (id: string) => void };
  Conversations: { userId: string; onLogout: () => void };
  Chat: { conversationId: string; userId: string; otherUserId: string; isGroup?: boolean; participants?: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        let storedId = await AsyncStorage.getItem('messenger_user_id');
        if (storedId) {
          await registerUser(storedId);
          setUserId(storedId);
        }
      } catch (e) {
        console.error('Auth Init Error:', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = (id: string) => {
    setUserId(id);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('messenger_user_id');
    setUserId(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#0A0A0A' }
          }}
        >
          {!userId ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              initialParams={{ onLogin: handleLogin }}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Conversations" 
                component={ConversationsScreen} 
                initialParams={{ userId, onLogout: handleLogout }}
                options={{ title: 'Messages' }}
              />
              <Stack.Screen 
                name="Chat" 
                component={ChatScreen} 
                options={({ route }) => ({ title: route.params.otherUserId || 'Chat' })}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
