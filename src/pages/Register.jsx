import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './Auth.css';
import registerimg from '../assets/registerimg.png';
import { auth, googleProvider, database } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Reuse Unicorn Script for background consistency
    useEffect(() => {
        const src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js";

        const initUnicorn = () => {
            if (window.UnicornStudio) {
                window.UnicornStudio.init();
            }
        };

        let script = document.querySelector(`script[src="${src}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = src;
            script.onload = initUnicorn;
            document.body.appendChild(script);
        } else {
            setTimeout(initUnicorn, 100);
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Save user to Firestore
            await setDoc(doc(database, "users", userCredential.user.uid), {
                name: name,
                email: email,
                createdAt: new Date()
            });

            await signOut(auth); // Force sign out so they have to login
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Save user to Firestore (using merge: true to avoid overwriting existing data if they sign in again)
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
                            Register
                        </button>
                    </form>

                    <div className="google-signin-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p>OR</p>
                        <button
                            type="button"
                            className="auth-button google-btn"
                            onClick={handleGoogleRegister}
                            style={{ backgroundColor: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: '20px', height: '20px' }} />
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
