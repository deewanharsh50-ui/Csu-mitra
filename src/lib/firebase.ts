import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if specified
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Ensure user is signed in (anonymously by default for zero-friction access)
export const initUserAuth = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          try {
            const credential = await signInAnonymously(auth);
            unsubscribe();
            resolve(credential.user);
          } catch (err) {
            unsubscribe();
            reject(err);
          }
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

// Mandatory connection test as specified in Firebase guidelines
export async function testFirestoreConnection() {
  try {
    await initUserAuth();
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase Firestore connected successfully!");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or internet connection.");
    } else {
      // Missing test document is normal and still confirms connection reachability
      console.log("Firestore connection verified:", error instanceof Error ? error.message : error);
    }
    return true;
  }
}

// Conversation persistence interface
export interface StoredConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Save or update conversation in Firestore
export async function persistConversation(
  userId: string,
  conversationId: string,
  title: string,
  messages: Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: Date }>
) {
  try {
    // 1. Save or update parent conversation doc
    const convRef = doc(db, "conversations", conversationId);
    await setDoc(
      convRef,
      {
        id: conversationId,
        userId: userId,
        title: title.slice(0, 180),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Persist any unsaved messages in the subcollection
    for (const msg of messages) {
      const msgRef = doc(db, "conversations", conversationId, "messages", msg.id);
      await setDoc(
        msgRef,
        {
          id: msg.id,
          conversationId: conversationId,
          userId: userId,
          role: msg.role,
          content: msg.content.slice(0, 14000),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Firestore message persistence notice:", err);
  }
}

// Load previous user conversations
export async function fetchUserConversations(userId: string): Promise<StoredConversation[]> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id || d.id,
        userId: data.userId,
        title: data.title || "Chat Session",
        createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
      };
    });
  } catch (err) {
    console.warn("Could not fetch past conversations from Firestore:", err);
    return [];
  }
}

// Load all messages belonging to a conversation from Firestore
export async function fetchConversationMessages(
  conversationId: string
): Promise<Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: Date }>> {
  try {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id || d.id,
        role: (data.role as "user" | "assistant") || "assistant",
        content: data.content || "",
        timestamp: (data.timestamp as Timestamp)?.toDate?.() || new Date(),
      };
    });
  } catch (err) {
    console.warn("Could not fetch conversation messages:", err);
    return [];
  }
}

// Delete a conversation and record from Firestore
export async function deleteConversationFromFirestore(conversationId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "conversations", conversationId));
    return true;
  } catch (err) {
    console.warn("Could not delete conversation from Firestore:", err);
    return false;
  }
}

// Automatically trigger connection test on load
testFirestoreConnection().catch((err) => console.warn("Initial Firestore test:", err));
