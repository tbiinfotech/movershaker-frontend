import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getMessaging, getToken } from 'firebase/messaging' // ✅ Import messaging

const firebaseConfig = {
  apiKey: 'AIzaSyCIIbuDYbDLEc0LLDfoyLHny5Pz1pRHAA4',
  authDomain: 'mas-app-version-2.firebaseapp.com',
  projectId: 'mas-app-version-2',
  storageBucket: 'mas-app-version-2.firebasestorage.app',
  messagingSenderId: '346291266048',
  appId: '1:346291266048:web:5833ace6ff89255566aee5',
  measurementId: 'G-SP3PYG7013',
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

const db = getFirestore(app)
const auth = getAuth(app)
const fireBaseAuth = getAuth(app)
const database = getDatabase(app)
const firestore = getFirestore(app)
const storage = getStorage(app)
const messaging = getMessaging(app)

export { fireBaseAuth, auth, db, database, firestore, storage, messaging }
