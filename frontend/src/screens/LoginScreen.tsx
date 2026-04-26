import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../api';

export default function LoginScreen({ navigation, route }: any) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLogin } = route.params;

  const handleLogin = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    try {
      await registerUser(userId.trim());
      await AsyncStorage.setItem('messenger_user_id', userId.trim());
      onLogin(userId.trim());
    } catch (e) {
      console.error('Login Error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Messenger</Text>
        <Text style={styles.subtitle}>Enter a dummy username or ID to continue.</Text>
        
        <TextInput
          style={styles.input}
          placeholder="e.g. alice, bob123"
          placeholderTextColor="#888"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFF',
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366F1', // Indigo/Violet premium feel
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
