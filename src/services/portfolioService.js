import { getFirestoreDb, isFirebaseConfigured } from './firebase'

const ensureFirebase = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add your Firestore environment variables to enable the portfolio.')
  }

  const db = await getFirestoreDb()

  if (!db) {
    throw new Error('Firebase is not configured. Add your Firestore environment variables to enable the portfolio.')
  }

  return db
}

const normalizeDocument = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
})

const sortByOrder = (items) =>
  [...items].sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999))

const normalizeFirestoreError = (error) => {
  const message = error?.message || ''

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return new Error('You appear to be offline. Please reconnect to the internet and try again.')
  }

  if (/offline|network|failed to fetch|aborted/i.test(message)) {
    return new Error('Firebase could not be reached. Check your internet connection and try again.')
  }

  if (error?.code === 'permission-denied') {
    return new Error('Firebase permissions are blocking access to the portfolio data.')
  }

  if (error?.code === 'unavailable') {
    return new Error('Firebase is temporarily unavailable. Please try again in a moment.')
  }

  return error instanceof Error ? error : new Error(message || 'An unexpected Firebase error occurred.')
}

export async function loadPortfolioData() {
  try {
    const db = await ensureFirebase()
    const { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } = await import('firebase/firestore')

    const profileRef = doc(db, 'profile', 'main')
    const skillsRef = query(collection(db, 'skills'), orderBy('order', 'asc'))
    const experienceRef = query(collection(db, 'experience'), orderBy('order', 'asc'))
    const educationRef = query(collection(db, 'education'), orderBy('order', 'asc'))
    const projectsRef = query(collection(db, 'projects'), orderBy('order', 'asc'))

    const [profileSnap, skillsSnap, experienceSnap, educationSnap, projectsSnap] = await Promise.all([
      getDoc(profileRef),
      getDocs(skillsRef),
      getDocs(experienceRef),
      getDocs(educationRef),
      getDocs(projectsRef)
    ])

    return {
      profile: profileSnap.exists() ? normalizeDocument(profileSnap) : null,
      skills: sortByOrder(skillsSnap.docs.map(normalizeDocument)),
      experience: sortByOrder(experienceSnap.docs.map(normalizeDocument)),
      education: sortByOrder(educationSnap.docs.map(normalizeDocument)),
      projects: sortByOrder(projectsSnap.docs.map(normalizeDocument))
    }
  } catch (error) {
    throw normalizeFirestoreError(error)
  }
}

export async function submitContactMessage(message) {
  try {
    const db = await ensureFirebase()
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')

    await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    throw normalizeFirestoreError(error)
  }
}
