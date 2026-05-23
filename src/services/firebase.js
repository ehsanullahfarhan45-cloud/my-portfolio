const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const isFirebaseConfigured = () => Object.values(firebaseConfig).every(Boolean)

let appPromise = null
let authPromise = null
let dbPromise = null

async function loadFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null
  }

  if (!appPromise) {
    const { initializeApp } = await import('firebase/app')
    appPromise = initializeApp(firebaseConfig)
  }

  return appPromise
}

export async function getFirebaseApp() {
  return loadFirebaseApp()
}

export async function getAuthInstance() {
  if (!isFirebaseConfigured()) {
    return null
  }

  if (!authPromise) {
    authPromise = Promise.all([loadFirebaseApp(), import('firebase/auth')]).then(([app, { getAuth }]) => getAuth(app))
  }

  return authPromise
}

export async function getFirestoreDb() {
  if (!isFirebaseConfigured()) {
    return null
  }

  if (!dbPromise) {
    dbPromise = Promise.all([loadFirebaseApp(), import('firebase/firestore')]).then(([app, { getFirestore }]) => getFirestore(app))
  }

  return dbPromise
}

export { isFirebaseConfigured }
