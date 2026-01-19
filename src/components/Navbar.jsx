import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoImg from '../assets/logo.png';
import homeTextImg from '../assets/home_text.png';
import aboutTextImg from '../assets/about_text.png';
import aboutSignOutImg from '../assets/signout.png';
import loginTextImg from '../assets/login_text.png';
import registerTextImg from '../assets/register_text.png';
import eventsTextImg from '../assets/Events.png';
import addEventTextImg from '../assets/AddEvent.png';
import { auth, database } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(database, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    }
                } catch (e) {
                    console.error("Error fetching role", e);
                }
            } else {
                setRole(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <nav className="landing-nav">
            <div className="logo-container">
                <img src={logoImg} alt="DAU Events" className="logo-img" />
            </div>
            <ul className="nav-links">
                <li>
                    <NavLink
                        to="/home"
                        end
                        className={({ isActive }) => (isActive && location.hash !== '#events' ? 'active' : '')}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/home');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <img src={homeTextImg} alt="Home" className="nav-img-link" />
                    </NavLink>
                </li>
                <li><NavLink to="/about"><img src={aboutTextImg} alt="About" className="nav-img-link" /></NavLink></li>
                {user && role === 'organizer' && (
                    <li><NavLink to="/add-event"><img src={addEventTextImg} alt="Add Event" className="nav-img-link" /></NavLink></li>
                )}

                {!user && (
                    <>
                        <li><NavLink to="/login"><img src={loginTextImg} alt="Login" className="nav-img-link" /></NavLink></li>
                        <li><NavLink to="/register"><img src={registerTextImg} alt="Register" className="nav-img-link" /></NavLink></li>
                    </>
                )}

                <li>
                    <NavLink
                        to="/home#events"
                        className={() => (location.pathname === '/home' && location.hash === '#events' ? 'active' : '')}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/home#events');
                            // Ensure scroll happens if we are already on the page
                            const element = document.getElementById('events');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        <img src={eventsTextImg} alt="Events" className="nav-img-link" />
                    </NavLink>
                </li>
            </ul>

            <div className="right-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user && (
                    <button
                        onClick={handleSignOut}
                        className="signout-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                        }}
                    >
                        <img src={aboutSignOutImg} alt="Sign Out" className="nav-img-link" />
                    </button>
                )}
                <div className="social-icons">
                    <div className="social-icon">f</div>
                    <div className="social-icon">📷</div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
