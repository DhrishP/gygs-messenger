import React, { useEffect } from 'react';
import { Alert, TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

/**
 * Custom hook to manage the navigation header for group chats.
 * It sets a headerRight button showing the number of participants and
 * opens an alert with the participant list when pressed.
 *
 * @param isGroup - whether the current screen is showing a group chat
 * @param participants - array of participant IDs (or usernames) for the group
 * @param navigation - navigation object from React Navigation stack
 */
export default function useGroupHeader(
  isGroup: boolean,
  participants: string[] | undefined,
  navigation: NativeStackNavigationProp<RootStackParamList, any>
): void {
  useEffect(() => {
    if (isGroup && participants && participants.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => Alert.alert('Group Members', participants.join(', ') || '')}
            style={{ padding: 8 }}
          >
            <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>👥 {participants.length}</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [isGroup, participants, navigation]);
}
