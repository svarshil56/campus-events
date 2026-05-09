import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { database } from "../services/firebase";

/**
 * Logs a unique activity for a user on the current day.
 * Uses a composite ID (date_uid) to ensure uniqueness per user per day.
 */
export const logActivity = async (uid) => {
    if (!uid) return;
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const activityRef = doc(database, "daily_activity", `${today}_${uid}`);
        await setDoc(activityRef, {
            uid,
            date: today,
            timestamp: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.warn("Failed to log activity:", error);
    }
};
