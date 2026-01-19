import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    onSnapshot,
    runTransaction,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { auth, database } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../components/Navbar";

// Components
import HeroSection from "../components/EventDetails/HeroSection";
import DescriptionSection from "../components/EventDetails/DescriptionSection";
import StatsCard from "../components/EventDetails/StatsCard";

import "./EventDetails.css";

export default function EventDetails() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [regId, setRegId] = useState(null);

    const [user] = useAuthState(auth);

    // Fetch Event Data + Existing Registration
    useEffect(() => {
        // 1. Listen for event updates (Real-time)
        const eventRef = doc(database, "events", eventId);
        const unsubscribeEvent = onSnapshot(eventRef, (snap) => {
            if (!snap.exists()) {
                setNotFound(true);
            } else {
                setEvent(snap.data());
                // Reset notFound in case it was briefly true (optional)
                setNotFound(false);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching event:", error);
            setNotFound(true);
            setLoading(false);
        });

        // 2. Check if already registered (can remain one-time fetch or also be real-time)
        // For now, keeping registration check as one-time fetch for simplicity, 
        // as user's own registration status is less likely to change externally during the session.
        const checkRegistration = async () => {
            if (user) {
                const q = query(
                    collection(database, "events", eventId, "registrations"),
                    where("uid", "==", user.uid)
                );

                try {
                    const found = await getDocs(q);
                    if (!found.empty) {
                        const docSnap = found.docs[0];
                        setRegId(docSnap.id); // ex: REG-0042
                    }
                } catch (err) {
                    console.error("Error checking registration:", err);
                }
            }
        };

        checkRegistration();

        // Cleanup listener
        return () => unsubscribeEvent();
    }, [eventId, user]);

    const [processing, setProcessing] = useState(false);

    // Registration Handler
    async function handleRegister() {
        if (!user) return alert("Please login first!");
        if (regId) return alert("You are already registered!");
        if (processing) return;

        // Collect studentId (replace with modal later)
        const studentId = prompt("Enter your Student ID:");
        if (!studentId) return;

        setProcessing(true);

        const eventRef = doc(database, "events", eventId);

        try {
            await runTransaction(database, async (transaction) => {
                const eventSnap = await transaction.get(eventRef);
                if (!eventSnap.exists()) throw "Event does not exist!";

                const current = eventSnap.data().currentRegNo || 0;
                const next = current + 1;

                // Format: eventname_reg_0XX
                const padded = String(next).padStart(3, "0");
                const newRegId = `${eventId}_reg_${padded}`;

                const regRef = doc(
                    database,
                    "events",
                    eventId,
                    "registrations",
                    newRegId
                );

                transaction.set(regRef, {
                    regId: newRegId,
                    uid: user.uid,
                    name: user.displayName || "",
                    email: user.email,
                    studentId,
                    paid: false,
                    verified: false,
                    createdAt: serverTimestamp(),
                });

                transaction.update(eventRef, { currentRegNo: next });
                setRegId(newRegId);
            });

            alert("Registration Successful!");
        } catch (error) {
            console.error("Registration failed: ", error);
            alert("Registration failed: " + error.message);
        } finally {
            setProcessing(false);
        }
    }

    // UI States
    if (notFound)
        return (
            <div className="event-details-container">
                <h2>Event not found</h2>
            </div>
        );

    if (loading || !event)
        return (
            <div className="event-details-container">
                <h2>Loading...</h2>
            </div>
        );

    return (
        <div className="event-details-container">
            <Navbar />

            {/* Header */}
            <div className="event-header" style={{ marginTop: "30px" }}>
                <h1>{event.title}</h1>
            </div>

            {/* Main Content */}
            <div className="event-main">
                {/* LEFT */}
                <div className="event-left">
                    <HeroSection title={event.title} image={event.image} />
                    <DescriptionSection
                        description={event.description}
                        contact1={event.contact1}
                        contact2={event.contact2}
                    />
                </div>

                {/* RIGHT */}
                <div className="event-right">
                    <StatsCard
                        event={event}
                        user={user}
                        regId={regId}
                        processing={processing}
                        onRegister={handleRegister}
                    />
                </div>
            </div>
        </div>
    );
}
