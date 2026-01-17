import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './Auth.css';
import loginimg from '../assets/loginimg.png'
import { auth, googleProvider, database } from '../services/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const scriptId = 'unicorn-studio-script';
        const src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js";

        // Helper to init
        const initUnicorn = () => {
            if (window.UnicornStudio) {
                window.UnicornStudio.init();
            }
        };

        // Check if script exists
        let script = document.querySelector(`script[src="${src}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = src;
            script.onload = initUnicorn;
            document.body.appendChild(script);
        } else {
            // Script already exists, try to init immediately
            // (Use timeout to ensure DOM is ready or let stack clear)
            setTimeout(initUnicorn, 100);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/home'); // Redirect to home or dashboard
        } catch (err) {
            console.error("Login Error:", err.code, err.message);
            // Custom Error Messaging
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                // Note: 'auth/invalid-credential' is often returned for both in newer SDKs for security
                setError('Incorrect password or email.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No user found with this email. Please register first.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else {
                setError('Failed to login. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Save/Merge user data to Firestore
            await setDoc(doc(database, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                lastLogin: new Date()
            }, { merge: true });

            navigate('/home');
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
                    {error && <p className="auth-error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
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
