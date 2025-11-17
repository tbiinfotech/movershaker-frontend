// src/services/presence.js
import { database } from './firebase';
import { ref, onValue, set, onDisconnect } from 'firebase/database';

export class PresenceService {
  static initialize(userId) {
    const connectedRef = ref(database, '.info/connected');
    const userStatusRef = ref(database, `users/${userId}/status`);
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userStatusRef, 'online');
        onDisconnect(userStatusRef).set('offline');
      }
    });
  }

  static subscribeToUserStatus(userId, callback) {
    const statusRef = ref(database, `users/${userId}/status`);
    return onValue(statusRef, (snapshot) => callback(snapshot.val()));
  }
}