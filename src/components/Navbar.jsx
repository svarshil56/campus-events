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
import creditsTextImg from '../assets/getcredits.png';
import dashboardTextImg from '../assets/dashboard.png';
import becomeOrganizerTextImg from '../assets/hostevent.png';
import myEventsTextImg from '../assets/myeve.png';
import addEventTextImg from '../assets/AddEvent.png';
import { auth, database } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [credits, setCredits] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Use onSnapshot for real-time updates
                const { onSnapshot } = await import('firebase/firestore');
                const userRef = doc(database, "users", currentUser.uid);

                const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setRole(data.role);
                        if (data.role === 'organizer') {
                            const limit = data.eventLimit || 2;
                            const created = data.eventsCreated || 0;
                            setCredits(limit - created);
                        } else {
                            setCredits(null);
                        }
                    }
                });

                // Cleanup snapshot listener when auth state changes or component unmounts
                return () => unsubscribeSnapshot();
            } else {
                setRole(null);
                setCredits(null);
            }
        });
        return () => unsubscribeAuth();
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
                {user && role === 'student' && (
                    <>
                        <li>
                            <NavLink to="/become-organizer" className={({ isActive }) => (isActive ? 'nav-text-link active' : 'nav-text-link')}>
                                <img src={becomeOrganizerTextImg} alt="Become Organizer" className="nav-img-link" />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/my-events" className={({ isActive }) => (isActive ? 'nav-text-link active' : 'nav-text-link')}>
                                <img src={myEventsTextImg} alt="My Events" className="nav-img-link" />
                            </NavLink>
                        </li>
                    </>
                )}
                {user && role === 'organizer' && (
                    <>
                        <li><NavLink to="/add-event"><img src={addEventTextImg} alt="Add Event" className="nav-img-link" /></NavLink></li>
                        <li>
                            <NavLink to="/organizer/request-credits" className={({ isActive }) => (isActive ? 'nav-highlight-link active' : 'nav-highlight-link')}>
                                <img src={creditsTextImg} alt="Get Credits" className="nav-img-link" />
                                {credits !== null && <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>({credits} Left)</span>}
                            </NavLink>
                        </li>
                    </>
                )}
                {user && role === 'admin' && (
                    <li>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            <img src={dashboardTextImg} alt="Dashboard" className="nav-img-link" />
                        </NavLink>
                    </li>
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
