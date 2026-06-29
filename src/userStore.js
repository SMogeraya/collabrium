import { create } from 'zustand';
import { doc, getDoc, collection, addDoc, onSnapshot, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const useUserStore = create((set, get) => ({
  currentUser: null,
  isLoading: true,
  notes: [],
  reminders: [],
  notesUnsubscribe: () => {},
  remindersUnsubscribe: () => {},

  fetchUserInfo: async (uid) => {
    if (!uid) {
      get().notesUnsubscribe();
      get().remindersUnsubscribe();
      return set({ currentUser: null, isLoading: false, notes: [], reminders: [] });
    }

    set({ isLoading: true });
    try {
      const docRef = doc(db, "persons", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ currentUser: { ...userData, uid: docSnap.id, role: userData.role || 'user' } });
      } else {
        set({ currentUser: null });
      }
    } catch (err) {
      console.log(err);
      set({ currentUser: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotes: (uid) => {
    const notesQuery = query(collection(db, "notes"), where("uid", "==", uid));
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      set({ notes });
    });
    set({ notesUnsubscribe: unsubscribe });
    return unsubscribe;
  },

  addNote: async (note) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "notes"), {
        ...note,
        uid: currentUser.uid,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Error adding note:", err);
    }
  },

  updateNote: async (updatedNote) => {
    const { id, ...data } = updatedNote;
    try {
      await updateDoc(doc(db, "notes", id), data);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  },

  deleteNote: async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  },

  fetchReminders: (uid) => {
    const remindersQuery = query(collection(db, "reminders"), where("uid", "==", uid));
    const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
      const reminders = snapshot.docs
        .map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate ? data.date.toDate() : new Date(data.date)
            }
        })
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      set({ reminders });
    });
    set({ remindersUnsubscribe: unsubscribe });
    return unsubscribe;
  },

  addReminder: async (reminder) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "reminders"), {
        ...reminder,
        uid: currentUser.uid,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Error adding reminder:", err);
    }
  },

  deleteReminder: async (id) => {
    try {
      await deleteDoc(doc(db, "reminders", id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  },

  updateReminder: async (updatedReminder) => {
    const { id, ...data } = updatedReminder;
    try {
      await updateDoc(doc(db, "reminders", id), data);
    } catch (err) {
      console.error("Error updating reminder:", err);
    }
  },
}));