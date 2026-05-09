import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './Auth.css';
import registerimg from '../assets/registerimg.png';
import { auth, googleProvider, database } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { usePageTransition } from '../transition/usePageTransition';
import { useUnicornScript } from '../hooks/useUnicornScript';
import { logActivity } from '../utils/activityLogger';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigateWithTransition = usePageTransition();

    // Initialize Unicorn Studio background
    useUnicornScript();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Send Verification Email
            await import('firebase/auth').then(mod => mod.sendEmailVerification(userCredential.user));

            // Save user to Firestore
            await setDoc(doc(database, "users", userCredential.user.uid), {
                name: name,
                email: email,
                role: 'student',
                createdAt: new Date()
            });

            await logActivity(userCredential.user.uid);

            await signOut(auth); // Force sign out so they have to login
            alert("Account created! PLEASE CHECK YOUR EMAIL to verify your account before logging in.");
            navigateWithTransition('/login', { transitionText: "INITIALIZING SUBJECT" });
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please login instead.');
            } else {
                setError(err.message);
            }
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists to prevent overwriting roles
            const userRef = doc(database, "users", user.uid);
            const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(userRef));

            if (!userSnap.exists()) {
                // New User: Create with default 'student' role
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    role: 'student',
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } else {
                // Existing User: Just update lastLogin
                await setDoc(userRef, {
                    lastLogin: new Date()
                }, { merge: true });
            }

            navigateWithTransition('/home');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page-container">
            {/* Same Background as Login */}
            <div
                data-us-project="bfb8dnwTbDCEurXkXb5I"
                className="unicorn-bg-layer"
            ></div>

            <div className="navbar-wrapper">
                <Navbar />
            </div>
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <h2 className="auth-heading">Join the Party</h2>
                    {error && <p className="auth-error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <form className="auth-form" onSubmit={handleRegister}>
                        <div className="auth-form-group">
                            <label className="auth-label">Full Name</label>
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Dustin Henderson"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Email</label>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="stranger@daw.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Password</label>
                            <div className="password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-button">
                            Register
                        </button>
                    </form>

                    <div className="google-signin-container" style={{ textAlign: 'center', marginTop: '0rem' }}>
                        <p>OR</p>
                        <button
                            type="button"
                            className="auth-button google-btn"
                            onClick={handleGoogleRegister}
                            style={{ backgroundColor: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: '20px', height: '15px' }} />
                            Sign up with Google
                        </button>
                    </div>
                </div>
                <div className="auth-side-image">
                    <img src={registerimg} alt="Register Illustration" />
                </div>
            </div>

            {/* Custom Footer replacing Unicorn Badge */}
            <div className="vecna-footer">
                Vecna sees everything
            </div>
        </div>
    );
};

export default Register;
