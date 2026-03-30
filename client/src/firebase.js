// Firebase configuration for TB Adherence App
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

// ✅ Your Real Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBwwlNYu5iaP27CPKisoNpSzySXTL0TpmM",
  authDomain: "tb-adherence-app.firebaseapp.com",
  projectId: "tb-adherence-app",
  storageBucket: "tb-adherence-app.firebasestorage.app",
  messagingSenderId: "682860102480",
  appId: "1:682860102480:web:ea0eb0b558249ceae9a255"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const firestore = getFirestore(app);

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const auth = {
  currentUser: null,

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(firebaseAuth, callback);
  },

  signInWithEmailAndPassword: async (email, password) => {
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);

    const userDoc = await getDoc(doc(firestore, "users", result.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const user = {
      uid: result.user.uid,
      email: result.user.email,
      name: userData.name || email,
      userType: userData.userType || "patient",
      ...userData
    };

    auth.currentUser = user;
    return { user };
  },

  createUserWithEmailAndPassword: async (email, password, extraData = {}) => {
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    const userData = {
      uid: result.user.uid,
      email,
      name: extraData.name || "New User",
      userType: extraData.userType || "patient",
      createdAt: serverTimestamp(),
      currentStreak: 0,
      totalDays: 0,
      badges: [],
      language: "en"
    };

    await setDoc(doc(firestore, "users", result.user.uid), userData);

    if (userData.userType === "patient") {
      await setDoc(doc(firestore, "patients", result.user.uid), {
        ...userData,
        treatmentStartDate: serverTimestamp(),
        lastMedication: null,
        doctorId: extraData.doctorId || null
      });
    }

    if (userData.userType === "doctor") {
      await setDoc(doc(firestore, "doctors", result.user.uid), {
        ...userData
      });
    }

    auth.currentUser = userData;
    return { user: userData };
  },

  signOut: async () => {
    await firebaseSignOut(firebaseAuth);
    auth.currentUser = null;
  }
};

// ─────────────────────────────────────────────
// DB
// ─────────────────────────────────────────────
export const db = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: (data) =>
        setDoc(doc(firestore, collectionName, docId), data),

      get: async () => {
        const snap = await getDoc(doc(firestore, collectionName, docId));
        return {
          exists: snap.exists(),
          data: () => snap.data() || null
        };
      },

      update: (data) =>
        updateDoc(doc(firestore, collectionName, docId), data)
    }),

    add: (data) =>
      addDoc(collection(firestore, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      }),

    where: (field, operator, value) => ({
      get: async () => {
        const q = query(
          collection(firestore, collectionName),
          where(field, operator, value)
        );
        const snap = await getDocs(q);
        return {
          docs: snap.docs.map((d) => ({
            id: d.id,
            data: () => d.data()
          }))
        };
      }
    }),

    get: async () => {
      const snap = await getDocs(collection(firestore, collectionName));
      return {
        docs: snap.docs.map((d) => ({
          id: d.id,
          data: () => d.data()
        }))
      };
    }
  })
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const logMedication = async (patientId, taken = true) => {
  const today = new Date().toISOString().split("T")[0];
  const logId = `${patientId}_${today}`;

  await setDoc(doc(firestore, "medication_logs", logId), {
    patientId,
    date: today,
    taken,
    timestamp: serverTimestamp()
  });

  await updateDoc(doc(firestore, "patients", patientId), {
    lastMedication: serverTimestamp()
  });
};

export const getPatientsForDoctor = async (doctorId) => {
  const q = query(
    collection(firestore, "patients"),
    where("doctorId", "==", doctorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getMedicationLogs = async (patientId) => {
  const q = query(
    collection(firestore, "medication_logs"),
    where("patientId", "==", patientId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─────────────────────────────────────────────
// SEED DATA (UPDATED EMAILS)
// ─────────────────────────────────────────────
export const initializeMockData = async () => {
  const alreadySeeded = localStorage.getItem("firestoreSeeded");
  if (alreadySeeded) return;

  const demoPatients = [
    {
      uid: "patient1",
      email: "dhimanayush025@gmail.com", // ✅ updated
      name: "John Doe",
      userType: "patient",
      doctorId: "doctor1",
      currentStreak: 7,
      totalDays: 45,
      badges: ["7-Day Streak", "Early Bird"],
      language: "en",
      treatmentStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      lastMedication: new Date().toISOString()
    },
    {
      uid: "patient2",
      email: "priya@demo.com",
      name: "Priya Sharma",
      userType: "patient",
      doctorId: "doctor1",
      currentStreak: 3,
      totalDays: 30,
      badges: ["Getting Started"],
      language: "hi",
      treatmentStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastMedication: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const patient of demoPatients) {
    const ref = doc(firestore, "patients", patient.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, patient);
    }
  }

  const doctorRef = doc(firestore, "doctors", "doctor1");
  const doctorSnap = await getDoc(doctorRef);
  if (!doctorSnap.exists()) {
    await setDoc(doctorRef, {
      uid: "doctor1",
      email: "aadilkhanxxxx@gmail.com", // ✅ updated
      name: "Dr. Sarah Smith",
      userType: "doctor"
    });
  }

  localStorage.setItem("firestoreSeeded", "true");
};

export { firebaseAuth, firestore };
export default app;