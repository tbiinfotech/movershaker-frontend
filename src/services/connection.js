import { database } from './firebase';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';

export class ConnectionManager {
  static initialize(userId) {
    const connectedRef = ref(database, '.info/connected');
    const userStatusRef = ref(database, `users/${userId}/status`);
    const lastOnlineRef = ref(database, `users/${userId}/lastOnline`);

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userStatusRef, 'online');
        set(lastOnlineRef, serverTimestamp());

        onDisconnect(userStatusRef).set('offline');
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      } else {
        set(userStatusRef, 'offline');
        set(lastOnlineRef, serverTimestamp());
      }
    });
  }

  static async handleConnectionError(callback) {
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
      if (snap.val() === false) {
        callback('disconnected');
      } else {
        callback('connected');
      }
    });
  }
}