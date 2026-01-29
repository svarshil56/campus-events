import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './Auth.css';
import loginimg from '../assets/loginimg.png'
import { auth, googleProvider, database } from '../services/firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageTransition } from '../transition/usePageTransition';
import { useUnicornScript } from '../hooks/useUnicornScript';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For success messages
    const navigateWithTransition = usePageTransition();
    const navigate = useNavigate();

    // Initialize Unicorn Studio background
    useUnicornScript();

    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    useEffect(() => {
        // Redirect if already logged in
        if (auth.currentUser) {
            // Instant redirect, no transition needed or maybe just standard?
            // If user goes to /login while logged in, just bounce them back.
            navigate(from, { replace: true });
        }
    }, [navigate, from]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigateWithTransition(from, { replace: true, transitionText: "ACCESS GRANTED" });
        } catch (err) {
            console.error("Login Error:", err.code, err.message);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password or email.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No user found with this email. Please register first.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('Failed to login. Please try again.');
            }
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email first.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setMessage('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            try {
                // Check if user exists to prevent overwriting roles
                const userRef = doc(database, "users", user.uid);
                const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(userRef));

                if (!userSnap.exists()) {
                    // New User
                    await setDoc(userRef, {
                        name: user.displayName,
                        email: user.email,
                        role: 'student',
                        createdAt: new Date(),
                        lastLogin: new Date()
                    });
                } else {
                    // Existing User
                    await setDoc(userRef, {
                        lastLogin: new Date()
                    }, { merge: true });
                }
            } catch (firestoreError) {
                console.warn("Could not save user profile to Firestore:", firestoreError);
            }

            navigateWithTransition(from, { replace: true, transitionText: "ACCESS GRANTED" });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page-container">
            {/* Unicorn Studio Background */}
            <div
                data-us-project="bfb8dnwTbDCEurXkXb5I"
                className="unicorn-bg-layer"
            ></div>

            <div className="navbar-wrapper">
                <Navbar />
            </div>
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <h2 className="auth-heading">Login</h2>
                    {error && <p className="auth-error" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    {message && <p className="auth-success" style={{ color: '#4caf50', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}
                    <form className="auth-form" onSubmit={handleLogin}>
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
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#FFD700',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        textDecoration: 'underline',
                                        fontFamily: 'inherit',
                                        padding: 0
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="auth-button">
                            Enter the Portal
                        </button>
                    </form>

                    <div className="google-signin-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>OR</p>
                        <button
                            type="button"
                            className="auth-button google-btn"
                            onClick={handleGoogleLogin}
                            style={{ backgroundColor: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: '20px', height: '20px' }} />
                            Sign in with Google
                        </button>
                    </div>
                </div>
                <div className="auth-side-image">
                    <img src={loginimg} alt="Login Illustration" />
                </div>
            </div>

            {/* Custom Footer replacing Unicorn Badge */}
            <div className="vecna-footer">
                Vecna sees everything
            </div>
        </div>
    );
};
export default Login;
