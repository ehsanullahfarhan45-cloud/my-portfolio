import { getAuthInstance, getFirestoreDb, isFirebaseConfigured } from './firebase'

const ensureFirebase = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add your environment variables to access the admin panel.')
  }

  const [auth, db] = await Promise.all([getAuthInstance(), getFirestoreDb()])

  if (!auth || !db) {
    throw new Error('Firebase is not configured. Add your environment variables to access the admin panel.')
  }

  return { auth, db }
}

const normalizeDocument = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
})

const sortByOrder = (items) =>
  [...items].sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999))

export async function signInAdmin(email, password) {
  const { auth } = await ensureFirebase()
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signOutAdmin() {
  const { auth } = await ensureFirebase()
  const { signOut } = await import('firebase/auth')
  await signOut(auth)
}

export async function resetAdminPassword(email) {
  const { auth } = await ensureFirebase()
  const { sendPasswordResetEmail } = await import('firebase/auth')
  await sendPasswordResetEmail(auth, email)
}

export async function changeAdminPassword(newPassword) {
  const { auth } = await ensureFirebase()
  const { updatePassword } = await import('firebase/auth')

  if (!auth.currentUser) {
    throw new Error('Admin session expired. Please log in again.')
  }

  await updatePassword(auth.currentUser, newPassword)
}

export async function getAdminData() {
  const { db } = await ensureFirebase()
  const { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } = await import('firebase/firestore')

  const profileRef = doc(db, 'profile', 'main')

  const [profileSnap, skillsSnap, experienceSnap, educationSnap, projectsSnap, messagesSnap] = await Promise.all([
    getDoc(profileRef),
    getDocs(query(collection(db, 'skills'), orderBy('order', 'asc'))),
    getDocs(query(collection(db, 'experience'), orderBy('order', 'asc'))),
    getDocs(query(collection(db, 'education'), orderBy('order', 'asc'))),
    getDocs(query(collection(db, 'projects'), orderBy('order', 'asc'))),
    getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')))
  ])

  return {
    profile: profileSnap.exists() ? normalizeDocument(profileSnap) : null,
    skills: sortByOrder(skillsSnap.docs.map(normalizeDocument)),
    experience: sortByOrder(experienceSnap.docs.map(normalizeDocument)),
    education: sortByOrder(educationSnap.docs.map(normalizeDocument)),
    projects: sortByOrder(projectsSnap.docs.map(normalizeDocument)),
    messages: messagesSnap.docs.map(normalizeDocument)
  }
}

export async function saveProfile(profileData) {
  const { db } = await ensureFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db, 'profile', 'main'), profileData, { merge: true })
}

export async function createCollectionItem(collectionName, payload) {
  const { db } = await ensureFirebase()
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')

  await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp()
  })
}

export async function updateCollectionItem(collectionName, itemId, payload) {
  const { db } = await ensureFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, collectionName, itemId), payload)
}

export async function deleteCollectionItem(collectionName, itemId) {
  const { db } = await ensureFirebase()
  const { deleteDoc, doc } = await import('firebase/firestore')
  await deleteDoc(doc(db, collectionName, itemId))
}

export async function saveMessage(message) {
  const { db } = await ensureFirebase()
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')

  await addDoc(collection(db, 'messages'), {
    ...message,
    createdAt: serverTimestamp()
  })
}
