import React from 'react';
import Navbar from '../components/Navbar';
import AboutImage from '../assets/about.png';
import './About.css';

const About = () => {
    return (
        <div className="about-page-wrapper">
            <div className="navbar-wrapper">
                <Navbar />
            </div>

            <div className="about-container">
                <img src={AboutImage} alt="About Us" className="about-image" />
                <div className="about-text">
                    <div className="about-intro">
                        <p>
                            DAU Events is a centralized platform built to showcase and organize the vibrant student activities that shape life at DA-IICT. Our campus hosts a wide spectrum of cultural, technical, and professional events throughout the year, and DAU Events brings them all together in one accessible space.
                        </p>
                        <p>
                            From awareness campaigns to national-level festivals, every event contributes to the unique identity of the DA-IICT community.
                        </p>
                    </div>

                    <div className="about-section">
                        <h2>A Campus Full of Experiences</h2>
                        <p>Over the past year alone, DA-IICT has witnessed a diverse lineup of flagship events that reflect the talent, creativity, and passion of its students and clubs:</p>
                        <ul className="about-list">
                            <li><strong>Pre-Synapse & Synapse</strong> — The annual cultural and tech festival that brings together competitions, showcases, concerts, and workshops with participation from across India.</li>
                            <li><strong>TEDxDAIICT</strong> — A platform where speakers from varied disciplines share ideas that inspire, challenge, and spark discussions.</li>
                            <li><strong>iFest</strong> — A technical festival driven by innovation, coding, and problem-solving with hackathons, robotics, and tech competitions.</li>
                            <li><strong>Concours</strong> — A competitive programming and algorithmic contest series that tests logic, speed, and precision.</li>
                            <li><strong>Tarang</strong> — A cultural celebration that highlights artistic talent through music, dance, drama, and creative expression.</li>
                        </ul>
                        <p className="about-note">These events — along with countless club activities, workshops, guest lectures, intra-campus contests, and awareness campaigns — define the DA-IICT ecosystem beyond the classroom.</p>
                    </div>

                    <div className="about-section">
                        <h2>Why DAU Events?</h2>
                        <p>Despite the volume of events happening on campus, information is often scattered across different platforms and social channels. DAU Events solves that by providing:</p>
                        <ul className="about-features-list">
                            <li>A centralized event discovery platform</li>
                            <li>Easy access to event details, schedules, and registration</li>
                            <li>Categorized listings (Technical, Cultural, Sports, Workshops, etc.)</li>
                            <li>Highlights of flagship festivals and club activities</li>
                            <li>A record of past events and achievements</li>
                        </ul>
                        <p className="about-note">Whether you’re a first-year looking to explore the culture or a senior tracking deadlines and registrations, DAU Events ensures you never miss out.</p>
                    </div>

                    <div className="about-section">
                        <h2>Built for the DA-IICT Community</h2>
                        <p>The platform is designed to serve:</p>
                        <ul className="about-community-list">
                            <li><strong>Students</strong>, who want to participate, compete, perform, or volunteer</li>
                            <li><strong>Clubs & Committees</strong>, who need a structured way to publicize their events</li>
                            <li><strong>Newcomers</strong>, who want to understand campus life beyond academics</li>
                            <li><strong>Visitors & Alumni</strong>, who love staying connected with campus culture</li>
                        </ul>
                    </div>

                    <p className="about-footer-text">
                        DAU Events is not just a website — it’s a window into the energy, ideas, and experiences that define DA-IICT.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
